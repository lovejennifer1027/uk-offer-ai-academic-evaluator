import "server-only";

import { randomUUID } from "node:crypto";

import { createLibrarySeedSnapshot } from "@/lib/library/mock-data";
import type {
  CrawlRunRecord,
  ExampleListFilters,
  FeedbackListFilters,
  HighScoringExampleRecord,
  LibraryEmbeddingEntityType,
  LibraryInsightEvidence,
  LibrarySearchFilters,
  LibrarySearchResultItem,
  LibrarySnapshot,
  LibraryStatusSummary,
  MarkerFeedbackPatternRecord,
  NormalizationRunRecord,
  PaginatedResult,
  RubricListFilters,
  RubricRecord,
  SourcePageRecord,
  SourceSiteRecord,
  UniversityRecord
} from "@/lib/library/types";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/server";
import { cleanText } from "@/lib/utils";

type MutableLibrarySnapshot = LibrarySnapshot;

type SourcePageUpsertInput = Omit<SourcePageRecord, "id" | "created_at" | "updated_at" | "first_seen_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  first_seen_at?: string;
};

type SearchRpcRow = {
  entity_type: LibraryEmbeddingEntityType;
  entity_id: string;
  chunk_text: string;
  similarity: number;
  title: string;
  source_url: string;
  university_name: string;
  summary: string;
};

const globalForLibrary = globalThis as typeof globalThis & {
  __UKOFFER_LIBRARY_MEMORY__?: MutableLibrarySnapshot;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso() {
  return new Date().toISOString();
}

function getMemoryStore() {
  if (!globalForLibrary.__UKOFFER_LIBRARY_MEMORY__) {
    globalForLibrary.__UKOFFER_LIBRARY_MEMORY__ = createLibrarySeedSnapshot();
  }

  return globalForLibrary.__UKOFFER_LIBRARY_MEMORY__;
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    page_size: pageSize,
    page_count: pageCount
  };
}

function compareDateDesc(a: { updated_at?: string; created_at?: string }, b: { updated_at?: string; created_at?: string }) {
  const left = a.updated_at ?? a.created_at ?? "";
  const right = b.updated_at ?? b.created_at ?? "";
  return right.localeCompare(left);
}

function compareNamedRecord(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name);
}

function normaliseSearchText(value: string) {
  return cleanText(value).toLowerCase();
}

function includesQuery(parts: Array<string | null | undefined>, query?: string | null) {
  if (!query) {
    return true;
  }

  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function scoreTextMatch(query: string, text: string) {
  const queryTerms = normaliseSearchText(query).split(/\s+/).filter(Boolean);
  const haystack = normaliseSearchText(text);

  if (queryTerms.length === 0 || !haystack) {
    return 0;
  }

  let hits = 0;

  for (const term of queryTerms) {
    if (haystack.includes(term)) {
      hits += 1;
    }
  }

  return hits / queryTerms.length;
}

function buildUniversityMap(universities: UniversityRecord[]) {
  return new Map(universities.map((university) => [university.id, university]));
}

function findUniversityByName(universities: UniversityRecord[], name: string | null | undefined) {
  if (!name) {
    return null;
  }

  const lowered = name.trim().toLowerCase();
  return (
    universities.find((item) => item.name.toLowerCase() === lowered) ??
    universities.find((item) => item.short_name?.toLowerCase() === lowered) ??
    null
  );
}

async function fetchAllUniversities() {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().universities).sort(compareNamedRecord);
  }

  const { data, error } = await client.from("universities").select("*").order("name");

  if (error) {
    throw error;
  }

  return (data ?? []) as UniversityRecord[];
}

export async function listUniversities() {
  return fetchAllUniversities();
}

export async function createUniversity(input: Omit<UniversityRecord, "id" | "created_at" | "updated_at">) {
  const timestamp = nowIso();
  const record: UniversityRecord = {
    id: randomUUID(),
    created_at: timestamp,
    updated_at: timestamp,
    ...input
  };

  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    store.universities.push(record);
    return clone(record);
  }

  const { data, error } = await client.from("universities").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as UniversityRecord;
}

export async function updateUniversity(id: string, patch: Partial<UniversityRecord>) {
  const client = getOptionalSupabaseAdminClient();
  const payload = {
    ...patch,
    updated_at: nowIso()
  };

  if (!client) {
    const store = getMemoryStore();
    const record = store.universities.find((item) => item.id === id);

    if (!record) {
      return null;
    }

    Object.assign(record, payload);
    return clone(record);
  }

  const { data, error } = await client.from("universities").update(payload).eq("id", id).select("*").maybeSingle();

  if (error) {
    throw error;
  }

  return (data as UniversityRecord | null) ?? null;
}

export async function listSourceSites() {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().source_sites).sort(compareDateDesc);
  }

  const { data, error } = await client.from("source_sites").select("*").order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SourceSiteRecord[];
}

export async function getSourceSiteById(id: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().source_sites.find((item) => item.id === id) ?? null);
  }

  const { data, error } = await client.from("source_sites").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SourceSiteRecord | null) ?? null;
}

