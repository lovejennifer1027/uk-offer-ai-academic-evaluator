import { NextResponse } from "next/server";

import { logServerError } from "@/lib/logger";
import { getSubmissionById } from "@/lib/submissions";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const submission = await getSubmissionById(id);

    if (!submission) {
      return NextResponse.json({ error: "未找到这份报告。", submission: null }, { status: 404 });
    }

    return NextResponse.json(
      { submission },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    logServerError("submission-detail-route", error);
    return NextResponse.json({ error: "暂时无法加载这份报告。", submission: null }, { status: 500 });
  }
}
