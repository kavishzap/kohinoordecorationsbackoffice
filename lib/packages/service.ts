import type { DecorationPackageRecord } from "@/lib/packages/types";
import type { PackageWeddingType } from "@/lib/packages/constants";

export type PackageInput = {
  name: string;
  pricingRange: string;
  weddingType: PackageWeddingType;
  items: string[];
  displayOrder: number;
  mostPopular: boolean;
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

export async function loadPackages(): Promise<{
  packages: DecorationPackageRecord[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/packages");
    if (!response.ok) {
      return { packages: [], error: await parseApiError(response) };
    }
    const data = (await response.json()) as {
      packages: DecorationPackageRecord[];
    };
    return { packages: data.packages ?? [] };
  } catch {
    return { packages: [], error: "Could not load packages." };
  }
}

export async function createPackage(
  input: PackageInput
): Promise<{ package?: DecorationPackageRecord; error?: string }> {
  try {
    const response = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return { error: await parseApiError(response) };
    }
    const data = (await response.json()) as { package: DecorationPackageRecord };
    return { package: data.package };
  } catch {
    return { error: "Could not create package." };
  }
}

export async function updatePackage(
  id: string,
  input: PackageInput
): Promise<{ package?: DecorationPackageRecord; error?: string }> {
  try {
    const response = await fetch(`/api/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return { error: await parseApiError(response) };
    }
    const data = (await response.json()) as { package: DecorationPackageRecord };
    return { package: data.package };
  } catch {
    return { error: "Could not update package." };
  }
}

export async function deletePackage(
  id: string
): Promise<{ error?: string }> {
  try {
    const response = await fetch(`/api/packages/${id}`, { method: "DELETE" });
    if (!response.ok) {
      return { error: await parseApiError(response) };
    }
    return {};
  } catch {
    return { error: "Could not delete package." };
  }
}
