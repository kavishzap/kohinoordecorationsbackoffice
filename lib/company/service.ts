import type {
  CompanySettingsInput,
  CompanySettingsRecord,
} from "@/lib/company/types";

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // ignore
  }
  return "Something went wrong. Please try again.";
}

export async function loadCompanySettings(): Promise<{
  company: CompanySettingsRecord | null;
  error?: string;
}> {
  try {
    const response = await fetch("/api/company");
    if (!response.ok) {
      return { company: null, error: await parseApiError(response) };
    }
    const data = (await response.json()) as {
      company: CompanySettingsRecord | null;
    };
    return { company: data.company ?? null };
  } catch {
    return { company: null, error: "Could not load company settings." };
  }
}

export async function saveCompanySettings(
  input: CompanySettingsInput
): Promise<{ company?: CompanySettingsRecord; error?: string }> {
  try {
    const response = await fetch("/api/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return { error: await parseApiError(response) };
    }

    const data = (await response.json()) as { company: CompanySettingsRecord };
    return { company: data.company };
  } catch {
    return { error: "Could not save company settings." };
  }
}