export async function getActiveSourceSites() {
  const sites = await listSourceSites();
  return sites.filter((site) => site.is_active);
}

export async function createSourceSite(input: Omit<SourceSiteRecord, "id" | "created_at" | "updated_at" | "last_crawled_at"> & { last_crawled_at?: string | null }) {
  const timestamp = nowIso();
  const record: SourceSiteRecord = {
    id: randomUUID(),
    created_at: timestamp,
    updated_at: timestamp,
    last_crawled_at: input.last_crawled_at ?? null,
    ...input
  };

  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    store.source_sites.push(record);
    return clone(record);
  }

  const { data, error } = await client.from("source_sites").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as SourceSiteRecord;
}

export async function updateSourceSite(id: string, patch: Partial<SourceSiteRecord>) {
  const client = getOptionalSupabaseAdminClient();
  const payload = {
    ...patch,
    updated_at: nowIso()
  };

  if (!client) {
    const store = getMemoryStore();
    const record = store.source_sites.find((item) => item.id === id);

    if (!record) {
      return null;
    }

    Object.assign(record, payload);
    return clone(record);
  }

  const { data, error } = await client.from("source_sites").update(payload).eq("id", id).select("*").maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SourceSiteRecord | null) ?? null;
}

export async function getSourcePageById(id: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().source_pages.find((item) => item.id === id) ?? null);
  }

  const { data, error } = await client.from("source_pages").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SourcePageRecord | null) ?? null;
}

export async function getSourcePageByUrl(sourceSiteId: string, pageUrl: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(
      getMemoryStore().source_pages.find((item) => item.source_site_id === sourceSiteId && item.page_url === pageUrl) ?? null
    );
  }

  const { data, error } = await client
    .from("source_pages")
    .select("*")
    .eq("source_site_id", sourceSiteId)
    .eq("page_url", pageUrl)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SourcePageRecord | null) ?? null;
}

export async function upsertSourcePage(input: SourcePageUpsertInput) {
  const existing = await getSourcePageByUrl(input.source_site_id, input.page_url);
  const timestamp = nowIso();

  if (existing) {
    const patch: Partial<SourcePageRecord> = {
      ...input,
      id: existing.id,
      updated_at: timestamp,
      last_seen_at: input.last_seen_at ?? timestamp
    };
    const client = getOptionalSupabaseAdminClient();

    if (!client) {
      const store = getMemoryStore();
      const record = store.source_pages.find((item) => item.id === existing.id)!;
      Object.assign(record, patch);
      return clone(record);
    }

    const { data, error } = await client.from("source_pages").update(patch).eq("id", existing.id).select("*").single();

    if (error) {
      throw error;
    }

    return data as SourcePageRecord;
  }

  const record: SourcePageRecord = {
    id: input.id ?? randomUUID(),
    first_seen_at: input.first_seen_at ?? timestamp,
    created_at: input.created_at ?? timestamp,
    updated_at: input.updated_at ?? timestamp,
    ...input
  };
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    store.source_pages.push(record);
    return clone(record);
  }

  const { data, error } = await client.from("source_pages").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as SourcePageRecord;
}

export async function listSourcePagesByIds(ids: string[]) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().source_pages.filter((item) => ids.includes(item.id)));
  }

  const { data, error } = await client.from("source_pages").select("*").in("id", ids);

  if (error) {
    throw error;
  }

  return (data ?? []) as SourcePageRecord[];
}

export async function createCrawlRun(input: Omit<CrawlRunRecord, "id" | "created_at"> & { id?: string; created_at?: string }) {
  const record: CrawlRunRecord = {
    id: input.id ?? randomUUID(),
    created_at: input.created_at ?? nowIso(),
    ...input
  };
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    store.crawl_runs.unshift(record);
    return clone(record);
  }

  const { data, error } = await client.from("crawl_runs").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as CrawlRunRecord;
}

export async function updateCrawlRun(id: string, patch: Partial<CrawlRunRecord>) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    const record = store.crawl_runs.find((item) => item.id === id);

    if (!record) {
      return null;
    }

    Object.assign(record, patch);
    return clone(record);
  }

  const { data, error } = await client.from("crawl_runs").update(patch).eq("id", id).select("*").maybeSingle();

  if (error) {
    throw error;
  }

  return (data as CrawlRunRecord | null) ?? null;
}

export async function listCrawlRuns(limit = 20) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().crawl_runs).sort(compareDateDesc).slice(0, limit);
  }

  const { data, error } = await client
    .from("crawl_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as CrawlRunRecord[];
}

export async function listCrawlRunsPaginated(page = 1, pageSize = 20, status?: string | null) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const filtered = clone(getMemoryStore().crawl_runs)
      .filter((item) => !status || item.status === status)
      .sort(compareDateDesc);

    return paginate(filtered, page, pageSize);
  }

  let query = client.from("crawl_runs").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const { data, error, count } = await query.range(start, end);

  if (error) {
    throw error;
  }

  return {
    items: (data ?? []) as CrawlRunRecord[],
    total: count ?? 0,
    page,
    page_size: pageSize,
    page_count: Math.max(1, Math.ceil((count ?? 0) / pageSize))
  };
}

