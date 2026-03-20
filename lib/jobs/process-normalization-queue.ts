import "server-only";

import { clearSourcePageDerivatives, getSourcePageById, getSourceSiteById, getUniversityLookup, listQueuedNormalizationRuns, replaceMarkerFeedbackPatternsForSourcePage, resolveUniversityIdByName, updateNormalizationRun, upsertHighScoringExampleBySourcePage, upsertRubricBySourcePage } from "@/lib/library/repository";
import { rebuildEmbeddings } from "@/lib/jobs/rebuild-embeddings";
import { normalizeSourcePageWithOpenAI } from "@/lib/openai/normalize-page";
import { logServerError } from "@/lib/logger";

export async function processNormalizationQueue(
  options: number | { limit?: number; ids?: string[] } = 20
) {
  const limit = typeof options === "number" ? options : options.limit ?? 20;
  const ids = typeof options === "number" ? undefined : options.ids;
  const queuedRuns = await listQueuedNormalizationRuns(limit, ids);
  const universityLookup = await getUniversityLookup();
  let completed = 0;
  let failed = 0;
  let ignored = 0;

  for (const run of queuedRuns) {
    try {
      await updateNormalizationRun(run.id, {
        status: "running",
        started_at: new Date().toISOString(),
        error_log: null
      });

      const sourcePage = await getSourcePageById(run.source_page_id);

      if (!sourcePage || !sourcePage.raw_text) {
        throw new Error("Source page text is unavailable for normalization.");
      }

      const sourceSite = await getSourceSiteById(sourcePage.source_site_id);
      const universityName = universityLookup.get(sourcePage.university_id)?.name ?? "Unknown university";
      const normalized = await normalizeSourcePageWithOpenAI(
        sourcePage,
        universityName,
        sourceSite?.name ?? "Unknown source site"
      );
      const resolvedUniversityId =
        (await resolveUniversityIdByName(normalized.record.university)) ?? sourcePage.university_id;

      await clearSourcePageDerivatives(sourcePage.id);

      if (normalized.record.record_type === "high_scoring_example") {
        const example = await upsertHighScoringExampleBySourcePage(sourcePage.id, {
          university_id: resolvedUniversityId,
          department: normalized.record.department,
          programme_level: normalized.record.programme_level ?? "unknown",
          assignment_type: normalized.record.assignment_type ?? "unknown",
          title: normalized.record.title,
          year_label: normalized.record.year_label,
          exact_score: normalized.record.exact_score,
          score_band: normalized.record.score_band,
          public_excerpt: normalized.record.public_excerpt,
          strengths: normalized.record.strengths,
          weaknesses: normalized.record.weaknesses,
          marker_comments_summary: normalized.record.marker_comments_summary,
          ai_summary: normalized.record.ai_summary,
          source_url: sourcePage.page_url,
          access_level: normalized.record.access_level,
          is_verified: false,
          verified_by: null,
          verified_at: null
        });
        await rebuildEmbeddings({
          entities: [{ entity_type: "example", entity_id: example.id }]
        });
      } else if (normalized.record.record_type === "rubric") {
        const rubric = await upsertRubricBySourcePage(sourcePage.id, {
          university_id: resolvedUniversityId,
          department: normalized.record.department,
          programme_level: normalized.record.programme_level,
          rubric_name: normalized.record.rubric_name ?? normalized.record.title,
          rubric_text: normalized.record.rubric_text ?? normalized.record.ai_summary,
          rubric_json: normalized.record.rubric_json,
          score_ranges: normalized.record.score_ranges,
          source_url: sourcePage.page_url,
          is_verified: false
        });
        await rebuildEmbeddings({
          entities: [{ entity_type: "rubric", entity_id: rubric.id }]
        });
      } else if (normalized.record.record_type === "marker_feedback_pattern" && normalized.record.feedback_text) {
        const feedback = await replaceMarkerFeedbackPatternsForSourcePage(sourcePage.id, resolvedUniversityId, sourcePage.page_url, [
          {
            programme_level: normalized.record.programme_level,
            feedback_type: normalized.record.feedback_type ?? "suggestion",
            feedback_text: normalized.record.feedback_text,
            category: normalized.record.category ?? "general"
          }
        ]);

        await rebuildEmbeddings({
          entities: feedback.map((item) => ({
            entity_type: "feedback" as const,
            entity_id: item.id
          }))
        });
      } else {
        ignored += 1;
      }

      await updateNormalizationRun(run.id, {
        status: "completed",
        finished_at: new Date().toISOString(),
        model_name: process.env.OPENAI_NORMALIZATION_MODEL ?? "gpt-5.4-mini",
        prompt_version: normalized.prompt_version,
        input_tokens: normalized.input_tokens,
        output_tokens: normalized.output_tokens,
        raw_model_response:
          normalized.raw_model_response && typeof normalized.raw_model_response === "object"
            ? (normalized.raw_model_response as Record<string, unknown>)
            : { response_id: normalized.response_id, record: normalized.record }
      });
      completed += 1;
    } catch (error) {
      failed += 1;
      logServerError("normalization-queue", error, {
        normalizationRunId: run.id,
        sourcePageId: run.source_page_id
      });
      await updateNormalizationRun(run.id, {
        status: "failed",
        finished_at: new Date().toISOString(),
        error_log: error instanceof Error ? error.message : "Unknown normalization error"
      });
    }
  }

  return {
    queued: queuedRuns.length,
    completed,
    failed,
    ignored
  };
}
