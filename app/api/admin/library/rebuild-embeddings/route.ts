import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { statusActionSchema } from "@/lib/library/schemas";
import { rebuildEmbeddings } from "@/lib/jobs/rebuild-embeddings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await parseJsonBody(request, statusActionSchema);
    const result = await rebuildEmbeddings({
      entity_type: body.entity_type,
      entity_id: body.entity_id ?? undefined,
      limit: body.limit
    });

    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError("admin-library-rebuild-embeddings", error, "暂时无法重建 embeddings。");
  }
}