export async function getCrawlRunById(id: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().crawl_runs.find((item) => item.id === id) ?? null);
  }

  const { data, error } = await client.from("crawl_runs").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as CrawlRunRecord | null) ?? null;
}

export async function createNormalizationRun(
  input: Omit<NormalizationRunRecord, "id" | "created_at"> & { id?: string; created_at?: string }
) {
  const record: NormalizationRunRecord = {
    id: input.id ?? randomUUID(),
    created_at: input.created_at ?? nowIso(),
    ...input
  };
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    store.normalization_runs.unshift(record);
    return clone(record);
  }

  const { data, error } = await client.from("normalization_runs").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as NormalizationRunRecord;
}

export async function updateNormalizationRun(id: string, patch: Partial<NormalizationRunRecord>) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    const record = store.normalization_runs.find((item) => item.id === id);

    if (!record) {
      return null;
    }

    Object.assign(record, patch);
    return clone(record);
  }

  const { data, error } = await client
    .from("normalization_runs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as NormalizationRunRecord | null) ?? null;
}

export async function listNormalizationRuns(page = 1, pageSize = 20, status?: string | null) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const filtered = clone(getMemoryStore().normalization_runs)
      .filter((item) => !status || item.status === status)
      .sort(compareDateDesc);

    return paginate(filtered, page, pageSize);
  }

  let query = client
    .from("normalization_runs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const { data, error, count } = await query.range(start, end);

  if (error) {
    throw error;
  }

  return {
    items: (data ?? []) as NormalizationRunRecord[],
    total: count ?? 0,
    page,
    page_size: pageSize,
    page_count: Math.max(1, Math.ceil((count ?? 0) / pageSize))
  };
}

export async function getNormalizationRunById(id: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().normalization_runs.find((item) => item.id === id) ?? null);
  }

  const { data, error } = await client.from("normalization_runs").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as NormalizationRunRecord | null) ?? null;
}

export async function listQueuedNormalizationRuns(limit = 25, ids?: string[]) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().normalization_runs)
      .filter((item) => item.status === "queued")
      .filter((item) => !ids?.length || ids.includes(item.id))
      .sort(compareDateDesc)
      .slice(0, limit);
  }

  let query = client
    .from("normalization_runs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: false });

  if (ids?.length) {
    query = query.in("id", ids);
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as NormalizationRunRecord[];
}

export async function retryNormalizationRuns(ids?: string[], status: NormalizationRunRecord["status"] = "failed") {
  const client = getOptionalSupabaseAdminClient();
  const targetIds = ids?.length ? ids : (await listNormalizationRuns(1, 5000, status)).items.map((item) => item.id);

  if (targetIds.length === 0) {
    return [];
  }

  if (!client) {
    const store = getMemoryStore();
    const updated: NormalizationRunRecord[] = [];

    for (const run of store.normalization_runs) {
      if (targetIds.includes(run.id)) {
        run.status = "queued";
        run.error_log = null;
        run.started_at = null;
        run.finished_at = null;
        updated.push(clone(run));
      }
    }

    return updated;
  }

  const { data, error } = await client
    .from("normalization_runs")
    .update({
      status: "queued",
      error_log: null,
      started_at: null,
      finished_at: null
    })
    .in("id", targetIds)
    .select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as NormalizationRunRecord[];
}

export async function clearSourcePageDerivatives(sourcePageId: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const store = getMemoryStore();
    const exampleIds = store.high_scoring_examples.filter((item) => item.source_page_id === sourcePageId).map((item) => item.id);
    const rubricIds = store.rubrics.filter((item) => item.source_page_id === sourcePageId).map((item) => item.id);
    const feedbackIds = store.marker_feedback_patterns
      .filter((item) => item.source_page_id === sourcePageId)
      .map((item) => item.id);

    store.high_scoring_examples = store.high_scoring_examples.filter((item) => item.source_page_id !== sourcePageId);
    store.rubrics = store.rubrics.filter((item) => item.source_page_id !== sourcePageId);
    store.marker_feedback_patterns = store.marker_feedback_patterns.filter((item) => item.source_page_id !== sourcePageId);
    store.library_embeddings = store.library_embeddings.filter((item) => {
      if (item.entity_type === "example") {
        return !exampleIds.includes(item.entity_id);
      }

      if (item.entity_type === "rubric") {
        return !rubricIds.includes(item.entity_id);
      }

      return !feedbackIds.includes(item.entity_id);
    });
    return;
  }

  const { data: examples } = await client.from("high_scoring_examples").select("id").eq("source_page_id", sourcePageId);
  const { data: rubrics } = await client.from("rubrics").select("id").eq("source_page_id", sourcePageId);
  const { data: feedback } = await client.from("marker_feedback_patterns").select("id").eq("source_page_id", sourcePageId);

  const deleteEmbeddingIds = [
    ...(examples ?? []).map((item) => ({ entity_type: "example", entity_id: item.id })),
    ...(rubrics ?? []).map((item) => ({ entity_type: "rubric", entity_id: item.id })),
    ...(feedback ?? []).map((item) => ({ entity_type: "feedback", entity_id: item.id }))
  ];

  await client.from("high_scoring_examples").delete().eq("source_page_id", sourcePageId);
  await client.from("rubrics").delete().eq("source_page_id", sourcePageId);
  await client.from("marker_feedback_patterns").delete().eq("source_page_id", sourcePageId);

  for (const entity of deleteEmbeddingIds) {
    await client
      .from("library_embeddings")
      .delete()
      .eq("entity_type", entity.entity_type)
      .eq("entity_id", entity.entity_id);
  }
}

