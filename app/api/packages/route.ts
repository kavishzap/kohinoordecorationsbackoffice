import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import {
  isWeddingType,
  normalizePackageItems,
  parseDisplayOrder,
  validatePackageInput,
} from "@/lib/packages/validation";
import { dbPackageToRecord } from "@/lib/packages/server";
import type { DbDecorationPackage } from "@/lib/packages/types";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  const { data, error: dbError } = await supabase
    .from("decoration_packages")
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (dbError) {
    if (dbError.code === "42P01") {
      return jsonError(
        "Packages table is not set up. Run supabase/decoration-packages.sql in Supabase.",
        503
      );
    }
    return jsonError(dbError.message, 500);
  }

  const packages = (data as DbDecorationPackage[]).map(dbPackageToRecord);
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  let body: {
    name?: string;
    pricingRange?: string;
    weddingType?: string;
    items?: string[];
    displayOrder?: number | string;
    mostPopular?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const validationError = validatePackageInput({
    name: body.name ?? "",
    pricingRange: body.pricingRange ?? "",
    weddingType: body.weddingType ?? "",
    items: body.items ?? [],
    displayOrder: body.displayOrder ?? "",
  });

  if (validationError) return jsonError(validationError, 400);

  if (!isWeddingType(body.weddingType!)) {
    return jsonError("Invalid wedding type.", 400);
  }

  const displayOrder = parseDisplayOrder(body.displayOrder ?? "")!;
  const items = normalizePackageItems(body.items ?? []);
  const mostPopular = Boolean(body.mostPopular);

  const { data, error: insertError } = await supabase
    .from("decoration_packages")
    .insert({
      user_id: user.id,
      name: body.name!.trim(),
      pricing_range: body.pricingRange!.trim(),
      wedding_type: body.weddingType,
      items,
      display_order: displayOrder,
      most_popular: mostPopular,
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "42P01") {
      return jsonError(
        "Packages table is not set up. Run supabase/decoration-packages.sql in Supabase.",
        503
      );
    }
    return jsonError(insertError.message, 500);
  }

  return NextResponse.json({ package: dbPackageToRecord(data as DbDecorationPackage) });
}
