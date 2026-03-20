import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { rubricPatchSchema } from "@/lib/library/schemas";
import { updateRubric } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const body = await parseJsonBody(request, rubricPatchSchema);
    const item = await updateRubric(id, body);

    if (!item) {
      return NextResponse.json({ error: "Rubric 记录不存在。" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError("admin-rubric-update", error, "暂时无法更新 rubric 记录。");
  }
}
