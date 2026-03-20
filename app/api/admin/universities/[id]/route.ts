import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { universityPatchSchema } from "@/lib/library/schemas";
import { updateUniversity } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const body = await parseJsonBody(request, universityPatchSchema);
    const item = await updateUniversity(id, body);

    if (!item) {
      return NextResponse.json({ error: "大学记录不存在。" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError("admin-universities-update", error, "暂时无法更新大学记录。");
  }
}
