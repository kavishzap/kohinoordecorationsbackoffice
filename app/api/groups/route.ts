import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  GROUP_OPTIONAL_MEDIA_SLOTS,
  GROUP_REQUIRED_MEDIA_SLOTS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  STORAGE_SECTIONS,
  type GroupMediaSlot,
  type StorageSection,
} from "@/lib/groups/constants";
import { groupObjectKey } from "@/lib/groups/keys";
import { dbGroupToRecord } from "@/lib/groups/server";
import type {
  CreateGroupFilesPayload,
  DbDecorationGroup,
} from "@/lib/groups/types";
import {
  extensionFromMime,
  parseOptionalGroupPrice,
} from "@/lib/groups/validation";
import { getR2Env } from "@/lib/r2/env";
import { createPresignedUploadUrl } from "@/lib/r2/storage";

function isStorageSection(section: string): section is StorageSection {
  return STORAGE_SECTIONS.includes(section as StorageSection);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function validateFileDescriptor(
  slot: GroupMediaSlot,
  descriptor: CreateGroupFilesPayload[GroupMediaSlot] | undefined
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

export async function GET(request: Request) {
  if (!getR2Env().isConfigured) {
    return jsonError("R2 storage is not configured.", 503);
  }

  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  const section = new URL(request.url).searchParams.get("section");
  if (!section || !isStorageSection(section)) {
    return jsonError("Invalid section.", 400);
  }

  const { data, error: dbError } = await supabase
    .from("decoration_groups")
    .select("*")
    .eq("section", section)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    if (dbError.code === "42P01") {
      return jsonError(
        "Groups table is not set up. Run supabase/decoration-groups.sql in Supabase.",
        503
      );
    }
    return jsonError(dbError.message, 500);
  }

  const groups = await Promise.all(
    (data as DbDecorationGroup[]).map((row) => dbGroupToRecord(row))
  );

  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  if (!getR2Env().isConfigured) {
    return jsonError("R2 storage is not configured.", 503);
  }

  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  let body: {
    section?: string;
    name?: string;
    price?: number | string;
    files?: CreateGroupFilesPayload;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const section = body.section;
  const name = body.name?.trim();
  const files = body.files;
  const price = parseOptionalGroupPrice(body.price);
  if (price === undefined) {
    return jsonError("Invalid price. Use a number or leave it empty.", 400);
  }

  if (!section || !isStorageSection(section)) {
    return jsonError("Invalid section.", 400);
  }
  if (!name) {
    return jsonError("Group name is required.", 400);
  }
  if (!files) {
    return jsonError("File metadata is required.", 400);
  }

  for (const slot of GROUP_REQUIRED_MEDIA_SLOTS) {
    const validationError = validateFileDescriptor(slot, files[slot]);
    if (validationError) return jsonError(validationError, 400);
  }

  for (const slot of GROUP_OPTIONAL_MEDIA_SLOTS) {
    if (!files[slot]) continue;
    const validationError = validateFileDescriptor(slot, files[slot]);
    if (validationError) return jsonError(validationError, 400);
  }

  const groupId = crypto.randomUUID();
  const keys: Partial<Record<GroupMediaSlot, string>> = {};
  const uploadUrls: Partial<Record<GroupMediaSlot, string>> = {};

  const slotsToUpload = [
    ...GROUP_REQUIRED_MEDIA_SLOTS,
    ...GROUP_OPTIONAL_MEDIA_SLOTS.filter((slot) => files[slot]),
  ];

  for (const slot of slotsToUpload) {
    const descriptor = files[slot]!;
    const ext =
      descriptor.extension.replace(/^\./, "").toLowerCase() ||
      extensionFromMime(descriptor.contentType);
    const key = groupObjectKey(section, user.id, groupId, slot, ext);
    keys[slot] = key;
    uploadUrls[slot] = await createPresignedUploadUrl(key, descriptor.contentType);
  }

  const { data, error: insertError } = await supabase
    .from("decoration_groups")
    .insert({
      id: groupId,
      user_id: user.id,
      section,
      name,
      price,
      front_key: keys.front!,
      inside_1_key: keys["inside-1"]!,
      inside_2_key: keys["inside-2"] ?? null,
      video_key: keys.video ?? null,
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "42P01") {
      return jsonError(
        "Groups table is not set up. Run supabase/decoration-groups.sql in Supabase.",
        503
      );
    }
    if (
      insertError.code === "23514" &&
      insertError.message.includes("decoration_groups_section_check")
    ) {
      return jsonError(
        `Section "${section}" is not allowed in the database yet. In Supabase SQL Editor, run supabase/decoration-groups-add-sections.sql.`,
        400
      );
    }
    return jsonError(insertError.message, 500);
  }

  const group = await dbGroupToRecord(data as DbDecorationGroup);

  return NextResponse.json({ group, uploadUrls });
}
