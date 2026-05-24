import type { GroupMediaSlot } from "@/lib/groups/constants";

const SLOT_FILE_NAME: Record<GroupMediaSlot, string> = {
  front: "front",
  "inside-1": "inside-1",
  "inside-2": "inside-2",
  video: "video",
};

export function groupObjectKey(
  section: string,
  userId: string,
  groupId: string,
  slot: GroupMediaSlot,
  extension: string
): string {
  const safeExt = extension.replace(/^\./, "").toLowerCase();
  return `decorations/${section}/${userId}/${groupId}/${SLOT_FILE_NAME[slot]}.${safeExt}`;
}

export function slotFromDbColumn(
  column: "front_key" | "inside_1_key" | "inside_2_key" | "video_key"
): GroupMediaSlot {
  const map = {
    front_key: "front",
    inside_1_key: "inside-1",
    inside_2_key: "inside-2",
    video_key: "video",
  } as const;
  return map[column];
}
