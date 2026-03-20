import { NextResponse } from "next/server";

import { DEFAULT_HISTORY_LIMIT } from "@/lib/constants";
import { logServerError } from "@/lib/logger";
import { listSubmissions } from "@/lib/submissions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") ?? DEFAULT_HISTORY_LIMIT);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : DEFAULT_HISTORY_LIMIT;

    const submissions = await listSubmissions(limit);
    return NextResponse.json(
      { submissions },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    logServerError("submissions-route", error);
    return NextResponse.json({ error: "暂时无法加载历史记录。", submissions: [] }, { status: 500 });
  }
}
