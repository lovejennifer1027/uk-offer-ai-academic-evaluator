import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseSearchParams } from "@/lib/http";
import { rubricListQuerySchema } from "@/lib/library/schemas";
import { listRubrics } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const query = parseSearchParams(request, rubricListQuerySchema);
    const result = await listRubrics(query);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("admin-rubrics-list", error, "暂时无法加载 rubric 列表。");
  }
}
