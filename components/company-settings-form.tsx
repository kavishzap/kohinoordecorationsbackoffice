"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  loadCompanySettings,
  saveCompanySettings,
} from "@/lib/company/service";
import { cn } from "@/lib/utils";

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

export function CompanySettingsForm() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [googleMapLocation, setGoogleMapLocation] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { company, error } = await loadCompanySettings();

    if (error) {
      setStatus({ type: "error", message: error });
    } else if (company) {
      setAddress(company.address);
      setPhone(company.phone);
      setEmail(company.email);
      setGoogleMapLocation(company.googleMapLocation);
      setFacebookLink(company.facebookLink);
      setInstagramLink(company.instagramLink);
      setTiktokLink(company.tiktokLink);
      setLastUpdated(company.updatedAt);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    const { company, error } = await saveCompanySettings({
      address,
      phone,
      email,
      googleMapLocation,
      facebookLink,
      instagramLink,
      tiktokLink,
    });

    setSaving(false);

    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    if (company) {
      setLastUpdated(company.updatedAt);
    }

    setStatus({
      type: "success",
      message: "Company settings saved successfully.",
    });
  }

  const mapsHref = googleMapLocation.trim();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Company Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Contact details and location shown for Kohinoor Decorations.
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        )}
      </motion.div>

      {status && (
        <div
          role="alert"
          className={cn(
            "flex gap-3 rounded-xl border px-4 py-3 text-sm",
            status.type === "error"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/10 text-foreground"
          )}
        >
          {status.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          )}
          <p>{status.message}</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8"
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Kohinoor company profile</p>
            <p className="text-xs text-muted-foreground">
              One profile per account
            </p>
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-5">
              <p className="text-sm font-medium text-foreground">
                Contact & location
              </p>
              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="La rosa link road, Md Albert"
                  rows={3}
                  className="resize-none rounded-xl"
                  disabled={loading || saving}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5833 1197"
                    className="rounded-xl"
                    disabled={loading || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="rounded-xl"
                    disabled={loading || saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-maps" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Google Maps location
                </Label>
                <Input
                  id="company-maps"
                  type="url"
                  value={googleMapLocation}
                  onChange={(e) => setGoogleMapLocation(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="rounded-xl"
                  disabled={loading || saving}
                />
                <p className="text-xs text-muted-foreground">
                  Paste the Google Maps share link for your business location.
                </p>
                {mapsHref.startsWith("http") && (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Preview on Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-5 lg:border-l lg:border-border lg:pl-8">
              <p className="text-sm font-medium text-foreground">
                Social accounts
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-facebook">Facebook account link</Label>
                  <Input
                    id="company-facebook"
                    type="url"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="rounded-xl"
                    disabled={loading || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-instagram">Instagram account link</Label>
                  <Input
                    id="company-instagram"
                    type="url"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="rounded-xl"
                    disabled={loading || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-tiktok">TikTok account link</Label>
                  <Input
                    id="company-tiktok"
                    type="url"
                    value={tiktokLink}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="rounded-xl"
                    disabled={loading || saving}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Must be full https:// links if provided.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-6">
            <Button
              type="submit"
              className="rounded-xl px-8"
              disabled={loading || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save settings
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
