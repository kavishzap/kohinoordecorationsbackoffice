export interface CompanySettingsRecord {
  id: string;
  address: string;
  phone: string;
  email: string;
  googleMapLocation: string;
  facebookLink: string;
  instagramLink: string;
  tiktokLink: string;
  updatedAt: string;
}

export interface DbKohinoorCompany {
  id: string;
  user_id: string;
  address: string;
  phone: string;
  email: string;
  google_map_location: string;
  facebook_link: string;
  instagram_link: string;
  tiktok_link: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettingsInput {
  address: string;
  phone: string;
  email: string;
  googleMapLocation: string;
  facebookLink: string;
  instagramLink: string;
  tiktokLink: string;
}
