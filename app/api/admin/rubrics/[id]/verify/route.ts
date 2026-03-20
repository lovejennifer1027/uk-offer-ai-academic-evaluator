import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError } from "@/lib/http";
import { verifyRubric } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const item = await verifyRubric(id);

    if (!item) {
      return NextResponse.json({ error: "Rubric 记录不存在。" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError("admin-rubric-verify", error, "暂时无法验证 rubric 记录。");
  }
}
