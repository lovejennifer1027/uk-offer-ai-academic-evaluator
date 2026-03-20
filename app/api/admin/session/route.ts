import { z } from "zod";

import { clearAdminSessionResponse, createAdminSessionResponse } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";

export const runtime = "nodejs";

const adminSessionSchema = z.object({
  secret: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, adminSessionSchema);
    const expected = process.env.UKOFFER_ADMIN_TOKEN ?? process.env.ADMIN_API_KEY ?? "";

    if (!expected) {
      return Response.json({ error: "后台鉴权尚未配置。请先设置 UKOFFER_ADMIN_TOKEN。" }, { status: 503 });
    }

    if (body.secret !== expected) {
      return Response.json({ error: "后台密钥无效。" }, { status: 401 });
    }

    return createAdminSessionResponse();
  } catch (error) {
    return handleApiError("admin-session-login", error, "暂时无法创建后台会话。");
  }
}

export async function DELETE() {
  return clearAdminSessionResponse();
}
