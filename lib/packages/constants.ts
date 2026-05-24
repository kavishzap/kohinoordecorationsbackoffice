export const WEDDING_TYPES = ["indian_wedding", "muslim_wedding"] as const;

export type PackageWeddingType = (typeof WEDDING_TYPES)[number];

export const WEDDING_TYPE_LABELS: Record<PackageWeddingType, string> = {
  indian_wedding: "Indian Wedding",
  muslim_wedding: "Muslim Wedding",
};

export const PAGE_SIZE_OPTIONS = [5, 10, 50, 100] as const;
export type PackagePageSize = (typeof PAGE_SIZE_OPTIONS)[number];
