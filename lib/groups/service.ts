import type { GroupMediaSlot } from "@/lib/groups/constants";
import type {
  CreateGroupApiResponse,
  CreateGroupFilesPayload,
  DecorationGroupRecord,
  GroupFileDescriptor,
  PartialGroupFilesPayload,
  UpdateGroupApiResponse,
} from "@/lib/groups/types";
import {
  extensionFromFile,
  validateGroupImageFile,
  validateGroupVideoFile,
} from "@/lib/groups/validation";

export type CreateGroupInput = {
  section: string;
  name: string;
  price: number | null;
  front: File;
  inside1: File;
  inside2?: File;
  video?: File;
};

export type UpdateGroupInput = {
  id: string;
  name: string;
  price: number | null;
  front?: File;
  inside1?: File;
  inside2?: File;
  video?: File;
};

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // ignore
  }
  return "Something went wrong. Please try again.";
}

async function uploadToPresignedUrl(
  url: string,
  file: File
): Promise<string | null> {
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    return `Upload failed (${response.status}). Check R2 CORS allows PUT from this site.`;
  }

  return null;
}

export async function loadSectionGroups(
  section: string
): Promise<{ groups: DecorationGroupRecord[]; error?: string }> {
  try {
    const response = await fetch(
      `/api/groups?section=${encodeURIComponent(section)}`
    );

    if (!response.ok) {
      return { groups: [], error: await parseApiError(response) };
    }

    const data = (await response.json()) as { groups: DecorationGroupRecord[] };
    return { groups: data.groups ?? [] };
  } catch {
    return { groups: [], error: "Could not load groups. Please refresh." };
  }
}

export async function createSectionGroup(
  input: CreateGroupInput,
  onProgress?: (current: number, total: number) => void
): Promise<{ group?: DecorationGroupRecord; error?: string }> {
  const imageChecks = [
    validateGroupImageFile(input.front),
    validateGroupImageFile(input.inside1),
    input.inside2 ? validateGroupImageFile(input.inside2) : null,
  ].find(Boolean);

  if (imageChecks) return { error: imageChecks };

  if (input.video) {
    const videoError = validateGroupVideoFile(input.video);
    if (videoError) return { error: videoError };
  }

  const fileBySlot: Partial<
    Record<GroupMediaSlot, { file: File; contentType: string; extension: string; sizeBytes: number }>
  > = {
    front: {
      file: input.front,
      contentType: input.front.type,
      extension: extensionFromFile(input.front),
      sizeBytes: input.front.size,
    },
    "inside-1": {
      file: input.inside1,
      contentType: input.inside1.type,
      extension: extensionFromFile(input.inside1),
      sizeBytes: input.inside1.size,
    },
  };

  if (input.inside2) {
    fileBySlot["inside-2"] = {
      file: input.inside2,
      contentType: input.inside2.type,
      extension: extensionFromFile(input.inside2),
      sizeBytes: input.inside2.size,
    };
  }

  if (input.video) {
    fileBySlot.video = {
      file: input.video,
      contentType: input.video.type,
      extension: extensionFromFile(input.video),
      sizeBytes: input.video.size,
    };
  }

  const filesPayload: CreateGroupFilesPayload = {
    front: {
      contentType: fileBySlot.front!.contentType,
      extension: fileBySlot.front!.extension,
      sizeBytes: fileBySlot.front!.sizeBytes,
    },
    "inside-1": {
      contentType: fileBySlot["inside-1"]!.contentType,
      extension: fileBySlot["inside-1"]!.extension,
      sizeBytes: fileBySlot["inside-1"]!.sizeBytes,
    },
  };

  if (fileBySlot["inside-2"]) {
    filesPayload["inside-2"] = {
      contentType: fileBySlot["inside-2"].contentType,
      extension: fileBySlot["inside-2"].extension,
      sizeBytes: fileBySlot["inside-2"].sizeBytes,
    };
  }

  if (fileBySlot.video) {
    filesPayload.video = {
      contentType: fileBySlot.video.contentType,
      extension: fileBySlot.video.extension,
      sizeBytes: fileBySlot.video.sizeBytes,
    };
  }

  let created: CreateGroupApiResponse | null = null;

  try {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: input.section,
        name: input.name.trim(),
        price: input.price,
        files: filesPayload,
      }),
    });

    if (!response.ok) {
      return { error: await parseApiError(response) };
    }

    created = (await response.json()) as CreateGroupApiResponse;
  } catch {
    return { error: "Could not start group creation." };
  }

  const slots = Object.keys(created.uploadUrls) as GroupMediaSlot[];
  let step = 0;

  for (const slot of slots) {
    const url = created.uploadUrls[slot];
    const file = fileBySlot[slot]?.file;
    if (!url || !file) continue;

    step += 1;
    onProgress?.(step, slots.length);

    const uploadError = await uploadToPresignedUrl(url, file);

    if (uploadError) {
      await deleteSectionGroup(created.group.id);
      return { error: uploadError };
    }
  }

  return { group: created.group };
}

