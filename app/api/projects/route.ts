import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { createProject, listProjectsByUser } from "@/services/store/local-store";

const createProjectSchema = z.object({
  title: z.string().min(2),
  school: z.string().min(2),
  programme: z.string().trim().min(2).optional(),
  module: z.string().min(1),
  assignmentType: z.enum(["essay", "report", "dissertation", "reflection", "proposal", "presentation"]),
  language: z.enum(["en", "zh", "bilingual"])
});

export async function GET() {
  try {
    const user = await requireSessionUser();
    return NextResponse.json({ projects: await listProjectsByUser(user.id) });
  } catch (error) {
    return handleApiError("projects-get-route", error, "Failed to load projects.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = createProjectSchema.parse(await request.json());
    const project = await createProject({
      userId: user.id,
      title: payload.title,
      school: payload.school,
      programme: payload.programme?.trim() || payload.module || payload.title,
      module: payload.module,
      assignmentType: payload.assignmentType,
      language: payload.language,
      status: "active",
      tags: []
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleApiError("projects-post-route", error, "Failed to create project.");
  }
}
