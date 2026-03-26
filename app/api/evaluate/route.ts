import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_RUBRIC_KEY, getRubricPreset } from "@/config/rubrics";
import { extractTextFromFile, validateUpload } from "@/lib/file-extract";
import { HttpError } from "@/lib/http";
import { FileParsingError, ModelEvaluationError, SubmissionValidationError } from "@/lib/errors";
import { generateEvaluation } from "@/lib/evaluator";
import { logServerError } from "@/lib/logger";
import { AdminAccessError, AuthRequiredError, requireSessionUser } from "@/lib/session";
import { persistSubmission } from "@/lib/submissions";
import { cleanText, previewText } from "@/lib/utils";
import { generateEvaluationReport } from "@/services/ai/report-service";
import { createEvaluationReport, getProjectByIdForUser } from "@/services/store/local-store";
import type { SubmissionRecord } from "@/lib/types";

export const runtime = "nodejs";

const LegacyEvaluateRequestSchema = z.object({
  essayTitle: z.string().trim().max(160, "论文标题不能超过 160 个字符。").default(""),
  essayText: z.string().trim().min(1, "请通过粘贴文本或上传支持的文件来提供论文内容。"),
  briefText: z.string().trim().default(""),
  rubricKey: z.string().trim().min(1).default(DEFAULT_RUBRIC_KEY)
});

const DashboardEvaluateSchema = z.object({
  projectId: z.string().min(1),
  school: z.string().min(2),
  programme: z.string().trim().min(2).max(160).optional(),
  studyRoute: z.string().trim().min(2).optional(),
  paperText: z.string().min(20),
  rubricText: z.string().optional(),
  targetLevel: z.string().min(2),
  citationStyle: z.enum(["APA", "MLA", "Harvard", "Chicago"]),
  language: z.enum(["en", "zh", "bilingual"])
});

function inferEssayTitle(explicitTitle: string, essayText: string) {
  if (explicitTitle.trim()) {
    return explicitTitle.trim();
  }

  const firstLine = essayText.split(/\n/).map((line) => line.trim()).find(Boolean);
  return firstLine ? firstLine.slice(0, 90) : "未命名论文";
}

async function resolveTextInput(rawText: string, fileEntry: FormDataEntryValue | null) {
  const text = cleanText(rawText);

  if (text) {
    return text;
  }

  if (fileEntry instanceof File) {
    return extractTextFromFile(fileEntry);
  }

  return "";
}

async function handleLegacyForm(request: Request) {
  const formData = await request.formData();
  const essayFile = formData.get("essayFile");
  const briefFile = formData.get("briefFile");
  const rawEssayText = String(formData.get("essayText") ?? "");
  const rawBriefText = String(formData.get("briefText") ?? "");

  validateUpload(essayFile instanceof File ? essayFile : null);
  validateUpload(briefFile instanceof File ? briefFile : null);

  const essayText = await resolveTextInput(rawEssayText, essayFile);
  const briefText = await resolveTextInput(rawBriefText, briefFile);

  if (essayFile instanceof File && !cleanText(rawEssayText) && !essayText) {
    throw new FileParsingError(`无法从“${essayFile.name}”中提取可读文本。`);
  }

  const validatedInput = LegacyEvaluateRequestSchema.parse({
    essayTitle: String(formData.get("essayTitle") ?? ""),
    essayText,
    briefText,
    rubricKey: String(formData.get("rubricKey") ?? DEFAULT_RUBRIC_KEY) || DEFAULT_RUBRIC_KEY
  });
  const rubric = getRubricPreset(validatedInput.rubricKey);

  const report = await generateEvaluation({
    essayText: validatedInput.essayText,
    briefText: validatedInput.briefText,
    rubricKey: rubric.key
  });

  const submission: SubmissionRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    essayTitle: inferEssayTitle(validatedInput.essayTitle, validatedInput.essayText),
    essayTextPreview: previewText(validatedInput.essayText, 220),
    briefPreview: previewText(validatedInput.briefText, 180),
    rubricKey: rubric.key,
    rubricLabel: rubric.label,
    report,
    source: "local"
  };

  const persisted = await persistSubmission(submission);
  const responseSubmission = {
    ...submission,
    source: persisted.storageMode === "supabase" ? "supabase" : "local"
  } satisfies SubmissionRecord;

  return NextResponse.json({
    submission: responseSubmission,
    storageMode: persisted.storageMode
  });
}

async function handleDashboardJson(request: Request) {
  const user = await requireSessionUser();
  const payload = DashboardEvaluateSchema.parse(await request.json());
  const project = await getProjectByIdForUser(payload.projectId, user.id);

  if (!project) {
    throw new HttpError("Project not found.", 404);
  }

  const result = await generateEvaluationReport({
    projectId: project.id,
    school: payload.school,
    programme: payload.programme?.trim() || project.programme || project.module || project.title,
    studyRoute: payload.studyRoute,
    paperText: payload.paperText,
    rubricText: payload.rubricText,
    targetLevel: payload.targetLevel,
    citationStyle: payload.citationStyle,
    language: payload.language
  });

  const report = await createEvaluationReport({
    projectId: project.id,
    overallScore: result.overallScore,
    jsonReport: result.jsonReport
  });

  return NextResponse.json({
    id: report.id,
    overallScore: report.overallScore,
    jsonReport: report.jsonReport
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return await handleDashboardJson(request);
    }

    return await handleLegacyForm(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "提交内容无效。" }, { status: 400 });
    }

    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode });
    }

    if (
      error instanceof SubmissionValidationError ||
      error instanceof FileParsingError ||
      error instanceof ModelEvaluationError
    ) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    logServerError("evaluation-route", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "评估暂时无法完成，请检查输入内容后重试。"
      },
      { status: 500 }
    );
  }
}
