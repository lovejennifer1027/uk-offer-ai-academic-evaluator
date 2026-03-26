import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { generateBriefAnalysis } from "@/services/ai/report-service";
import { createBriefAnalysis, getProjectByIdForUser } from "@/services/store/local-store";

const schema = z.object({
  projectId: z.string().min(1),
  assignmentPrompt: z.string().min(10),
  rubricText: z.string().optional(),
  language: z.enum(["en", "zh", "bilingual"])
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json());
    const project = await getProjectByIdForUser(payload.projectId, user.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const analysis = await generateBriefAnalysis({
      assignmentPrompt: payload.assignmentPrompt,
      rubricText: payload.rubricText,
      language: payload.language
    });

    const savedAnalysis = await createBriefAnalysis({
      projectId: project.id,
      jsonAnalysis: analysis
    });

    return NextResponse.json({
      ...savedAnalysis.jsonAnalysis,
      id: savedAnalysis.id,
      createdAt: savedAnalysis.createdAt
    });
  } catch (error) {
    return handleApiError("analyze-brief-route", error, "Brief analysis failed.");
  }
}
