import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError } from "@/lib/http";
import { getNormalizationRunById, getSourcePageById } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const item = await getNormalizationRunById(id);

    if (!item) {
      return NextResponse.json({ error: "Normalization 任务不存在。" }, { status: 404 });
    }

    const source_page = await getSourcePageById(item.source_page_id);
    return NextResponse.json({ item, source_page });
  } catch (error) {
    return handleApiError("admin-normalization-detail", error, "暂时无法加载 normalization 详情。");
  }
}
