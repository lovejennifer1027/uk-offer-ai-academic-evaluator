import { NextResponse } from "next/server";

import { handleApiError, parseSearchParams } from "@/lib/http";
import { rubricListQuerySchema } from "@/lib/library/schemas";
import { listRubrics } from "@/lib/library/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const query = parseSearchParams(request, rubricListQuerySchema);
    const result = await listRubrics(query);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("library-rubrics-list", error, "暂时无法加载 rubric 列表。");
  }
}
