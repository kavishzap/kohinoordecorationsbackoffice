import type { CompanySettingsRecord, DbKohinoorCompany } from "@/lib/company/types";
import { formatUploadDate } from "@/lib/section-images/format";

export function dbCompanyToRecord(row: DbKohinoorCompany): CompanySettingsRecord {
  return {
    id: row.id,
    address: row.address,
    phone: row.phone,
    email: row.email,
    googleMapLocation: row.google_map_location,
    facebookLink: row.facebook_link ?? "",
    instagramLink: row.instagram_link ?? "",
    tiktokLink: row.tiktok_link ?? "",
    updatedAt: formatUploadDate(new Date(row.updated_at)),
  };
}
