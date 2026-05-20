"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  HardDrive,
  Images,
  Link2,
  Loader2,
  PieChart,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import {
  fetchDashboardHeadlineKpis,
  getEmptyHeadlineKpis,
  type DashboardHeadlineKpis,
} from "@/lib/dashboard/stats";
import { formatFileSize } from "@/lib/section-images/format";
import { cn } from "@/lib/utils";

function StatCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="flex min-h-[140px] items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </motion.div>
  );
}

export function DashboardContent() {
  const [kpis, setKpis] = useState<DashboardHeadlineKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { kpis: data, error: loadError } = await fetchDashboardHeadlineKpis();
      if (cancelled) return;
      setKpis(data ?? getEmptyHeadlineKpis());
      setError(loadError ?? null);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = kpis
    ? [
        {
          title: "Total images",
          value: kpis.totalImages,
          icon: Images,
        },
        {
          title: "Storage used",
          value: formatFileSize(kpis.storageUsedBytes),
          icon: HardDrive,
        },
        {
          title: "Gallery capacity",
          value: `${kpis.gallerySlotsUsed} / ${kpis.gallerySlotsMax}`,
          icon: PieChart,
        },
        {
          title: "Video links",
          value: `${kpis.videoLinks} / ${kpis.videoLinksMax}`,
          icon: Link2,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your Kohinoor decoration gallery and video links.
        </p>
      </motion.div>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={index} index={index} />
            ))
          : stats.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                index={index}
              />
            ))}
      </div>

      {!loading && kpis && (
        <p className={cn("text-center text-xs text-muted-foreground sm:text-left")}>
          Gallery is {kpis.galleryPercent}% full across {kpis.gallerySlotsMax}{" "}
          available image slots (7 sections × 10 images).
        </p>
      )}
    </div>
  );
}
