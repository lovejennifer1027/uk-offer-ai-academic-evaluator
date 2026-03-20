import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/http";
import { getRubricById } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const item = await getRubricById(id);

    if (!item) {
      return NextResponse.json({ error: "Rubric 记录不存在。" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError("library-rubric-detail", error, "暂时无法加载 rubric 详情。");
  }
}
