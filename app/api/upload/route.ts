import { NextResponse } from "next/server";

import { handleApiError, HttpError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { getProjectByIdForUser } from "@/services/store/local-store";
import { processCategorizedUpload } from "@/services/files/upload-service";

const allowedCategories = new Set(["essay", "brief", "notes", "other"]);

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const formData = await request.formData();
    const projectId = String(formData.get("projectId") ?? "");
    const category = String(formData.get("category") ?? "other");
    const file = formData.get("file");

    if (!projectId || !(file instanceof File)) {
      throw new HttpError("projectId and file are required.", 400);
    }

    if (!allowedCategories.has(category)) {
      throw new HttpError("Invalid upload category.", 400);
    }

    const project = await getProjectByIdForUser(projectId, user.id);

    if (!project) {
      throw new HttpError("Project not found.", 404);
    }

    const result = await processCategorizedUpload(project.id, category as "essay" | "brief" | "notes" | "other", file);
    return NextResponse.json({
      message: `${result.file.filename} uploaded and indexed successfully.`,
      file: result.file,
      chunkCount: result.chunkCount
    });
  } catch (error) {
    return handleApiError("upload-route", error, "Upload failed.");
  }
}
