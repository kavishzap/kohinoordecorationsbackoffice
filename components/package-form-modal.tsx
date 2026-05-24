"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WEDDING_TYPES,
  WEDDING_TYPE_LABELS,
  type PackageWeddingType,
} from "@/lib/packages/constants";
import { createPackage, updatePackage } from "@/lib/packages/service";
import type { DecorationPackageRecord } from "@/lib/packages/types";
import { normalizePackageItems, validatePackageInput } from "@/lib/packages/validation";

export interface PackageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  packageRecord?: DecorationPackageRecord | null;
  onSaved?: () => void;
}

export function PackageFormModal({
  open,
  onOpenChange,
  mode,
  packageRecord,
  onSaved,
}: PackageFormModalProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [pricingRange, setPricingRange] = useState("");
  const [weddingType, setWeddingType] = useState<PackageWeddingType | "">("");
  const [items, setItems] = useState<string[]>([""]);
  const [displayOrder, setDisplayOrder] = useState("1");
  const [mostPopular, setMostPopular] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (isEdit && packageRecord) {
      setName(packageRecord.name);
      setPricingRange(packageRecord.pricingRange);
      setWeddingType(packageRecord.weddingType);
      setItems(packageRecord.items.length > 0 ? packageRecord.items : [""]);
      setDisplayOrder(String(packageRecord.displayOrder));
      setMostPopular(packageRecord.mostPopular);
    } else {
      setName("");
      setPricingRange("");
      setWeddingType("");
      setItems([""]);
      setDisplayOrder("1");
      setMostPopular(false);
    }
    setError(null);
  }, [open, isEdit, packageRecord?.id]);

  function resetForm() {
    setName("");
    setPricingRange("");
    setWeddingType("");
    setItems([""]);
    setDisplayOrder("1");
    setMostPopular(false);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    if (!next) resetForm();
    onOpenChange(next);
  }

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  function removeItem(index: number) {
    setItems((prev) =>
      prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)
    );
  }

  const canSubmit =
    !submitting &&
    name.trim().length > 0 &&
    pricingRange.trim().length > 0 &&
    weddingType !== "" &&
    displayOrder.trim().length > 0 &&
    normalizePackageItems(items).length > 0;

  async function handleSubmit() {
    if (!canSubmit || !weddingType) return;

    const validationError = validatePackageInput({
      name,
      pricingRange,
      weddingType,
      items,
      displayOrder,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    const order = Number.parseInt(displayOrder.trim(), 10);

    const payload = {
      name: name.trim(),
      pricingRange: pricingRange.trim(),
      weddingType,
      items: normalizePackageItems(items),
      displayOrder: order,
      mostPopular,
    };

    setSubmitting(true);
    setError(null);

    const result =
      isEdit && packageRecord
        ? await updatePackage(packageRecord.id, payload)
        : await createPackage(payload);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSaved?.();
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,800px)] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 gap-1 space-y-0 border-b border-border px-4 py-3 pr-10">
          <DialogTitle className="font-serif text-lg leading-tight">
            {isEdit ? "Edit package" : "Create package"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 space-y-3 px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="package-name" className="text-xs">
                  Package name
                </Label>
                <Input
                  id="package-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gold Package"
                  className="h-8 rounded-lg text-sm"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pricing-range" className="text-xs">
                  Pricing range
                </Label>
                <Input
                  id="pricing-range"
                  value={pricingRange}
                  onChange={(e) => setPricingRange(e.target.value)}
                  placeholder="Rs 45k – 75k"
                  className="h-8 rounded-lg text-sm"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="display-order" className="text-xs">
                  Display order
                </Label>
                <Input
                  id="display-order"
                  type="number"
                  min={1}
                  step={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="1"
                  className="h-8 rounded-lg text-sm"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Wedding type</Label>
                <Select
                  value={weddingType}
                  onValueChange={(value) =>
                    setWeddingType(value as PackageWeddingType)
                  }
                  disabled={submitting}
                >
                  <SelectTrigger className="h-8 rounded-lg text-sm">
                    <SelectValue placeholder="Select wedding type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEDDING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {WEDDING_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 w-fit">
              <Checkbox
                checked={mostPopular}
                onCheckedChange={(v) => setMostPopular(v === true)}
                disabled={submitting}
              />
              <span className="text-sm">Most popular</span>
            </label>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-border">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <div>
                <Label className="text-xs font-medium">Package items</Label>
                <p className="text-[10px] text-muted-foreground">
                  {normalizePackageItems(items).length} filled · scroll list below
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 rounded-lg px-3 text-xs"
                onClick={addItem}
                disabled={submitting}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add item
              </Button>
            </div>

            <div className="min-h-[220px] flex-1 overflow-y-auto px-4 py-3">
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex h-8 w-6 shrink-0 items-center justify-center text-xs text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <Input
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className="h-8 min-w-0 flex-1 rounded-lg text-sm"
                      disabled={submitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg"
                      onClick={() => removeItem(index)}
                      disabled={submitting || items.length <= 1}
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-muted/20 px-4 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-full rounded-lg text-xs text-muted-foreground"
                onClick={addItem}
                disabled={submitting}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add another item
              </Button>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-3">
          {error && (
            <p className="mb-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create package"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
