import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";

export async function POST() {
  try {
    await requireSessionUser();
    return NextResponse.json({
      status: "queued",
      message: "Embeddings are created during upload in this first version. This route is reserved for explicit re-index jobs."
    });
  } catch (error) {
    return handleApiError("embed-route", error, "Embedding job could not be queued.");
  }
}
