import { NextResponse } from "next/server";

import { handleApiError, parseSearchParams } from "@/lib/http";
import { exampleListQuerySchema } from "@/lib/library/schemas";
import { listExamples } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const query = parseSearchParams(request, exampleListQuerySchema);
    const result = await listExamples({
      ...query,
      access_level: query.access_level ?? "public"
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("library-examples-list", error, "暂时无法加载写作样本。");
  }
}
