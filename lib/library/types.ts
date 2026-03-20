import type {
  LIBRARY_ACCESS_LEVELS,
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_CRAWL_FREQUENCIES,
  LIBRARY_CRAWL_STATUSES,
  LIBRARY_CRAWL_TRIGGER_TYPES,
  LIBRARY_EMBEDDING_ENTITY_TYPES,
  LIBRARY_FEEDBACK_CATEGORIES,
  LIBRARY_FEEDBACK_TYPES,
  LIBRARY_NORMALIZATION_RECORD_TYPES,
  LIBRARY_NORMALIZATION_STATUSES,
  LIBRARY_PAGE_TYPES,
  LIBRARY_PARSER_TYPES,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_SOURCE_TYPES
} from "@/lib/library/constants";

export type LibrarySourceType = (typeof LIBRARY_SOURCE_TYPES)[number];
export type LibraryParserType = (typeof LIBRARY_PARSER_TYPES)[number];
export type LibraryCrawlFrequency = (typeof LIBRARY_CRAWL_FREQUENCIES)[number];
export type LibraryPageType = (typeof LIBRARY_PAGE_TYPES)[number];
export type LibraryAccessLevel = (typeof LIBRARY_ACCESS_LEVELS)[number];
export type LibraryCrawlTriggerType = (typeof LIBRARY_CRAWL_TRIGGER_TYPES)[number];
export type LibraryCrawlStatus = (typeof LIBRARY_CRAWL_STATUSES)[number];
export type LibraryNormalizationStatus = (typeof LIBRARY_NORMALIZATION_STATUSES)[number];
export type LibraryProgrammeLevel = (typeof LIBRARY_PROGRAMME_LEVELS)[number];
export type LibraryAssignmentType = (typeof LIBRARY_ASSIGNMENT_TYPES)[number];
export type LibraryFeedbackType = (typeof LIBRARY_FEEDBACK_TYPES)[number];
export type LibraryFeedbackCategory = (typeof LIBRARY_FEEDBACK_CATEGORIES)[number];
export type LibraryEmbeddingEntityType = (typeof LIBRARY_EMBEDDING_ENTITY_TYPES)[number];
export type LibraryNormalizationRecordType = (typeof LIBRARY_NORMALIZATION_RECORD_TYPES)[number];

