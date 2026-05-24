import { createClient } from "@/lib/supabase/client";
import { DECOR_SECTIONS } from "@/lib/sections/decor-sections";

export type DashboardHeadlineKpis = {
  totalGroups: number;
  storageUsedBytes: number;
  sectionsCount: number;
};

export async function fetchDashboardHeadlineKpis(): Promise<{
  kpis: DashboardHeadlineKpis | null;
  error?: string;
  storageError?: string;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { kpis: null, error: "Sign in to view dashboard stats." };
    }

    const [{ count: groupCount, error: groupsError }, storageResponse] =
      await Promise.all([
        supabase
          .from("decoration_groups")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        fetch("/api/storage"),
      ]);

    const totalGroups = groupsError ? 0 : (groupCount ?? 0);

    let storageUsedBytes = 0;
    let storageError: string | undefined;

    if (storageResponse.ok) {
      const data = (await storageResponse.json()) as {
        bytes?: number;
        error?: string;
      };
      storageUsedBytes = typeof data.bytes === "number" ? data.bytes : 0;
      if (data.error) storageError = data.error;
    } else {
      storageError = "Could not load R2 storage usage.";
    }

    return {
      kpis: {
        totalGroups,
        storageUsedBytes,
        sectionsCount: DECOR_SECTIONS.length,
      },
      storageError,
    };
  } catch {
    return {
      kpis: null,
      error: "Could not load dashboard stats. Please refresh the page.",
    };
  }
}

export function getEmptyHeadlineKpis(): DashboardHeadlineKpis {
  return {
    totalGroups: 0,
    storageUsedBytes: 0,
    sectionsCount: DECOR_SECTIONS.length,
  };
}
