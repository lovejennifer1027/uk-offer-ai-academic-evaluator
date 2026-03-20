import "server-only";

import { processSource } from "@/lib/crawler/process-source";
import { processNormalizationQueue } from "@/lib/jobs/process-normalization-queue";
import { createCrawlRun, getSourceSiteById, updateCrawlRun } from "@/lib/library/repository";

export async function runSingleSourceSync(options: {
  sourceSiteId: string;
  createdBy?: string | null;
  maxPages?: number;
  triggerType?: "manual" | "scheduled" | "api";
}) {
  const sourceSite = await getSourceSiteById(options.sourceSiteId);

  if (!sourceSite) {
    throw new Error("Source site not found.");
  }

  const crawlRun = await createCrawlRun({
    trigger_type: options.triggerType ?? "manual",
    status: "running",
    started_at: new Date().toISOString(),
    finished_at: null,
    pages_checked: 0,
    pages_new: 0,
    pages_updated: 0,
    pages_failed: 0,
    error_log: null,
    created_by: options.createdBy ?? "admin"
  });

  try {
    const sourceResult = await processSource({
      sourceSite,
      crawlRunId: crawlRun.id,
      maxPages: options.maxPages
    });
    const normalizationResult = await processNormalizationQueue(25);

    const status = sourceResult.pages_failed > 0 || normalizationResult.failed > 0 ? "partial" : "completed";

    await updateCrawlRun(crawlRun.id, {
      status,
      finished_at: new Date().toISOString(),
      pages_checked: sourceResult.checked,
      pages_new: sourceResult.pages_new,
      pages_updated: sourceResult.pages_updated,
      pages_failed: sourceResult.pages_failed + normalizationResult.failed
    });

    return {
      crawl_run_id: crawlRun.id,
      source: sourceResult,
      normalization: normalizationResult
    };
  } catch (error) {
    await updateCrawlRun(crawlRun.id, {
      status: "failed",
      finished_at: new Date().toISOString(),
      error_log: error instanceof Error ? error.message : "Unknown sync error"
    });
    throw error;
  }
}
