import "server-only";

import { fetchPage, type FetchedPage } from "@/lib/crawler/fetch-page";
import { extractTextFromFetchedPage } from "@/lib/crawler/extract-text";
import { hashContent } from "@/lib/crawler/hash-content";
import { logServerError } from "@/lib/logger";
import { LIBRARY_NORMALIZATION_PROMPT_VERSION } from "@/lib/openai/prompts";
import { createNormalizationRun, getSourcePageByUrl, upsertSourcePage } from "@/lib/library/repository";
import type { SourceSiteRecord } from "@/lib/library/types";

export interface ProcessPageResult {
  page_url: string;
  checked: number;
  is_new: boolean;
  is_updated: boolean;
  queued_for_normalization: boolean;
  failed: boolean;
  source_page_id: string | null;
  error_message: string | null;
}

export async function processPage(options: {
  sourceSite: SourceSiteRecord;
  pageUrl: string;
  crawlRunId: string;
  prefetchedPage?: FetchedPage;
}) {
  const { sourceSite, pageUrl, crawlRunId, prefetchedPage } = options;

  try {
    const fetched = prefetchedPage ?? (await fetchPage(pageUrl, sourceSite.parser_type));
    const extracted = await extractTextFromFetchedPage(fetched);
    const previous = await getSourcePageByUrl(sourceSite.id, pageUrl);
    const contentHash = hashContent([pageUrl, extracted.raw_text, fetched.raw_html ?? ""]);
    const changed = !previous || previous.content_hash !== contentHash || previous.http_status !== fetched.http_status;
    const timestamp = new Date().toISOString();
    const shouldStoreRawContent = fetched.access_level === "public";
    const sourcePage = await upsertSourcePage({
      source_site_id: sourceSite.id,
      university_id: sourceSite.university_id,
      page_url: pageUrl,
      page_title: extracted.page_title,
      page_type: extracted.page_type,
      content_hash: contentHash,
      raw_html: shouldStoreRawContent ? extracted.raw_html : null,
      raw_text: shouldStoreRawContent ? extracted.raw_text : null,
      content_length: extracted.content_length,
      http_status: fetched.http_status,
      access_level: fetched.access_level,
      last_seen_at: timestamp,
      last_changed_at: changed ? timestamp : previous?.last_changed_at ?? null,
      is_deleted: false
    });
    const shouldNormalize =
      changed &&
      fetched.http_status >= 200 &&
      fetched.http_status < 300 &&
      sourcePage.access_level === "public" &&
      Boolean(sourcePage.raw_text && sourcePage.raw_text.length >= 200);

    if (shouldNormalize) {
      await createNormalizationRun({
        crawl_run_id: crawlRunId,
        source_page_id: sourcePage.id,
        status: "queued",
        model_name: process.env.OPENAI_NORMALIZATION_MODEL ?? "gpt-5.4-mini",
        prompt_version: LIBRARY_NORMALIZATION_PROMPT_VERSION,
        input_tokens: null,
        output_tokens: null,
        raw_model_response: null,
        error_log: null,
        started_at: null,
        finished_at: null
      });
    }

    return {
      page_url: pageUrl,
      checked: 1,
      is_new: !previous,
      is_updated: Boolean(previous && changed),
      queued_for_normalization: shouldNormalize,
      failed: false,
      source_page_id: sourcePage.id,
      error_message: null
    } satisfies ProcessPageResult;
  } catch (error) {
    logServerError("crawler-process-page", error, {
      pageUrl,
      sourceSiteId: sourceSite.id
    });

    return {
      page_url: pageUrl,
      checked: 1,
      is_new: false,
      is_updated: false,
      queued_for_normalization: false,
      failed: true,
      source_page_id: null,
      error_message: error instanceof Error ? error.message : "Unknown crawler error"
    } satisfies ProcessPageResult;
  }
}
