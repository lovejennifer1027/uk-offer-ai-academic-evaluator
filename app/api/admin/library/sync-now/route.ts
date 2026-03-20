import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { crawlRunSchema } from "@/lib/library/schemas";
import { runLibrarySync } from "@/lib/jobs/run-library-sync";
import { runSingleSourceSync } from "@/lib/jobs/run-single-source-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await parseJsonBody(request, crawlRunSchema);

    const result = body.source_site_id
      ? await runSingleSourceSync({
          sourceSiteId: body.source_site_id,
          createdBy: body.created_by,
          triggerType: body.trigger_type
        })
      : await runLibrarySync({
          createdBy: body.created_by,
          triggerType: body.trigger_type,
          deepSync: body.deep_sync === true
        });

    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError("admin-library-sync-now", error, "暂时无法启动同步。");
  }
}
