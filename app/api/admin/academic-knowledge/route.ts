import { NextResponse } from "next/server";

import { handleApiError, HttpError } from "@/lib/http";
import { requireAdminUser } from "@/lib/session";
import { processSchoolKnowledgeUpload } from "@/services/files/upload-service";
import { listSchoolKnowledgeFiles } from "@/services/store/local-store";

export async function GET(request: Request) {
  try {
    await requireAdminUser();
    const schoolId = new URL(request.url).searchParams.get("schoolId")?.trim() ?? "";
    const files = await listSchoolKnowledgeFiles(schoolId || undefined);
    return NextResponse.json({ files });
  } catch (error) {
    return handleApiError("admin-academic-knowledge-get", error, "Failed to load school knowledge files.");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const formData = await request.formData();
    const school = String(formData.get("school") ?? "").trim();
    const file = formData.get("file");

    if (!school) {
      throw new HttpError("School is required.", 400);
    }

    if (!(file instanceof File)) {
      throw new HttpError("File is required.", 400);
    }

    const result = await processSchoolKnowledgeUpload(school, file);

    return NextResponse.json({
      message: `${result.school.name} · ${result.file.filename} 已上传并进入学校知识库。`,
      school: result.school,
      file: result.file,
      chunkCount: result.chunkCount
    });
  } catch (error) {
    return handleApiError("admin-academic-knowledge-post", error, "Failed to upload school knowledge file.");
  }
}
