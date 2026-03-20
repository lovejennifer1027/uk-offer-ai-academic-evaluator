import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError } from "@/lib/http";
import { getCrawlRunById, listNormalizationRuns } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const item = await getCrawlRunById(id);

    if (!item) {
      return NextResponse.json({ error: "Crawl 记录不存在。" }, { status: 404 });
    }

    const normalization = await listNormalizationRuns(1, 5000);
    return NextResponse.json({
      item,
      normalization_runs: normalization.items.filter((run) => run.crawl_run_id === id)
    });
  } catch (error) {
    return handleApiError("admin-crawl-detail", error, "暂时无法加载 crawl 详情。");
  }
}