export async function upsertHighScoringExampleBySourcePage(
  sourcePageId: string,
  input: Omit<HighScoringExampleRecord, "id" | "created_at" | "updated_at" | "source_page_id"> & {
    id?: string;
  }
) {
  const client = getOptionalSupabaseAdminClient();
  const timestamp = nowIso();

  if (!client) {
    const store = getMemoryStore();
    const existing = store.high_scoring_examples.find((item) => item.source_page_id === sourcePageId);

    if (existing) {
      Object.assign(existing, input, {
        source_page_id: sourcePageId,
        updated_at: timestamp
      });
      return clone(existing);
    }

    const record: HighScoringExampleRecord = {
      id: input.id ?? randomUUID(),
      source_page_id: sourcePageId,
      created_at: timestamp,
      updated_at: timestamp,
      ...input
    };
    store.high_scoring_examples.unshift(record);
    return clone(record);
  }

  const { data: existing } = await client
    .from("high_scoring_examples")
    .select("*")
    .eq("source_page_id", sourcePageId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await client
      .from("high_scoring_examples")
      .update({
        ...input,
        updated_at: timestamp
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as HighScoringExampleRecord;
  }

  const record: HighScoringExampleRecord = {
    id: input.id ?? randomUUID(),
    source_page_id: sourcePageId,
    created_at: timestamp,
    updated_at: timestamp,
    ...input
  };
  const { data, error } = await client.from("high_scoring_examples").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as HighScoringExampleRecord;
}

export async function updateExample(id: string, patch: Partial<HighScoringExampleRecord>) {
  const client = getOptionalSupabaseAdminClient();
  const payload = {
    ...patch,
    updated_at: nowIso()
  };

  if (!client) {
    const store = getMemoryStore();
    const record = store.high_scoring_examples.find((item) => item.id === id);

    if (!record) {
      return null;
    }

    Object.assign(record, payload);
    return clone(record);
  }

  const { data, error } = await client
    .from("high_scoring_examples")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as HighScoringExampleRecord | null) ?? null;
}

export async function verifyExample(id: string, verifiedBy: string | null) {
  return updateExample(id, {
    is_verified: true,
    verified_by: verifiedBy,
    verified_at: nowIso()
  });
}

function filterExamples(items: HighScoringExampleRecord[], filters: ExampleListFilters) {
  return items
    .filter((item) => !filters.university_id || item.university_id === filters.university_id)
    .filter((item) => !filters.department || item.department?.toLowerCase().includes(filters.department.toLowerCase()))
    .filter((item) => !filters.programme_level || item.programme_level === filters.programme_level)
    .filter((item) => !filters.assignment_type || item.assignment_type === filters.assignment_type)
    .filter((item) => !filters.score_band || item.score_band?.toLowerCase().includes(filters.score_band.toLowerCase()))
    .filter((item) => !filters.verified_only || item.is_verified)
    .filter((item) => !filters.access_level || item.access_level === filters.access_level)
    .filter((item) =>
      includesQuery(
        [item.title, item.department, item.ai_summary, item.public_excerpt, item.score_band, ...item.strengths, ...item.weaknesses],
        filters.query
      )
    )
    .sort((left, right) => {
      const verificationDelta = Number(right.is_verified) - Number(left.is_verified);

      if (verificationDelta !== 0) {
        return verificationDelta;
      }

      const scoreDelta = (right.exact_score ?? 0) - (left.exact_score ?? 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return compareDateDesc(left, right);
    });
}

export async function listExamples(filters: ExampleListFilters) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const filtered = filterExamples(clone(getMemoryStore().high_scoring_examples), filters);
    return paginate(filtered, filters.page, filters.page_size);
  }

  const { data, error } = await client.from("high_scoring_examples").select("*").order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const filtered = filterExamples((data ?? []) as HighScoringExampleRecord[], filters);
  return paginate(filtered, filters.page, filters.page_size);
}

export async function listFeaturedExamples(limit = 3) {
  const result = await listExamples({
    page: 1,
    page_size: Math.max(limit, 3),
    verified_only: false
  });

  return result.items.filter((item) => item.access_level === "public").slice(0, limit);
}

export async function getExampleById(id: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().high_scoring_examples.find((item) => item.id === id) ?? null);
  }

  const { data, error } = await client.from("high_scoring_examples").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as HighScoringExampleRecord | null) ?? null;
}

