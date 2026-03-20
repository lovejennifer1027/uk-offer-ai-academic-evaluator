import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseSearchParams } from "@/lib/http";
import { normalizationListQuerySchema } from "@/lib/library/schemas";
import { listNormalizationRuns } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const query = parseSearchParams(request, normalizationListQuerySchema);
    const result = await listNormalizationRuns(query.page, query.page_size, query.status);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("admin-normalization-list", error, "暂时无法加载 normalization 任务。");
  }
}
