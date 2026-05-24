import {
  WEDDING_TYPES,
  type PackageWeddingType,
} from "@/lib/packages/constants";

export function isWeddingType(value: string): value is PackageWeddingType {
  return WEDDING_TYPES.includes(value as PackageWeddingType);
}

export function normalizePackageItems(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

export function parseDisplayOrder(value: string | number): number | null {
  const n =
    typeof value === "number" ? value : Number.parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

export function validatePackageInput(input: {
  name: string;
  pricingRange: string;
  weddingType: string;
  items: string[];
  displayOrder: string | number;
}): string | null {
  if (!input.name.trim()) return "Package name is required.";
  if (!input.pricingRange.trim()) return "Pricing range is required.";
  if (!isWeddingType(input.weddingType)) return "Select a valid wedding type.";
  if (parseDisplayOrder(input.displayOrder) === null) {
    return "Display order must be a whole number of 1 or higher (e.g. Silver = 1, Gold = 2).";
  }
  const items = normalizePackageItems(input.items);
  if (items.length === 0) return "Add at least one package item.";
  return null;
}
