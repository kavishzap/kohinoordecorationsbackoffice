import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { dbCompanyToRecord } from "@/lib/company/server";
import { validateCompanySettings } from "@/lib/company/validation";
import type { DbKohinoorCompany } from "@/lib/company/types";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  const { data, error: dbError } = await supabase
    .from("kohinoor_company")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dbError) {
    if (dbError.code === "42P01") {
      return jsonError(
        "Company table is not set up. Run supabase/kohinoor-company.sql in Supabase.",
        503
      );
    }
    return jsonError(dbError.message, 500);
  }

  if (!data) {
    return NextResponse.json({ company: null });
  }

  return NextResponse.json({
    company: dbCompanyToRecord(data as DbKohinoorCompany),
  });
}

export async function PUT(request: Request) {
  const { supabase, user, error } = await requireUser();
  if (error || !user) return jsonError("You must be signed in.", 401);

  let body: {
    address?: string;
    phone?: string;
    email?: string;
    googleMapLocation?: string;
    facebookLink?: string;
    instagramLink?: string;
    tiktokLink?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const input = {
    address: body.address ?? "",
    phone: body.phone ?? "",
    email: body.email ?? "",
    googleMapLocation: body.googleMapLocation ?? "",
    facebookLink: body.facebookLink ?? "",
    instagramLink: body.instagramLink ?? "",
    tiktokLink: body.tiktokLink ?? "",
  };

  const validationError = validateCompanySettings(input);
  if (validationError) return jsonError(validationError, 400);

  const payload = {
    user_id: user.id,
    address: input.address.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    google_map_location: input.googleMapLocation.trim(),
    facebook_link: input.facebookLink.trim(),
    instagram_link: input.instagramLink.trim(),
    tiktok_link: input.tiktokLink.trim(),
  };

  const { data: existing } = await supabase
    .from("kohinoor_company")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let data;
  let dbError;

  if (existing?.id) {
    const result = await supabase
      .from("kohinoor_company")
      .update(payload)
      .eq("user_id", user.id)
      .select("*")
      .single();
    data = result.data;
    dbError = result.error;
  } else {
    const result = await supabase
      .from("kohinoor_company")
      .insert(payload)
      .select("*")
      .single();
    data = result.data;
    dbError = result.error;
  }

  if (dbError) {
    if (dbError.code === "42P01") {
      return jsonError(
        "Company table is not set up. Run supabase/kohinoor-company.sql in Supabase.",
        503
      );
    }
    return jsonError(dbError.message, 500);
  }

  return NextResponse.json({
    company: dbCompanyToRecord(data as DbKohinoorCompany),
  });
}
