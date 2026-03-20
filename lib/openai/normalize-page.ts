import "server-only";

import type { LibraryInsightEvidence, LibraryInsightAnswer, NormalizedLibraryRecord, SourcePageRecord } from "@/lib/library/types";
import { cleanText } from "@/lib/utils";
import { requestStructuredJson } from "@/lib/openai/client";
import { buildInsightSynthesisPrompt, buildNormalizationPrompt, LIBRARY_INSIGHTS_PROMPT_VERSION, LIBRARY_NORMALIZATION_PROMPT_VERSION } from "@/lib/openai/prompts";
import {
  InsightSynthesisSchema,
  insightSynthesisJsonSchema,
  NormalizationOutputSchema,
  normalizationJsonSchema
} from "@/lib/openai/schemas";

function cleanList(items: string[]) {
  return items.map((item) => cleanText(item)).filter(Boolean).slice(0, 8);
}

function sanitizeNormalizationRecord(record: NormalizedLibraryRecord): NormalizedLibraryRecord {
  return {
    ...record,
    university: record.university ? cleanText(record.university) : null,
    department: record.department ? cleanText(record.department) : null,
    title: record.title ? cleanText(record.title) : null,
    year_label: record.year_label ? cleanText(record.year_label) : null,
    score_band: record.score_band ? cleanText(record.score_band) : null,
    public_excerpt: record.public_excerpt ? cleanText(record.public_excerpt) : null,
    strengths: cleanList(record.strengths),
    weaknesses: cleanList(record.weaknesses),
    marker_comments_summary: cleanList(record.marker_comments_summary),
    ai_summary: record.ai_summary ? cleanText(record.ai_summary) : null,
    rubric_name: record.rubric_name ? cleanText(record.rubric_name) : null,
    rubric_text: record.rubric_text ? cleanText(record.rubric_text) : null,
    feedback_text: record.feedback_text ? cleanText(record.feedback_text) : null
  };
}

export async function normalizeSourcePageWithOpenAI(sourcePage: SourcePageRecord, universityName: string, sourceSiteName: string) {
  const response = await requestStructuredJson<NormalizedLibraryRecord>({
    model: process.env.OPENAI_NORMALIZATION_MODEL ?? "gpt-5.4-mini",
    schemaName: "uk_offer_library_normalization",
    schemaDescription:
      "Normalize a crawled public university writing-library page into one structured library record or ignore.",
    schema: normalizationJsonSchema,
    input: buildNormalizationPrompt({
      sourcePage,
      universityName,
      sourceSiteName
    }),
    maxOutputTokens: 2200,
    reasoningEffort: "low"
  });

  const validated = NormalizationOutputSchema.parse(response.data);

  return {
    record: sanitizeNormalizationRecord(validated),
    response_id: response.response_id,
    prompt_version: LIBRARY_NORMALIZATION_PROMPT_VERSION,
    input_tokens: response.input_tokens,
    output_tokens: response.output_tokens,
    raw_model_response: response.raw_response
  };
}

export async function synthesizeLibraryInsights(query: string, evidence: LibraryInsightEvidence[]): Promise<{
  answer: LibraryInsightAnswer;
  prompt_version: string;
}> {
  const response = await requestStructuredJson<LibraryInsightAnswer>({
    model: process.env.OPENAI_INSIGHTS_MODEL ?? "gpt-5.4",
    schemaName: "uk_offer_library_insight_answer",
    schemaDescription:
      "Generate a concise source-backed insight answer using only the retrieved library evidence.",
    schema: insightSynthesisJsonSchema,
    input: buildInsightSynthesisPrompt({
      query,
      evidence
    }),
    maxOutputTokens: 1800,
    reasoningEffort: "medium"
  });

  return {
    answer: InsightSynthesisSchema.parse(response.data),
    prompt_version: LIBRARY_INSIGHTS_PROMPT_VERSION
  };
}
