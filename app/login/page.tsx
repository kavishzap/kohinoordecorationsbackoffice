import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <div className="relative z-10 flex w-full justify-center">
        <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
