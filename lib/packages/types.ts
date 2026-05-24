import type { PackageWeddingType } from "@/lib/packages/constants";

export interface DecorationPackageRecord {
  id: string;
  name: string;
  pricingRange: string;
  weddingType: PackageWeddingType;
  items: string[];
  displayOrder: number;
  mostPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbDecorationPackage {
  id: string;
  user_id: string;
  name: string;
  pricing_range: string;
  wedding_type: PackageWeddingType;
  items: string[];
  display_order: number;
  most_popular: boolean;
  created_at: string;
  updated_at: string;
}
