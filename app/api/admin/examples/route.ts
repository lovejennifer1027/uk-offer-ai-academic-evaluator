import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseSearchParams } from "@/lib/http";
import { exampleListQuerySchema } from "@/lib/library/schemas";
import { listExamples } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const query = parseSearchParams(request, exampleListQuerySchema);
    const result = await listExamples(query);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("admin-examples-list", error, "暂时无法加载示例列表。");
  }
}