export async function upsertRubricBySourcePage(
  sourcePageId: string,
  input: Omit<RubricRecord, "id" | "created_at" | "updated_at" | "source_page_id"> & { id?: string }
) {
  const client = getOptionalSupabaseAdminClient();
  const timestamp = nowIso();

  if (!client) {
    const store = getMemoryStore();
    const existing = store.rubrics.find((item) => item.source_page_id === sourcePageId);

    if (existing) {
      Object.assign(existing, input, {
        source_page_id: sourcePageId,
        updated_at: timestamp
      });
      return clone(existing);
    }

    const record: RubricRecord = {
      id: input.id ?? randomUUID(),
      source_page_id: sourcePageId,
      created_at: timestamp,
      updated_at: timestamp,
      ...input
    };
    store.rubrics.unshift(record);
    return clone(record);
  }

  const { data: existing } = await client.from("rubrics").select("*").eq("source_page_id", sourcePageId).maybeSingle();

  if (existing) {
    const { data, error } = await client
      .from("rubrics")
      .update({
        ...input,
        updated_at: timestamp
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as RubricRecord;
  }

  const record: RubricRecord = {
    id: input.id ?? randomUUID(),
    source_page_id: sourcePageId,
    created_at: timestamp,
    updated_at: timestamp,
    ...input
  };
  const { data, error } = await client.from("rubrics").insert(record).select("*").single();

  if (error) {
    throw error;
  }

  return data as RubricRecord;
}

export async function updateRubric(id: string, patch: Partial<RubricRecord>) {
  const client = getOptionalSupabaseAdminClient();
  const payload = {
    ...patch,
    updated_at: nowIso()
  };

  if (!client) {
    const store = getMemoryStore();
    const record = store.rubrics.find((item) => item.id === id);

    if (!record) {
      return null;
    }

    Object.assign(record, payload);
    return clone(record);
  }

  const { data, error } = await client.from("rubrics").update(payload).eq("id", id).select("*").maybeSingle();

  if (error) {
    throw error;
  }

  return (data as RubricRecord | null) ?? null;
}

export async function verifyRubric(id: string) {
  return updateRubric(id, {
    is_verified: true
  });
}

function filterRubrics(items: RubricRecord[], filters: RubricListFilters) {
  return items
    .filter((item) => !filters.university_id || item.university_id === filters.university_id)
    .filter((item) => !filters.department || item.department?.toLowerCase().includes(filters.department.toLowerCase()))
    .filter((item) => !filters.programme_level || item.programme_level === filters.programme_level)
    .filter((item) => !filters.verified_only || item.is_verified)
    .filter((item) =>
      includesQuery(
        [
          item.rubric_name,
          item.rubric_text,
          item.department,
          ...(item.score_ranges ?? []).map((range) => `${range.label} ${range.descriptor}`)
        ],
        filters.query
      )
    )
    .sort((left, right) => {
      const verificationDelta = Number(right.is_verified) - Number(left.is_verified);
      return verificationDelta !== 0 ? verificationDelta : compareDateDesc(left, right);
    });
}

export async function listRubrics(filters: RubricListFilters) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const filtered = filterRubrics(clone(getMemoryStore().rubrics), filters);
    return paginate(filtered, filters.page, filters.page_size);
  }

  const { data, error } = await client.from("rubrics").select("*").order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const filtered = filterRubrics((data ?? []) as RubricRecord[], filters);
  return paginate(filtered, filters.page, filters.page_size);
}

export async function listFeaturedRubrics(limit = 3) {
  const result = await listRubrics({
    page: 1,
    page_size: Math.max(limit, 3)
  });

  return result.items.slice(0, limit);
}

export async function getRubricById(id: string) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().rubrics.find((item) => item.id === id) ?? null);
  }

  const { data, error } = await client.from("rubrics").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as RubricRecord | null) ?? null;
}

export async function replaceMarkerFeedbackPatternsForSourcePage(
  sourcePageId: string,
  universityId: string,
  sourceUrl: string,
  patterns: Array<Omit<MarkerFeedbackPatternRecord, "id" | "created_at" | "source_page_id" | "source_url" | "university_id">>
) {
  const client = getOptionalSupabaseAdminClient();
  const timestamp = nowIso();

  if (!client) {
    const store = getMemoryStore();
    store.marker_feedback_patterns = store.marker_feedback_patterns.filter((item) => item.source_page_id !== sourcePageId);
    const nextRecords = patterns.map((pattern) => ({
      id: randomUUID(),
      source_page_id: sourcePageId,
      university_id: universityId,
      source_url: sourceUrl,
      created_at: timestamp,
      ...pattern
    }));
    store.marker_feedback_patterns.push(...nextRecords);
    return clone(nextRecords);
  }

  await client.from("marker_feedback_patterns").delete().eq("source_page_id", sourcePageId);

  if (patterns.length === 0) {
    return [];
  }

  const records = patterns.map((pattern) => ({
    id: randomUUID(),
    source_page_id: sourcePageId,
    university_id: universityId,
    source_url: sourceUrl,
    created_at: timestamp,
    ...pattern
  }));

  const { data, error } = await client.from("marker_feedback_patterns").insert(records).select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as MarkerFeedbackPatternRecord[];
}

