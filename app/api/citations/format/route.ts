import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError, HttpError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { formatCitations } from "@/services/ai/report-service";
import { createCitationJob, getProjectByIdForUser } from "@/services/store/local-store";

const schema = z.object({
  rawText: z.string().min(3),
  style: z.enum(["APA", "MLA", "Harvard", "Chicago"]),
  projectId: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json());

    if (payload.projectId) {
      const project = await getProjectByIdForUser(payload.projectId, user.id);

      if (!project) {
        throw new HttpError("Project not found.", 404);
      }
    }

    const result = await formatCitations({ rawText: payload.rawText, style: payload.style });
    await createCitationJob({
      projectId: payload.projectId,
      style: payload.style,
      inputText: payload.rawText,
      outputText: result.formattedEntries.join("\n")
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("citations-format-route", error, "Citation formatting failed.");
  }
}