export interface UniversityRecord {
  id: string;
  name: string;
  short_name: string | null;
  country: string;
  website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceSiteRecord {
  id: string;
  university_id: string;
  name: string;
  base_url: string;
  source_type: LibrarySourceType;
  parser_type: LibraryParserType;
  is_active: boolean;
  crawl_frequency: LibraryCrawlFrequency;
  last_crawled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourcePageRecord {
  id: string;
  source_site_id: string;
  university_id: string;
  page_url: string;
  page_title: string | null;
  page_type: LibraryPageType;
  content_hash: string | null;
  raw_html: string | null;
  raw_text: string | null;
  content_length: number | null;
  http_status: number | null;
  access_level: LibraryAccessLevel;
  first_seen_at: string;
  last_seen_at: string;
  last_changed_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrawlRunRecord {
  id: string;
  trigger_type: LibraryCrawlTriggerType;
  status: LibraryCrawlStatus;
  started_at: string | null;
  finished_at: string | null;
  pages_checked: number;
  pages_new: number;
  pages_updated: number;
  pages_failed: number;
  error_log: string | null;
  created_by: string | null;
  created_at: string;
}

export interface NormalizationRunRecord {
  id: string;
  crawl_run_id: string | null;
  source_page_id: string;
  status: LibraryNormalizationStatus;
  model_name: string | null;
  prompt_version: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  raw_model_response: Record<string, unknown> | null;
  error_log: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface HighScoringExampleRecord {
  id: string;
  source_page_id: string;
  university_id: string;
  department: string | null;
  programme_level: LibraryProgrammeLevel;
  assignment_type: LibraryAssignmentType;
  title: string | null;
  year_label: string | null;
  exact_score: number | null;
  score_band: string | null;
  public_excerpt: string | null;
  strengths: string[];
  weaknesses: string[];
  marker_comments_summary: string[];
  ai_summary: string | null;
  source_url: string;
  access_level: LibraryAccessLevel;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RubricScoreRange {
  label: string;
  minimum: number | null;
  maximum: number | null;
  descriptor: string;
}

export interface RubricCriterion {
  criterion: string;
  descriptor: string;
  band_label: string | null;
}

export interface RubricRecord {
  id: string;
  source_page_id: string;
  university_id: string;
  department: string | null;
  programme_level: string | null;
  rubric_name: string | null;
  rubric_text: string | null;
  rubric_json: {
    criteria?: RubricCriterion[];
    notes?: string[];
    raw_sections?: string[];
  } | null;
  score_ranges: RubricScoreRange[] | null;
  source_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarkerFeedbackPatternRecord {
  id: string;
  source_page_id: string;
  university_id: string;
  programme_level: string | null;
  feedback_type: LibraryFeedbackType;
  feedback_text: string;
  category: LibraryFeedbackCategory;
  source_url: string;
  created_at: string;
}

export interface LibraryEmbeddingRecord {
  id: string;
  entity_type: LibraryEmbeddingEntityType;
  entity_id: string;
  chunk_text: string;
  chunk_index: number;
  embedding: number[] | null;
  created_at: string;
}

export interface LibraryPagination {
  page: number;
  page_size: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  page_count: number;
}

export interface ExampleListFilters extends LibraryPagination {
  query?: string | null;
  university_id?: string | null;
  department?: string | null;
  programme_level?: LibraryProgrammeLevel | null;
  assignment_type?: LibraryAssignmentType | null;
  score_band?: string | null;
  verified_only?: boolean;
  access_level?: LibraryAccessLevel | null;
}

export interface RubricListFilters extends LibraryPagination {
  query?: string | null;
  university_id?: string | null;
  department?: string | null;
  programme_level?: string | null;
  verified_only?: boolean;
}

export interface FeedbackListFilters extends LibraryPagination {
  university_id?: string | null;
  programme_level?: string | null;
  feedback_type?: LibraryFeedbackType | null;
  category?: LibraryFeedbackCategory | null;
}

export interface LibrarySearchFilters extends LibraryPagination {
  query: string;
  university_id?: string | null;
  programme_level?: string | null;
  assignment_type?: string | null;
  access_level?: LibraryAccessLevel | null;
  entity_type?: LibraryEmbeddingEntityType | "all" | null;
}

export interface LibrarySearchResultItem {
  entity_type: LibraryEmbeddingEntityType;
  entity_id: string;
  score: number;
  chunk_text: string;
  title: string;
  source_url: string;
  university_name: string;
  summary: string;
}

export interface LibraryStatusSummary {
  latest_sync_at: string | null;
  pages_checked: number;
  changed_pages: number;
  new_examples: number;
  updated_rubrics: number;
  failed_jobs: number;
  universities: number;
  active_sources: number;
  public_examples: number;
  public_rubrics: number;
  verified_examples: number;
  verified_rubrics: number;
}

export interface NormalizedLibraryRecord {
  record_type: LibraryNormalizationRecordType;
  university: string | null;
  department: string | null;
  programme_level: LibraryProgrammeLevel | null;
  assignment_type: LibraryAssignmentType | null;
  title: string | null;
  year_label: string | null;
  exact_score: number | null;
  score_band: string | null;
  public_excerpt: string | null;
  strengths: string[];
  weaknesses: string[];
  marker_comments_summary: string[];
  ai_summary: string | null;
  rubric_name: string | null;
  rubric_text: string | null;
  rubric_json: {
    criteria?: RubricCriterion[];
    notes?: string[];
    raw_sections?: string[];
  } | null;
  score_ranges: RubricScoreRange[] | null;
  feedback_type: LibraryFeedbackType | null;
  feedback_text: string | null;
  category: LibraryFeedbackCategory | null;
  source_url: string;
  access_level: LibraryAccessLevel;
}

export interface LibraryInsightEvidence {
  entity_type: LibraryEmbeddingEntityType;
  entity_id: string;
  title: string;
  university_name: string;
  source_url: string;
  excerpt: string;
}

export interface LibraryInsightAnswer {
  answer: string;
  key_points: string[];
  caveats: string[];
  evidence: LibraryInsightEvidence[];
}

export interface LibrarySnapshot {
  universities: UniversityRecord[];
  source_sites: SourceSiteRecord[];
  source_pages: SourcePageRecord[];
  crawl_runs: CrawlRunRecord[];
  normalization_runs: NormalizationRunRecord[];
  high_scoring_examples: HighScoringExampleRecord[];
  rubrics: RubricRecord[];
  marker_feedback_patterns: MarkerFeedbackPatternRecord[];
  library_embeddings: LibraryEmbeddingRecord[];
}
