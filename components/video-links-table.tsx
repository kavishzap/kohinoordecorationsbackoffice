"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RowActionsMenu } from "@/components/row-actions-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MAX_VIDEO_LINKS } from "@/lib/videos/constants";
import {
  addVideoLink,
  deleteVideoLink,
  loadVideoLinks,
} from "@/lib/videos/service";
import type { KohinoorVideo } from "@/lib/videos/types";
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

function formatAddedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function VideoLinksTable() {
  const [videos, setVideos] = useState<KohinoorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [videoToDelete, setVideoToDelete] = useState<KohinoorVideo | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const remainingSlots = MAX_VIDEO_LINKS - videos.length;
  const canAddMore = remainingSlots > 0;

  const refreshVideos = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    const { videos: data, error } = await loadVideoLinks();
    setVideos(data);
    if (error && !options?.silent) {
      setStatus({
        type: "error",
        title: "Could not load links",
        message: error,
      });
    }
    if (!options?.silent) setLoading(false);
  }, []);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  async function handleAddLink() {
    setSaving(true);
    setStatus(null);

    const { video, error } = await addVideoLink(urlInput, videos.length);

    if (error) {
      setStatus({ type: "error", title: "Could not add link", message: error });
      setSaving(false);
      return;
    }

    if (video) {
      setUrlInput("");
      setShowAddForm(false);
      await refreshVideos({ silent: true });
      setStatus({
        type: "success",
        title: "Link added",
        message: "Video link was saved successfully.",
      });
    }

    setSaving(false);
  }

  async function confirmDelete() {
    if (!videoToDelete) return;

    setDeletingId(videoToDelete.id);
    setDeleteError(null);
    setStatus(null);

    const { error } = await deleteVideoLink(videoToDelete.id);

    if (error) {
      setDeleteError(error);
      setDeletingId(null);
      return;
    }

    setVideoToDelete(null);
    setDeleteError(null);
    await refreshVideos({ silent: true });
    setStatus({
      type: "success",
      title: "Link removed",
      message: "Video link was deleted successfully.",
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
        <h1 className="font-serif text-3xl font-bold text-foreground">Video</h1>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span>
              {videos.length} / {MAX_VIDEO_LINKS} links
            </span>
          </p>
          <Button
            type="button"
            className="rounded-xl"
            disabled={!canAddMore || saving || loading}
            onClick={() => {
              setShowAddForm((v) => !v);
              setStatus(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </motion.div>

      {showAddForm && canAddMore && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <label htmlFor="video-url" className="mb-2 block text-sm font-medium">
            Video link
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="video-url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={saving}
              className="rounded-xl"
            />
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                className="rounded-xl"
                disabled={saving || !urlInput.trim()}
                onClick={() => void handleAddLink()}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving ? "Saving…" : "Save link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={saving}
                onClick={() => {
                  setShowAddForm(false);
                  setUrlInput("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {status && <StatusBanner status={status} />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        {saving && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium">Saving link…</p>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-4">#</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="hidden w-32 sm:table-cell">Added</TableHead>
              <TableHead className="w-16 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Loading links…
                  </p>
                </TableCell>
              </TableRow>
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Link2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No video links yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add up to {MAX_VIDEO_LINKS} links (YouTube, Vimeo, etc.)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 rounded-xl"
                    disabled={!canAddMore}
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video, index) => (
                <TableRow key={video.id}>
                  <TableCell className="pl-4 font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-0">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-primary hover:underline"
                    >
                      {video.video_url}
                    </a>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatAddedDate(video.created_at)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActionsMenu
                      disabled={saving || deletingId !== null}
                      viewLabel="Open link"
                      onView={() =>
                        window.open(
                          video.video_url,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      onDelete={() => setVideoToDelete(video)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {canAddMore && videos.length > 0 && !showAddForm && (
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              disabled={saving || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add ({remainingSlots} slot{remainingSlots === 1 ? "" : "s"} left)
            </button>
          </div>
        )}
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Paste links from YouTube, Vimeo, Google Drive, etc. · Max{" "}
        {MAX_VIDEO_LINKS} links
      </p>

      <AlertDialog
        open={videoToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setVideoToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the video link. This action cannot be
              undone.
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
    </div>
  );
}