export async function listFeedbackPatterns(filters?: Partial<FeedbackListFilters>) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    return clone(getMemoryStore().marker_feedback_patterns)
      .filter((item) => !filters?.university_id || item.university_id === filters.university_id)
      .filter((item) => !filters?.programme_level || item.programme_level === filters.programme_level)
      .filter((item) => !filters?.feedback_type || item.feedback_type === filters.feedback_type)
      .filter((item) => !filters?.category || item.category === filters.category);
  }

  let query = client.from("marker_feedback_patterns").select("*");

  if (filters?.university_id) {
    query = query.eq("university_id", filters.university_id);
  }

  if (filters?.programme_level) {
    query = query.eq("programme_level", filters.programme_level);
  }

  if (filters?.feedback_type) {
    query = query.eq("feedback_type", filters.feedback_type);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as MarkerFeedbackPatternRecord[];
}

export async function replaceEmbeddingsForEntity(
  entityType: LibraryEmbeddingEntityType,
  entityId: string,
  chunks: Array<{ chunk_text: string; chunk_index: number; embedding: number[] | null }>
) {
  const client = getOptionalSupabaseAdminClient();
  const timestamp = nowIso();

  if (!client) {
    const store = getMemoryStore();
    store.library_embeddings = store.library_embeddings.filter(
      (item) => !(item.entity_type === entityType && item.entity_id === entityId)
    );
    const records = chunks.map((chunk) => ({
      id: randomUUID(),
      entity_type: entityType,
      entity_id: entityId,
      chunk_text: chunk.chunk_text,
      chunk_index: chunk.chunk_index,
      embedding: chunk.embedding,
      created_at: timestamp
    }));
    store.library_embeddings.push(...records);
    return clone(records);
  }

  await client.from("library_embeddings").delete().eq("entity_type", entityType).eq("entity_id", entityId);

  if (chunks.length === 0) {
    return [];
  }

  const records = chunks.map((chunk) => ({
    id: randomUUID(),
    entity_type: entityType,
    entity_id: entityId,
    chunk_text: chunk.chunk_text,
    chunk_index: chunk.chunk_index,
    embedding: chunk.embedding,
    created_at: timestamp
  }));

  const { data, error } = await client.from("library_embeddings").insert(records).select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}

function getEntityContextFromMemory(entityType: LibraryEmbeddingEntityType, entityId: string) {
  const store = getMemoryStore();
  const universityMap = buildUniversityMap(store.universities);

  if (entityType === "example") {
    const example = store.high_scoring_examples.find((item) => item.id === entityId);
    const university = example ? universityMap.get(example.university_id) ?? null : null;

    if (!example || !university) {
      return null;
    }

    return {
      title: example.title ?? "未命名样本",
      source_url: example.source_url,
      university_name: university.name,
      summary: example.ai_summary ?? example.public_excerpt ?? "",
      excerpt: example.public_excerpt ?? example.ai_summary ?? ""
    };
  }

  if (entityType === "rubric") {
    const rubric = store.rubrics.find((item) => item.id === entityId);
    const university = rubric ? universityMap.get(rubric.university_id) ?? null : null;

    if (!rubric || !university) {
      return null;
    }

    return {
      title: rubric.rubric_name ?? "未命名 rubric",
      source_url: rubric.source_url,
      university_name: university.name,
      summary: rubric.rubric_text ?? "",
      excerpt: rubric.rubric_text ?? ""
    };
  }

  const feedback = store.marker_feedback_patterns.find((item) => item.id === entityId);
  const university = feedback ? universityMap.get(feedback.university_id) ?? null : null;

  if (!feedback || !university) {
    return null;
  }

  return {
    title: `${feedback.feedback_type} / ${feedback.category}`,
    source_url: feedback.source_url,
    university_name: university.name,
    summary: feedback.feedback_text,
    excerpt: feedback.feedback_text
  };
}

