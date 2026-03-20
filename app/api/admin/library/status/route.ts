import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError } from "@/lib/http";
import { getLibraryStatus } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const status = await getLibraryStatus();
    return NextResponse.json({ status });
  } catch (error) {
    return handleApiError("admin-library-status", error, "暂时无法加载 library 状态。");
  }
}
