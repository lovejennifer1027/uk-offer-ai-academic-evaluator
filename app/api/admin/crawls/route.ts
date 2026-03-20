import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseSearchParams } from "@/lib/http";
import { crawlListQuerySchema } from "@/lib/library/schemas";
import { listCrawlRunsPaginated } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const query = parseSearchParams(request, crawlListQuerySchema);
    const result = await listCrawlRunsPaginated(query.page, query.page_size, query.status);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("admin-crawls-list", error, "暂时无法加载 crawl 历史。");
  }
}
