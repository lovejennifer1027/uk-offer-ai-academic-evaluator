import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { processNormalizationQueue } from "@/lib/jobs/process-normalization-queue";
import { normalizationRetrySchema } from "@/lib/library/schemas";
import { retryNormalizationRuns } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await parseJsonBody(request, normalizationRetrySchema);
    const items = await retryNormalizationRuns(body.ids, body.status);
    const processed =
      body.process_now === true && items.length > 0
        ? await processNormalizationQueue({
            limit: items.length,
            ids: items.map((item) => item.id)
          })
        : null;

    return NextResponse.json({ items, processed });
  } catch (error) {
    return handleApiError("admin-normalization-retry", error, "暂时无法重试 normalization 任务。");
  }
}
