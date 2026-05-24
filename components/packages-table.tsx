"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PackageFormModal } from "@/components/package-form-modal";
import { RowActionsMenu } from "@/components/row-actions-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PAGE_SIZE_OPTIONS,
  WEDDING_TYPE_LABELS,
  type PackagePageSize,
} from "@/lib/packages/constants";
import { deletePackage, loadPackages } from "@/lib/packages/service";
import type { DecorationPackageRecord } from "@/lib/packages/types";
import { cn } from "@/lib/utils";

type StatusMessage = {
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

function StatusBanner({ status }: { status: StatusMessage }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        status.type === "error" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
        status.type === "success" &&
          "border-primary/20 bg-primary/10 text-foreground",
        status.type === "info" &&
          "border-border bg-muted text-muted-foreground"
      )}
    >
      {status.type === "error" && (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      {status.type === "success" && (
        <CheckCircle2
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          aria-hidden
        />
      )}
      <div>
        <p className="font-medium">{status.title}</p>
        <p className="mt-0.5 opacity-90">{status.message}</p>
      </div>
    </div>
  );
}

export function PackagesTable() {
  const [packages, setPackages] = useState<DecorationPackageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewPackage, setPreviewPackage] =
    useState<DecorationPackageRecord | null>(null);
  const [packageToDelete, setPackageToDelete] =
    useState<DecorationPackageRecord | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingPackage, setEditingPackage] =
    useState<DecorationPackageRecord | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PackagePageSize>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(packages.length / pageSize));

  const paginatedPackages = useMemo(() => {
    const start = (page - 1) * pageSize;
    return packages.slice(start, start + pageSize);
  }, [packages, page, pageSize]);

  const pageIds = useMemo(
    () => paginatedPackages.map((p) => p.id),
    [paginatedPackages]
  );

  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someOnPageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allOnPageSelected;

  const refreshPackages = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    const { packages: data, error } = await loadPackages();
    setPackages(
      [...data].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
    );
    if (error && !options?.silent) {
      setStatus({
        type: "error",
        title: "Could not load packages",
        message: error,
      });
    }
    if (!options?.silent) setLoading(false);
  }, []);

  useEffect(() => {
    refreshPackages();
  }, [refreshPackages]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function togglePageSelection(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  async function confirmBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkDeleting(true);
    let deleted = 0;
    let lastError: string | null = null;

    for (const id of ids) {
      const { error } = await deletePackage(id);
      if (error) {
        lastError = error;
        break;
      }
      deleted += 1;
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    if (previewPackage && ids.includes(previewPackage.id)) {
      setPreviewPackage(null);
    }
    setSelectedIds(new Set());
    await refreshPackages({ silent: true });

    if (lastError) {
      setStatus({
        type: deleted > 0 ? "info" : "error",
        title: deleted > 0 ? "Some packages not deleted" : "Delete failed",
        message:
          deleted > 0
            ? `${deleted} of ${ids.length} deleted. ${lastError}`
            : lastError,
      });
      return;
    }

    setStatus({
      type: "success",
      title: "Packages deleted",
      message:
        deleted === 1 ? "1 package was removed." : `${deleted} packages were removed.`,
    });
  }

  async function confirmDelete() {
    if (!packageToDelete) return;

    const record = packageToDelete;
    setDeletingId(record.id);
    setDeleteError(null);

    const { error } = await deletePackage(record.id);

    if (error) {
      setDeleteError(error);
      setDeletingId(null);
      return;
    }

    setPackageToDelete(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(record.id);
      return next;
    });
    if (previewPackage?.id === record.id) setPreviewPackage(null);
    await refreshPackages({ silent: true });
    setStatus({
      type: "success",
      title: "Package deleted",
      message: `"${record.name}" was removed.`,
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">Packages</h1>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              {packages.length} package{packages.length === 1 ? "" : "s"}
            </span>
          </p>
          <Button type="button" className="rounded-xl" disabled={loading} onClick={() => {
            setFormMode("create");
            setEditingPackage(null);
            setFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add package
          </Button>
        </div>
      </motion.div>

      {status && <StatusBanner status={status} />}

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium">{selectedIds.size} selected</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setSelectedIds(new Set())}
              disabled={bulkDeleting || deletingId !== null}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-lg"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkDeleting || deletingId !== null}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete selected
            </Button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={
                    allOnPageSelected
                      ? true
                      : someOnPageSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(v) => togglePageSelection(v === true)}
                  disabled={loading || paginatedPackages.length === 0}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-28">Popular</TableHead>
              <TableHead className="hidden md:table-cell">Pricing</TableHead>
              <TableHead>Wedding type</TableHead>
              <TableHead className="hidden sm:table-cell">Items</TableHead>
              <TableHead className="w-16 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <p className="font-medium">No packages yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create packages for Indian or Muslim weddings
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPackages.map((pkg, index) => {
                const rowNum = (page - 1) * pageSize + index + 1;
                const selected = selectedIds.has(pkg.id);
                return (
                  <TableRow
                    key={pkg.id}
                    className={selected ? "bg-muted/40" : undefined}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(v) => toggleRow(pkg.id, v === true)}
                        disabled={deletingId !== null || bulkDeleting}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{rowNum}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {pkg.displayOrder}
                    </TableCell>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      {pkg.mostPopular ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          <Star className="h-3 w-3 fill-current" />
                          Popular
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {pkg.pricingRange}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {WEDDING_TYPE_LABELS[pkg.weddingType]}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {pkg.items.length}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <RowActionsMenu
                        disabled={deletingId !== null || bulkDeleting}
                        onView={() => setPreviewPackage(pkg)}
                        onEdit={() => {
                          setFormMode("edit");
                          setEditingPackage(pkg);
                          setFormOpen(true);
                        }}
                        onDelete={() => setPackageToDelete(pkg)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {packages.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                Rows per page
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v) as PackagePageSize);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[72px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </span>
              <span>
                {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, packages.length)} of {packages.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="min-w-[88px] text-center text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <PackageFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        packageRecord={editingPackage}
        onSaved={() => {
          setStatus({
            type: "success",
            title: formMode === "edit" ? "Package updated" : "Package created",
            message: "Your changes were saved.",
          });
          void refreshPackages({ silent: true });
        }}
      />

      <Dialog open={previewPackage !== null} onOpenChange={(o) => !o && setPreviewPackage(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {previewPackage?.name}
            </DialogTitle>
          </DialogHeader>
          {previewPackage && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Pricing: </span>
                {previewPackage.pricingRange}
              </p>
              <p>
                <span className="text-muted-foreground">Display order: </span>
                {previewPackage.displayOrder}
              </p>
              <p>
                <span className="text-muted-foreground">Most popular: </span>
                {previewPackage.mostPopular ? "Yes" : "No"}
              </p>
              <p>
                <span className="text-muted-foreground">Wedding type: </span>
                {WEDDING_TYPE_LABELS[previewPackage.weddingType]}
              </p>
              <div>
                <p className="mb-2 text-muted-foreground">Package items:</p>
                <ul className="list-inside list-disc space-y-1">
                  {previewPackage.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} packages?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={bulkDeleting} onClick={() => void confirmBulkDelete()}>
              {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={packageToDelete !== null}
        onOpenChange={(o) => !o && !deletingId && setPackageToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete package?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{packageToDelete?.name}&quot; permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={deletingId !== null} onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
