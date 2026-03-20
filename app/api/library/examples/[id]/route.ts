import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/http";
import { getExampleById } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const item = await getExampleById(id);

    if (!item || item.access_level !== "public") {
      return NextResponse.json({ error: "写作样本不存在。" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError("library-example-detail", error, "暂时无法加载写作样本详情。");
  }
}
