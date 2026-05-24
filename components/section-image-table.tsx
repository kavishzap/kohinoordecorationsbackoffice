"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  Plus,
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
import { GroupFormModal } from "@/components/group-form-modal";
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
import { formatGroupPrice } from "@/lib/groups/format";
import { deleteSectionGroup, loadSectionGroups } from "@/lib/groups/service";
import type { DecorationGroupRecord } from "@/lib/groups/types";
import { cn } from "@/lib/utils";

interface SectionImageTableProps {
  section: string;
  title: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

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

export function SectionImageTable({ section, title }: SectionImageTableProps) {
  const [groups, setGroups] = useState<DecorationGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewGroup, setPreviewGroup] = useState<DecorationGroupRecord | null>(
    null
  );
  const [groupToDelete, setGroupToDelete] = useState<DecorationGroupRecord | null>(
    null
  );
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingGroup, setEditingGroup] = useState<DecorationGroupRecord | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(groups.length / pageSize));

  const paginatedGroups = useMemo(() => {
    const start = (page - 1) * pageSize;
    return groups.slice(start, start + pageSize);
  }, [groups, page, pageSize]);

  const pageIds = useMemo(
    () => paginatedGroups.map((g) => g.id),
    [paginatedGroups]
  );

  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someOnPageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allOnPageSelected;

  function openCreateForm() {
    setFormMode("create");
    setEditingGroup(null);
    setFormOpen(true);
  }

  function openEditForm(group: DecorationGroupRecord) {
    setFormMode("edit");
    setEditingGroup(group);
    setFormOpen(true);
  }

  const refreshGroups = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      const { groups: data, error } = await loadSectionGroups(section);
      setGroups(data);
      if (error && !options?.silent) {
        setStatus({
          type: "error",
          title: "Could not load groups",
          message: error,
        });
      }
      if (!options?.silent) setLoading(false);
    },
    [section]
  );

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [section]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
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

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function confirmBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkDeleting(true);
    setDeleteError(null);
    setStatus(null);

    let deleted = 0;
    let lastError: string | null = null;

    for (const id of ids) {
      const { error } = await deleteSectionGroup(id);
      if (error) {
        lastError = error;
        break;
      }
      deleted += 1;
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);

    if (previewGroup && ids.includes(previewGroup.id)) {
      setPreviewGroup(null);
    }

    clearSelection();
    await refreshGroups({ silent: true });

    if (lastError) {
      setStatus({
        type: deleted > 0 ? "info" : "error",
        title: deleted > 0 ? "Some groups not deleted" : "Delete failed",
        message:
          deleted > 0
            ? `${deleted} of ${ids.length} deleted. ${lastError}`
            : lastError,
      });
      return;
    }

    setStatus({
      type: "success",
      title: "Groups deleted",
      message:
        deleted === 1
          ? "1 group was removed."
          : `${deleted} groups were removed.`,
    });
  }

  async function confirmDelete() {
    if (!groupToDelete) return;

    const record = groupToDelete;
    setDeletingId(record.id);
    setDeleteError(null);
    setStatus(null);

    const { error } = await deleteSectionGroup(record.id);

    if (error) {
      setDeleteError(error);
      setDeletingId(null);
      return;
    }

    setGroupToDelete(null);
    setDeleteError(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(record.id);
      return next;
    });
    if (previewGroup?.id === record.id) {
      setPreviewGroup(null);
    }
    await refreshGroups({ silent: true });
    setStatus({
      type: "success",
      title: "Group deleted",
      message: `"${record.name}" was removed.`,
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {title}
        </h1>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <span>
              {groups.length} group{groups.length === 1 ? "" : "s"}
            </span>
          </p>
          <Button
            type="button"
            className="rounded-xl"
            disabled={loading}
            onClick={openCreateForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add group
          </Button>
        </div>
      </motion.div>

      {status && <StatusBanner status={status} />}

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {selectedIds.size} selected
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={bulkDeleting || deletingId !== null}
              onClick={clearSelection}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-lg"
              disabled={bulkDeleting || deletingId !== null}
              onClick={() => setBulkDeleteOpen(true)}
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
        transition={{ delay: 0.1 }}
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
                  onCheckedChange={(value) =>
                    togglePageSelection(value === true)
                  }
                  disabled={loading || paginatedGroups.length === 0}
                  aria-label="Select all on this page"
                />
              </TableHead>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-24">Cover</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-28">Price</TableHead>
              <TableHead className="hidden w-32 sm:table-cell">Created</TableHead>
              <TableHead className="w-16 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Loading groups…
                  </p>
                </TableCell>
              </TableRow>
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No groups yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a group with a cover image and Inside 1 (Inside 2 and
                    video optional)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 rounded-xl"
                    onClick={openCreateForm}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add group
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              paginatedGroups.map((group, index) => {
                const rowNumber = (page - 1) * pageSize + index + 1;
                const isSelected = selectedIds.has(group.id);

                return (
                <TableRow
                  key={group.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={isSelected ? "bg-muted/40" : undefined}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(value) =>
                        toggleRow(group.id, value === true)
                      }
                      disabled={deletingId !== null || bulkDeleting}
                      aria-label={`Select ${group.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {rowNumber}
                  </TableCell>
                  <TableCell>
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted">
                      {group.frontPreviewUrl ? (
                        <Image
                          src={group.frontPreviewUrl}
                          alt={group.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {group.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatGroupPrice(group.price)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {group.createdAt}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActionsMenu
                      disabled={deletingId !== null || bulkDeleting}
                      onView={() => setPreviewGroup(group)}
                      onEdit={() => openEditForm(group)}
                      onDelete={() => setGroupToDelete(group)}
                    />
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>

        {groups.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                Rows per page
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value) as PageSize);
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
                {groups.length === 0
                  ? "0 groups"
                  : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, groups.length)} of ${groups.length}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={page <= 1 || loading}
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
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {groups.length > 0 && (
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={openCreateForm}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add another group
            </button>
          </div>
        )}
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Images up to 10MB · Video up to 300MB · Unlimited groups per section
      </p>

      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          if (!open && !bulkDeleting) {
            setBulkDeleteOpen(false);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} group
              {selectedIds.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all media for the selected groups.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Delete failed</p>
                <p className="mt-0.5">{deleteError}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={bulkDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={bulkDeleting}
              onClick={() => void confirmBulkDelete()}
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                `Delete ${selectedIds.size}`
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={groupToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setGroupToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all files for &quot;
              {groupToDelete?.name}&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Delete failed</p>
                <p className="mt-0.5">{deleteError}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={deletingId !== null}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={deletingId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GroupFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        section={section}
        sectionTitle={title}
        group={editingGroup}
        onSaved={() => {
          setStatus({
            type: "success",
            title: formMode === "edit" ? "Group updated" : "Group created",
            message:
              formMode === "edit"
                ? "Your changes were saved."
                : "Your group was saved successfully.",
          });
          void refreshGroups({ silent: true });
        }}
      />

      <Dialog
        open={previewGroup !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewGroup(null);
        }}
      >
        <DialogContent className="max-w-3xl gap-4 rounded-2xl p-4 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {previewGroup?.name}
            </DialogTitle>
            {previewGroup && (
              <p className="text-sm text-muted-foreground">
                {formatGroupPrice(previewGroup.price)}
              </p>
            )}
          </DialogHeader>
          {previewGroup && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Front</p>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={previewGroup.frontPreviewUrl}
                    alt="Front"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
              {previewGroup.videoPreviewUrl ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Video</p>
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                    <video
                      src={previewGroup.videoPreviewUrl}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                    />
                  </div>
                </div>
              ) : null}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Inside 1
                </p>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={previewGroup.inside1PreviewUrl}
                    alt="Inside 1"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
              {previewGroup.inside2PreviewUrl ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Inside 2
                  </p>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={previewGroup.inside2PreviewUrl}
                      alt="Inside 2"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
