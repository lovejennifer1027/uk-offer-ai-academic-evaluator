import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { testCrawlSchema } from "@/lib/library/schemas";
import { runSingleSourceSync } from "@/lib/jobs/run-single-source-sync";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const body = await parseJsonBody(request, testCrawlSchema);
    const result = await runSingleSourceSync({
      sourceSiteId: id,
      maxPages: body.max_pages,
      createdBy: "admin:test-crawl",
      triggerType: "manual"
    });

    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError("admin-source-test-crawl", error, "暂时无法执行测试 crawl。");
  }
}
