"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { getLoginErrorMessage, validateLoginForm } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const authError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    authError
      ? "Your session could not be restored. Please sign in again."
      : null
  );
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateLoginForm(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          getLoginErrorMessage(signInError.message, signInError.status)
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes("Supabase env")
          ? "Sign-in is not configured. Add your Supabase URL and anon key to .env.local, then restart the dev server."
          : "We could not reach the server. Check your internet connection and try again."
      );
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-2xl shadow-sm ring-1 ring-border">
          <Image
            src="/logo.png"
            alt="Kohinoor Decorations"
            width={128}
            height={128}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Kohinoor Decorations Back Office
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access the back office
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
              if (success) setSuccess(false);
            }}
            required
            disabled={loading || success}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
                if (success) setSuccess(false);
              }}
              required
              disabled={loading || success}
              aria-invalid={!!error}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading || success}
              className="absolute right-0 top-0 flex h-9 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex gap-3 rounded-lg border border-primary/20 bg-primary/10 px-3 py-3 text-sm text-foreground"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p>Welcome back! Sign-in successful. Taking you to the dashboard…</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || success}
        >
          {loading ? "Signing in…" : success ? "Redirecting…" : "Sign in"}
        </Button>
      </form>
    </motion.div>
  );
}
