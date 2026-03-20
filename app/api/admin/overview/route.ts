import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/http";
import { requireAdminUser } from "@/lib/session";
import { getAdminSnapshot } from "@/services/store/local-store";

export async function GET() {
  try {
    await requireAdminUser();
    return NextResponse.json(await getAdminSnapshot());
  } catch (error) {
    return handleApiError("admin-overview-route", error, "Failed to load admin overview.");
  }
}