function fileDescriptor(file: File): GroupFileDescriptor {
  return {
    contentType: file.type,
    extension: extensionFromFile(file),
    sizeBytes: file.size,
  };
}

function buildPartialFilesPayload(
  input: UpdateGroupInput
): PartialGroupFilesPayload | null {
  const files: PartialGroupFilesPayload = {};
  if (input.front) files.front = fileDescriptor(input.front);
  if (input.inside1) files["inside-1"] = fileDescriptor(input.inside1);
  if (input.inside2) files["inside-2"] = fileDescriptor(input.inside2);
  if (input.video) files.video = fileDescriptor(input.video);
  return Object.keys(files).length > 0 ? files : null;
}

export async function updateSectionGroup(
  input: UpdateGroupInput,
  onProgress?: (current: number, total: number) => void
): Promise<{ group?: DecorationGroupRecord; error?: string }> {
  if (input.front) {
    const err = validateGroupImageFile(input.front);
    if (err) return { error: err };
  }
  if (input.inside1) {
    const err = validateGroupImageFile(input.inside1);
    if (err) return { error: err };
  }
  if (input.inside2) {
    const err = validateGroupImageFile(input.inside2);
    if (err) return { error: err };
  }
  if (input.video) {
    const err = validateGroupVideoFile(input.video);
    if (err) return { error: err };
  }

  const filesPayload = buildPartialFilesPayload(input);
  const fileBySlot: Partial<Record<GroupMediaSlot, File>> = {};
  if (input.front) fileBySlot.front = input.front;
  if (input.inside1) fileBySlot["inside-1"] = input.inside1;
  if (input.inside2) fileBySlot["inside-2"] = input.inside2;
  if (input.video) fileBySlot.video = input.video;

  let updated: UpdateGroupApiResponse;

  try {
    const response = await fetch(`/api/groups/${input.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name.trim(),
        price: input.price,
        files: filesPayload ?? undefined,
      }),
    });

    if (!response.ok) {
      return { error: await parseApiError(response) };
    }

    updated = (await response.json()) as UpdateGroupApiResponse;
  } catch {
    return { error: "Could not update group." };
  }

  const slots = Object.keys(updated.uploadUrls) as GroupMediaSlot[];
  let step = 0;

  for (const slot of slots) {
    const file = fileBySlot[slot];
    const url = updated.uploadUrls[slot];
    if (!file || !url) continue;

    step += 1;
    onProgress?.(step, slots.length);

    const uploadError = await uploadToPresignedUrl(url, file);
    if (uploadError) {
      return { error: uploadError };
    }
  }

  return { group: updated.group };
}

export async function deleteSectionGroup(
  groupId: string
): Promise<{ error?: string }> {
  try {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: await parseApiError(response) };
    }

    return {};
  } catch {
    return { error: "Could not delete group." };
  }
}
