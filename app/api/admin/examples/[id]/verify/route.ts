import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { verifySchema } from "@/lib/library/schemas";
import { verifyExample } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const body = await parseJsonBody(request, verifySchema);
    const item = await verifyExample(id, body.verified_by);

    if (!item) {
      return NextResponse.json({ error: "示例记录不存在。" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError("admin-example-verify", error, "暂时无法验证示例记录。");
  }
}
