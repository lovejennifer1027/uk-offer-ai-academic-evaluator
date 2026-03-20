import { NextResponse } from "next/server";

import { requireAdminApiAuth } from "@/lib/admin/auth";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { universityCreateSchema } from "@/lib/library/schemas";
import { createUniversity, listUniversities } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const items = await listUniversities();
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError("admin-universities-list", error, "暂时无法加载大学列表。");
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await parseJsonBody(request, universityCreateSchema);
    const item = await createUniversity(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError("admin-universities-create", error, "暂时无法创建大学记录。");
  }
}
