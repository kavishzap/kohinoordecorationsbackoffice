import type { GroupMediaSlot } from "@/lib/groups/constants";

export interface DecorationGroupRecord {
  id: string;
  section: string;
  name: string;
  price: number | null;
  createdAt: string;
  frontPreviewUrl: string;
  inside1PreviewUrl: string;
  inside2PreviewUrl: string;
  videoPreviewUrl: string;
}

export interface GroupFileDescriptor {
  contentType: string;
  extension: string;
  sizeBytes: number;
}

export type CreateGroupFilesPayload = {
  front: GroupFileDescriptor;
  "inside-1": GroupFileDescriptor;
} & Partial<Pick<Record<GroupMediaSlot, GroupFileDescriptor>, "inside-2" | "video">>;

export type PartialGroupFilesPayload = Partial<
  Record<GroupMediaSlot, GroupFileDescriptor>
>;

export interface CreateGroupApiResponse {
  group: DecorationGroupRecord;
  uploadUrls: Partial<Record<GroupMediaSlot, string>>;
}

export interface UpdateGroupApiResponse {
  group: DecorationGroupRecord;
  uploadUrls: Partial<Record<GroupMediaSlot, string>>;
}

export interface DbDecorationGroup {
  id: string;
  user_id: string;
  section: string;
  name: string;
  price: number | null;
  front_key: string;
  inside_1_key: string;
  inside_2_key: string | null;
  video_key: string | null;
  created_at: string;
}
