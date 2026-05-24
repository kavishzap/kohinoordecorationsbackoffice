import type { CompanySettingsInput } from "@/lib/company/types";

function validateOptionalUrl(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return `${label} must start with http:// or https://`;
    }
  } catch {
    return `${label} must be a valid URL.`;
  }
  return null;
}

export function validateCompanySettings(
  input: CompanySettingsInput
): string | null {
  if (!input.address.trim()) return "Address is required.";
  if (!input.phone.trim()) return "Phone is required.";
  if (!input.email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return "Enter a valid email address.";
  }
  if (!input.googleMapLocation.trim()) {
    return "Google Maps location link is required.";
  }

  return (
    validateOptionalUrl(input.facebookLink, "Facebook link") ??
    validateOptionalUrl(input.instagramLink, "Instagram link") ??
    validateOptionalUrl(input.tiktokLink, "TikTok link")
  );
}