export async function matchLibraryEmbeddings(queryEmbedding: number[], filters: LibrarySearchFilters) {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const matches = clone(getMemoryStore().library_embeddings)
      .filter((item) => filters.entity_type === "all" || item.entity_type === filters.entity_type)
      .map((item) => {
        const context = getEntityContextFromMemory(item.entity_type, item.entity_id);

        if (!context) {
          return null;
        }

        return {
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          score: scoreTextMatch(filters.query, item.chunk_text),
          chunk_text: item.chunk_text,
          title: context.title,
          source_url: context.source_url,
          university_name: context.university_name,
          summary: context.summary
        } satisfies LibrarySearchResultItem;
      })
      .filter((item): item is LibrarySearchResultItem => Boolean(item))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score);

    return paginate(matches, filters.page, filters.page_size);
  }

  const { data, error } = await client.rpc("match_library_embeddings", {
    query_embedding: queryEmbedding,
    match_count: filters.page_size,
    match_entity_type: filters.entity_type === "all" ? null : filters.entity_type,
    filter_university_id: filters.university_id ?? null,
    filter_programme_level: filters.programme_level ?? null,
    filter_assignment_type: filters.assignment_type ?? null
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SearchRpcRow[];
  const items: LibrarySearchResultItem[] = rows.map((row) => ({
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    score: row.similarity,
    chunk_text: row.chunk_text,
    title: row.title,
    source_url: row.source_url,
    university_name: row.university_name,
    summary: row.summary
  }));

  return {
    items,
    total: items.length,
    page: filters.page,
    page_size: filters.page_size,
    page_count: Math.max(1, Math.ceil(items.length / filters.page_size))
  };
}

export async function lexicalSearchLibrary(filters: LibrarySearchFilters) {
  const [examples, rubrics, feedback, universities] = await Promise.all([
    listExamples({
      page: 1,
      page_size: Math.max(filters.page_size * 2, 24),
      query: filters.query,
      university_id: filters.university_id,
      programme_level: (filters.programme_level as ExampleListFilters["programme_level"]) ?? undefined,
      assignment_type: (filters.assignment_type as ExampleListFilters["assignment_type"]) ?? undefined,
      access_level: filters.access_level
    }),
    listRubrics({
      page: 1,
      page_size: Math.max(filters.page_size * 2, 24),
      query: filters.query,
      university_id: filters.university_id,
      programme_level: filters.programme_level
    }),
    listFeedbackPatterns({
      university_id: filters.university_id ?? undefined,
      programme_level: filters.programme_level ?? undefined
    }),
    listUniversities()
  ]);
  const universityMap = buildUniversityMap(universities);
  const items: LibrarySearchResultItem[] = [];

  if (filters.entity_type === "all" || filters.entity_type === "example") {
    items.push(
      ...examples.items.map((item) => ({
        entity_type: "example" as const,
        entity_id: item.id,
        score: scoreTextMatch(filters.query, renderExampleSearchText(item)),
        chunk_text: item.public_excerpt ?? item.ai_summary ?? "",
        title: item.title ?? "未命名样本",
        source_url: item.source_url,
        university_name: universityMap.get(item.university_id)?.name ?? "Unknown university",
        summary: item.ai_summary ?? item.public_excerpt ?? ""
      }))
    );
  }

  if (filters.entity_type === "all" || filters.entity_type === "rubric") {
    items.push(
      ...rubrics.items.map((item) => ({
        entity_type: "rubric" as const,
        entity_id: item.id,
        score: scoreTextMatch(filters.query, renderRubricSearchText(item)),
        chunk_text: item.rubric_text ?? "",
        title: item.rubric_name ?? "未命名 rubric",
        source_url: item.source_url,
        university_name: universityMap.get(item.university_id)?.name ?? "Unknown university",
        summary: item.rubric_text ?? ""
      }))
    );
  }

  if (filters.entity_type === "all" || filters.entity_type === "feedback") {
    items.push(
      ...feedback.map((item) => ({
        entity_type: "feedback" as const,
        entity_id: item.id,
        score: scoreTextMatch(filters.query, item.feedback_text),
        chunk_text: item.feedback_text,
        title: `${item.feedback_type} / ${item.category}`,
        source_url: item.source_url,
        university_name: universityMap.get(item.university_id)?.name ?? "Unknown university",
        summary: item.feedback_text
      }))
    );
  }

  const ranked = items.filter((item) => item.score > 0).sort((left, right) => right.score - left.score);
  return paginate(ranked, filters.page, filters.page_size);
}

function renderExampleSearchText(item: HighScoringExampleRecord) {
  return [
    item.title ?? "",
    item.department ?? "",
    item.score_band ?? "",
    item.public_excerpt ?? "",
    item.ai_summary ?? "",
    ...item.strengths,
    ...item.weaknesses
  ].join(" ");
}

function renderRubricSearchText(item: RubricRecord) {
  return [
    item.rubric_name ?? "",
    item.department ?? "",
    item.programme_level ?? "",
    item.rubric_text ?? "",
    ...(item.score_ranges ?? []).map((range) => `${range.label} ${range.descriptor}`)
  ].join(" ");
}

export async function buildInsightEvidence(matches: LibrarySearchResultItem[]): Promise<LibraryInsightEvidence[]> {
  return matches.map((match) => ({
    entity_type: match.entity_type,
    entity_id: match.entity_id,
    title: match.title,
    university_name: match.university_name,
    source_url: match.source_url,
    excerpt: match.chunk_text
  }));
}

export async function filterPublicLibrarySearchItems(items: LibrarySearchResultItem[]) {
  const exampleIds = [...new Set(items.filter((item) => item.entity_type === "example").map((item) => item.entity_id))];

  if (exampleIds.length === 0) {
    return items;
  }

  const exampleAccessEntries = await Promise.all(
    exampleIds.map(async (id) => {
      const example = await getExampleById(id);
      return [id, example?.access_level ?? null] as const;
    })
  );
  const exampleAccess = new Map(exampleAccessEntries);

  return items.filter((item) => {
    if (item.entity_type !== "example") {
      return true;
    }

    return exampleAccess.get(item.entity_id) === "public";
  });
}

export async function getLibraryStatus() {
  const client = getOptionalSupabaseAdminClient();

  if (!client) {
    const [crawlRuns, sourceSites, universities, examples, rubrics, normalization] = await Promise.all([
      listCrawlRuns(12),
      listSourceSites(),
      listUniversities(),
      listExamples({ page: 1, page_size: 5000 }),
      listRubrics({ page: 1, page_size: 5000 }),
      listNormalizationRuns(1, 5000)
    ]);
    const latestRun = crawlRuns[0] ?? null;
    const latestRunStart = latestRun?.started_at ?? latestRun?.created_at ?? null;

    return {
      latest_sync_at: latestRun?.finished_at ?? latestRun?.started_at ?? null,
      pages_checked: latestRun?.pages_checked ?? 0,
      changed_pages: (latestRun?.pages_new ?? 0) + (latestRun?.pages_updated ?? 0),
      new_examples: latestRunStart
        ? examples.items.filter((item) => item.created_at >= latestRunStart).length
        : 0,
      updated_rubrics: latestRunStart
        ? rubrics.items.filter((item) => item.updated_at >= latestRunStart).length
        : 0,
      failed_jobs: (latestRun?.pages_failed ?? 0) + normalization.items.filter((item) => item.status === "failed").length,
      universities: universities.length,
      active_sources: sourceSites.filter((item) => item.is_active).length,
      public_examples: examples.items.filter((item) => item.access_level === "public").length,
      public_rubrics: rubrics.items.length,
      verified_examples: examples.items.filter((item) => item.is_verified).length,
      verified_rubrics: rubrics.items.filter((item) => item.is_verified).length
    } satisfies LibraryStatusSummary;
  }

  const { data: latestRuns, error: latestRunsError } = await client
    .from("crawl_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (latestRunsError) {
    throw latestRunsError;
  }

  const latestRun = ((latestRuns ?? [])[0] as CrawlRunRecord | undefined) ?? null;
  const latestRunStart = latestRun?.started_at ?? latestRun?.created_at ?? null;

  const [
    universitiesResult,
    activeSourcesResult,
    publicExamplesResult,
    publicRubricsResult,
    verifiedExamplesResult,
    verifiedRubricsResult,
    failedNormalizationResult,
    newExamplesResult,
    updatedRubricsResult
  ] = await Promise.all([
    client.from("universities").select("id", { count: "exact", head: true }),
    client.from("source_sites").select("id", { count: "exact", head: true }).eq("is_active", true),
    client.from("high_scoring_examples").select("id", { count: "exact", head: true }).eq("access_level", "public"),
    client.from("rubrics").select("id", { count: "exact", head: true }),
    client.from("high_scoring_examples").select("id", { count: "exact", head: true }).eq("is_verified", true),
    client.from("rubrics").select("id", { count: "exact", head: true }).eq("is_verified", true),
    client.from("normalization_runs").select("id", { count: "exact", head: true }).eq("status", "failed"),
    latestRunStart
      ? client.from("high_scoring_examples").select("id", { count: "exact", head: true }).gte("created_at", latestRunStart)
      : Promise.resolve({ count: 0, error: null } as const),
    latestRunStart
      ? client.from("rubrics").select("id", { count: "exact", head: true }).gte("updated_at", latestRunStart)
      : Promise.resolve({ count: 0, error: null } as const)
  ]);

  for (const result of [
    universitiesResult,
    activeSourcesResult,
    publicExamplesResult,
    publicRubricsResult,
    verifiedExamplesResult,
    verifiedRubricsResult,
    failedNormalizationResult,
    newExamplesResult,
    updatedRubricsResult
  ]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    latest_sync_at: latestRun?.finished_at ?? latestRun?.started_at ?? null,
    pages_checked: latestRun?.pages_checked ?? 0,
    changed_pages: (latestRun?.pages_new ?? 0) + (latestRun?.pages_updated ?? 0),
    new_examples: newExamplesResult.count ?? 0,
    updated_rubrics: updatedRubricsResult.count ?? 0,
    failed_jobs: (latestRun?.pages_failed ?? 0) + (failedNormalizationResult.count ?? 0),
    universities: universitiesResult.count ?? 0,
    active_sources: activeSourcesResult.count ?? 0,
    public_examples: publicExamplesResult.count ?? 0,
    public_rubrics: publicRubricsResult.count ?? 0,
    verified_examples: verifiedExamplesResult.count ?? 0,
    verified_rubrics: verifiedRubricsResult.count ?? 0
  } satisfies LibraryStatusSummary;
}

export async function getLibraryDashboardPayload() {
  const [status, universities, examples, rubrics] = await Promise.all([
    getLibraryStatus(),
    listUniversities(),
    listFeaturedExamples(3),
    listFeaturedRubrics(3)
  ]);

  return {
    status,
    universities,
    featured_examples: examples,
    featured_rubrics: rubrics
  };
}

export async function getUniversityLookup() {
  const universities = await listUniversities();
  return buildUniversityMap(universities);
}

export async function resolveUniversityIdByName(name: string | null | undefined) {
  const universities = await listUniversities();
  return findUniversityByName(universities, name)?.id ?? null;
}
