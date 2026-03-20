import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { generateBriefAnalysis } from "@/services/ai/report-service";

const schema = z.object({
  assignmentPrompt: z.string().min(10),
  rubricText: z.string().optional(),
  language: z.enum(["en", "zh", "bilingual"])
});

export async function POST(request: Request) {
  try {
    await requireSessionUser();
    const payload = schema.parse(await request.json());
    return NextResponse.json(await generateBriefAnalysis(payload));
  } catch (error) {
    return handleApiError("analyze-brief-route", error, "Brief analysis failed.");
  }
}
