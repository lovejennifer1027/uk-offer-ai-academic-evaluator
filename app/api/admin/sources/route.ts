import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { sourceSiteCreateSchema } from "@/lib/library/schemas";
import { createSourceSite, listSourceSites } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const items = await listSourceSites();
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError("admin-sources-list", error, "暂时无法加载 source 列表。");
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await parseJsonBody(request, sourceSiteCreateSchema);
    const item = await createSourceSite(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError("admin-sources-create", error, "暂时无法创建 source 配置。");
  }
}
