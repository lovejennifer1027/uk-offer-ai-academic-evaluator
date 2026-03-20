import { createClient } from "@supabase/supabase-js";

import { EvaluationReportSchema, normaliseEvaluationReport } from "@/lib/evaluation-schema";
import { logServerError, logServerWarning } from "@/lib/logger";
import { sampleSubmissions } from "@/lib/seed-data";
import type { SubmissionRecord } from "@/lib/types";

interface SubmissionRow {
  id: string;
  created_at: string;
  essay_title: string;
  essay_preview: string;
  brief_preview: string;
  rubric_key: string;
  rubric_label: string;
  evaluation: SubmissionRecord["report"];
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function mapRow(row: SubmissionRow): SubmissionRecord | null {
  const parsedReport = EvaluationReportSchema.safeParse(row.evaluation);

  if (!parsedReport.success) {
    logServerWarning("submission-row-invalid", "Skipping submission row with invalid evaluation payload.", {
      submissionId: row.id,
      issues: parsedReport.error.issues
    });
    return null;
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    essayTitle: row.essay_title,
    essayTextPreview: row.essay_preview,
    briefPreview: row.brief_preview,
    rubricKey: row.rubric_key,
    rubricLabel: row.rubric_label,
    report: normaliseEvaluationReport(parsedReport.data),
    source: "supabase"
  };
}

export async function persistSubmission(submission: SubmissionRecord) {
  const client = getSupabaseClient();

  if (!client) {
    return { storageMode: "local" as const };
  }

  try {
    const { error } = await client.from("essay_submissions").insert({
      id: submission.id,
      created_at: submission.createdAt,
      essay_title: submission.essayTitle,
      essay_preview: submission.essayTextPreview,
      brief_preview: submission.briefPreview,
      rubric_key: submission.rubricKey,
      rubric_label: submission.rubricLabel,
      total_score: submission.report.overall_score,
      evaluation: submission.report
    });

    if (error) {
      logServerError("supabase-insert", error, {
        submissionId: submission.id
      });
      return { storageMode: "local" as const };
    }
  } catch (error) {
    logServerError("supabase-insert-throw", error, {
      submissionId: submission.id
    });
    return { storageMode: "local" as const };
  }

  return { storageMode: "supabase" as const };
}

export async function listSubmissions(limit: number) {
  const client = getSupabaseClient();

  if (!client) {
    return sampleSubmissions.slice(0, limit);
  }

  try {
    const { data, error } = await client
      .from("essay_submissions")
      .select("id, created_at, essay_title, essay_preview, brief_preview, rubric_key, rubric_label, evaluation")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      logServerError("supabase-list", error ?? "No data returned from Supabase.");
      return sampleSubmissions.slice(0, limit);
    }

    return (data as SubmissionRow[]).map(mapRow).filter((submission): submission is SubmissionRecord => Boolean(submission));
  } catch (error) {
    logServerError("supabase-list-throw", error);
    return sampleSubmissions.slice(0, limit);
  }
}

export async function getSubmissionById(id: string) {
  const client = getSupabaseClient();

  if (!client) {
    return sampleSubmissions.find((submission) => submission.id === id) ?? null;
  }

  try {
    const { data, error } = await client
      .from("essay_submissions")
      .select("id, created_at, essay_title, essay_preview, brief_preview, rubric_key, rubric_label, evaluation")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logServerError("supabase-detail", error, { submissionId: id });
    }

    if (!data) {
      return sampleSubmissions.find((submission) => submission.id === id) ?? null;
    }

    return mapRow(data as SubmissionRow) ?? sampleSubmissions.find((submission) => submission.id === id) ?? null;
  } catch (error) {
    logServerError("supabase-detail-throw", error, { submissionId: id });
    return sampleSubmissions.find((submission) => submission.id === id) ?? null;
  }
}
