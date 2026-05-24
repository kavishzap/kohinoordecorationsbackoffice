import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { getR2Env } from "@/lib/r2/env";
import { getUserR2StorageBytes } from "@/lib/r2/usage";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  if (!getR2Env().isConfigured) {
    return NextResponse.json({
      bytes: 0,
      error: "R2 storage is not configured.",
    });
  }

  try {
    const bytes = await getUserR2StorageBytes(user.id);
    return NextResponse.json({ bytes });
  } catch {
    return NextResponse.json(
      { error: "Could not read storage usage from R2." },
      { status: 500 }
    );
  }
}
