import "server-only";

import { discoverLinksFromHtml } from "@/lib/crawler/extract-text";
import { fetchPage } from "@/lib/crawler/fetch-page";
import { processPage } from "@/lib/crawler/process-page";
import { updateSourceSite } from "@/lib/library/repository";
import type { SourceSiteRecord } from "@/lib/library/types";

const KEYWORDS = [
  "rubric",
  "criteria",
  "descriptor",
  "sample",
  "essay",
  "dissertation",
  "feedback",
  "annotated",
  "writing",
  "assessment"
];

const SOURCE_TYPE_KEYWORDS: Partial<Record<SourceSiteRecord["source_type"], string[]>> = {
  dissertation_examples: ["dissertation", "thesis", "project"],
  rubric: ["rubric", "criteria", "descriptor", "marking"],
  annotated_writing: ["annotated", "commented", "writing"],
  feedback_guide: ["feedback", "comment", "feedforward"],
  sample_essay: ["sample", "essay", "model answer"]
};

function selectCandidateLinks(sourceSite: SourceSiteRecord, urls: string[], maxPages: number) {
  const { base_url: baseUrl, source_type: sourceType } = sourceSite;
  const baseHost = new URL(baseUrl).host;
  const keywords = [...KEYWORDS, ...(SOURCE_TYPE_KEYWORDS[sourceType] ?? [])];
  const scored = urls
    .filter((item) => {
      try {
        return new URL(item).host === baseHost;
      } catch {
        return false;
      }
    })
    .map((item) => {
      const lowered = item.toLowerCase();
      const score = keywords.reduce((total, keyword) => total + (lowered.includes(keyword) ? 1 : 0), 0);
      const fileBonus = lowered.endsWith(".pdf") || lowered.endsWith(".docx") ? 2 : 0;
      return {
        url: item,
        score: score + fileBonus
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return [baseUrl, ...scored.map((item) => item.url)].filter((item, index, collection) => collection.indexOf(item) === index).slice(0, maxPages);
}

export async function processSource(options: {
  sourceSite: SourceSiteRecord;
  crawlRunId: string;
  maxPages?: number;
}) {
  const { sourceSite, crawlRunId, maxPages = 12 } = options;
  const prefetchedBase = await fetchPage(sourceSite.base_url, sourceSite.parser_type);
  const discoveredLinks =
    prefetchedBase.raw_html && prefetchedBase.parser_type === "html"
      ? discoverLinksFromHtml(prefetchedBase.raw_html, prefetchedBase.final_url)
      : [];
  const candidateUrls = selectCandidateLinks(sourceSite, discoveredLinks, maxPages);

  const results = [];

  for (const candidateUrl of candidateUrls) {
    const result = await processPage({
      sourceSite,
      pageUrl: candidateUrl,
      crawlRunId,
      prefetchedPage: candidateUrl === sourceSite.base_url ? prefetchedBase : undefined
    });
    results.push(result);
  }

  await updateSourceSite(sourceSite.id, {
    last_crawled_at: new Date().toISOString()
  });

  return {
    source_site_id: sourceSite.id,
    checked: results.reduce((total, item) => total + item.checked, 0),
    pages_new: results.filter((item) => item.is_new).length,
    pages_updated: results.filter((item) => item.is_updated).length,
    pages_failed: results.filter((item) => item.failed).length,
    queued_for_normalization: results.filter((item) => item.queued_for_normalization).length,
    results
  };
}
