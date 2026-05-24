import type { DbDecorationPackage, DecorationPackageRecord } from "@/lib/packages/types";
import { formatUploadDate } from "@/lib/section-images/format";

export function dbPackageToRecord(row: DbDecorationPackage): DecorationPackageRecord {
  return {
    id: row.id,
    name: row.name,
    pricingRange: row.pricing_range,
    weddingType: row.wedding_type,
    items: row.items ?? [],
    displayOrder: Number(row.display_order ?? 1),
    mostPopular: Boolean(row.most_popular),
    createdAt: formatUploadDate(new Date(row.created_at)),
    updatedAt: formatUploadDate(new Date(row.updated_at)),
  };
}
