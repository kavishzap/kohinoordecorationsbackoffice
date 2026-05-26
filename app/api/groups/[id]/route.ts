import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  GROUP_MEDIA_SLOTS,
  GROUP_OPTIONAL_MEDIA_SLOTS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  type GroupMediaSlot,
} from "@/lib/groups/constants";
import { groupObjectKey } from "@/lib/groups/keys";
import { dbGroupToRecord } from "@/lib/groups/server";
import type {
  DbDecorationGroup,
  PartialGroupFilesPayload,
} from "@/lib/groups/types";
import {
  extensionFromMime,
  parseOptionalGroupPrice,
} from "@/lib/groups/validation";
import { getR2Env } from "@/lib/r2/env";
import {
  createPresignedUploadUrl,
  deleteR2Object,
  deleteR2Objects,
} from "@/lib/r2/storage";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const SLOT_DB_KEY: Record<
  GroupMediaSlot,
  "front_key" | "inside_1_key" | "inside_2_key" | "video_key"
> = {
  front: "front_key",
  "inside-1": "inside_1_key",
  "inside-2": "inside_2_key",
  video: "video_key",
};

function validateFileDescriptor(
  slot: GroupMediaSlot,
  descriptor: PartialGroupFilesPayload[GroupMediaSlot] | undefined
): string | null {
  if (!descriptor?.contentType || !descriptor?.extension) {
    return `Missing file info for ${slot}.`;
  }

  const isVideo = slot === "video";
  const allowed = isVideo ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;
  if (!allowed.includes(descriptor.contentType as (typeof allowed)[number])) {
    return `Invalid type for ${slot}.`;
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (!descriptor.sizeBytes || descriptor.sizeBytes > maxSize) {
    return isVideo
      ? "Video must be 300MB or smaller."
      : "Each image must be 10MB or smaller.";
  }

  return null;
}

async function fetchOwnGroup(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  id: string
) {
  const { data, error } = await supabase
    .from("decoration_groups")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return {
        row: null as DbDecorationGroup | null,
        error:
          "Groups table is not set up. Run supabase/decoration-groups.sql in Supabase.",
        status: 503,
      };
    }
    return { row: null, error: error.message, status: 500 };
  }

  if (!data) {
    return { row: null, error: "Group not found.", status: 404 };
  }

  return { row: data as DbDecorationGroup, error: null, status: 200 };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!getR2Env().isConfigured) {
    return jsonError("R2 storage is not configured.", 503);
  }

  const { id } = await context.params;
  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  const fetched = await fetchOwnGroup(supabase, user.id, id);
  if (fetched.error) {
    return jsonError(fetched.error, fetched.status);
  }

  const existing = fetched.row!;

  let body: {
    name?: string;
    price?: number | string | null;
    files?: PartialGroupFilesPayload;
    removeSlots?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const name = body.name?.trim();
  if (!name) {
    return jsonError("Group name is required.", 400);
  }

  const price = parseOptionalGroupPrice(body.price);
  if (price === undefined) {
    return jsonError("Invalid price. Use a number or leave it empty.", 400);
  }

  const files = body.files ?? {};
  const slotsToReplace = GROUP_MEDIA_SLOTS.filter((slot) => files[slot]);

  for (const slot of slotsToReplace) {
    const validationError = validateFileDescriptor(slot, files[slot]);
    if (validationError) return jsonError(validationError, 400);
  }

  const removeSlots: GroupMediaSlot[] = [];
  for (const raw of body.removeSlots ?? []) {
    if (!GROUP_MEDIA_SLOTS.includes(raw as GroupMediaSlot)) {
      return jsonError(`Unknown media slot "${raw}".`, 400);
    }
    const slot = raw as GroupMediaSlot;
    if (
      !GROUP_OPTIONAL_MEDIA_SLOTS.includes(
        slot as (typeof GROUP_OPTIONAL_MEDIA_SLOTS)[number]
      )
    ) {
      return jsonError(`Cannot remove required media (${slot}).`, 400);
    }
    if (files[slot]) {
      return jsonError(`Cannot remove and replace ${slot} in one request.`, 400);
    }
    if (!removeSlots.includes(slot)) {
      removeSlots.push(slot);
    }
  }

  const updatePayload: Record<string, string | number | null> = {
    name,
    price,
  };

  const uploadUrls: Partial<Record<GroupMediaSlot, string>> = {};
  const oldKeysToDelete: string[] = [];

  for (const slot of removeSlots) {
    const oldKey = existing[SLOT_DB_KEY[slot]] as string | null;
    updatePayload[SLOT_DB_KEY[slot]] = null;
    if (oldKey) {
      oldKeysToDelete.push(oldKey);
    }
  }

  for (const slot of slotsToReplace) {
    const descriptor = files[slot]!;
    const ext =
      descriptor.extension.replace(/^\./, "").toLowerCase() ||
      extensionFromMime(descriptor.contentType);
    const newKey = groupObjectKey(
      existing.section,
      user.id,
      existing.id,
      slot,
      ext
    );
    const oldKey = existing[SLOT_DB_KEY[slot]] as string | null;

    updatePayload[SLOT_DB_KEY[slot]] = newKey;
    uploadUrls[slot] = await createPresignedUploadUrl(
      newKey,
      descriptor.contentType
    );

    if (oldKey && oldKey !== newKey) {
      oldKeysToDelete.push(oldKey);
    }
  }

  const { error: updateError } = await supabase
    .from("decoration_groups")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    if (updateError.code === "42P01") {
      return jsonError(
        "Groups table is not set up. Run supabase/decoration-groups.sql in Supabase.",
        503
      );
    }
    return jsonError(updateError.message, 500);
  }

  const refreshed = await fetchOwnGroup(supabase, user.id, id);
  if (refreshed.error || !refreshed.row) {
    return jsonError(
      refreshed.error ??
        "Group was not updated. Ensure the decoration_groups update policy exists in Supabase (run supabase/decoration-groups.sql).",
      refreshed.status === 200 ? 500 : refreshed.status
    );
  }

  if (oldKeysToDelete.length > 0) {
    try {
      await Promise.all(oldKeysToDelete.map((key) => deleteR2Object(key)));
    } catch {
      // DB already updated; stale objects can be cleaned manually
    }
  }

  const group = await dbGroupToRecord(refreshed.row);

  return NextResponse.json({ group, uploadUrls });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!getR2Env().isConfigured) {
    return jsonError("R2 storage is not configured.", 503);
  }

  const { id } = await context.params;
  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  const fetched = await fetchOwnGroup(supabase, user.id, id);
  if (fetched.error) {
    return jsonError(fetched.error, fetched.status);
  }

  const row = fetched.row!;

  try {
    await deleteR2Objects(
      [row.front_key, row.inside_1_key, row.inside_2_key, row.video_key].filter(
        (key): key is string => Boolean(key)
      )
    );
  } catch {
    return jsonError("Could not delete files from storage.", 500);
  }

  const { error: deleteError } = await supabase
    .from("decoration_groups")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return jsonError(deleteError.message, 500);
  }

  return NextResponse.json({ ok: true });
}
