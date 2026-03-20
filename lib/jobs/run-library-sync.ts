import "server-only";

import { processSource } from "@/lib/crawler/process-source";
import { processNormalizationQueue } from "@/lib/jobs/process-normalization-queue";
import { createCrawlRun, getActiveSourceSites, updateCrawlRun } from "@/lib/library/repository";

export async function runLibrarySync(options?: {
  createdBy?: string | null;
  triggerType?: "manual" | "scheduled" | "api";
  deepSync?: boolean;
}) {
  const crawlRun = await createCrawlRun({
    trigger_type: options?.triggerType ?? "manual",
    status: "running",
    started_at: new Date().toISOString(),
    finished_at: null,
    pages_checked: 0,
    pages_new: 0,
    pages_updated: 0,
    pages_failed: 0,
    error_log: null,
    created_by: options?.createdBy ?? "admin"
  });

  try {
    const sources = await getActiveSourceSites();
    const sourceResults = [];

    for (const sourceSite of sources) {
      const result = await processSource({
        sourceSite,
        crawlRunId: crawlRun.id,
        maxPages: options?.deepSync ? 20 : 10
      });
      sourceResults.push(result);
    }

    const normalizationResult = await processNormalizationQueue(options?.deepSync ? 100 : 40);
    const pagesChecked = sourceResults.reduce((total, item) => total + item.checked, 0);
    const pagesNew = sourceResults.reduce((total, item) => total + item.pages_new, 0);
    const pagesUpdated = sourceResults.reduce((total, item) => total + item.pages_updated, 0);
    const pagesFailed = sourceResults.reduce((total, item) => total + item.pages_failed, 0) + normalizationResult.failed;
    const status = pagesFailed > 0 ? "partial" : "completed";

    await updateCrawlRun(crawlRun.id, {
      status,
      finished_at: new Date().toISOString(),
      pages_checked: pagesChecked,
      pages_new: pagesNew,
      pages_updated: pagesUpdated,
      pages_failed: pagesFailed
    });

    return {
      crawl_run_id: crawlRun.id,
      source_results: sourceResults,
      normalization: normalizationResult
    };
  } catch (error) {
    await updateCrawlRun(crawlRun.id, {
      status: "failed",
      finished_at: new Date().toISOString(),
      error_log: error instanceof Error ? error.message : "Unknown library sync error"
    });
    throw error;
  }
}
