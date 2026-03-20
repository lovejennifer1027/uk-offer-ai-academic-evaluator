import { NextResponse } from "next/server";

import { handleApiError, HttpError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser, listReportsByProject } from "@/services/store/local-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSessionUser();
    const { id } = await params;
    const project = await getProjectByIdForUser(id, user.id);

    if (!project) {
      throw new HttpError("Project not found.", 404);
    }

    const latestReport = (await listReportsByProject(project.id))[0];
    const markdown = latestReport
      ? `# ${project.title}

## Overall Summary
${latestReport.jsonReport.overallSummary}

## Revision Checklist
${latestReport.jsonReport.revisionChecklist.map((item) => `- ${item}`).join("\n")}
`
      : `# ${project.title}\n\nNo evaluation report available yet.\n`;

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  } catch (error) {
    return handleApiError("projects-markdown-route", error, "Failed to export markdown.");
  }
}
