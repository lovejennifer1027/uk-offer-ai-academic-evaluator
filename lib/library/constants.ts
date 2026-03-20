export const LIBRARY_SOURCE_TYPES = [
  "dissertation_examples",
  "rubric",
  "annotated_writing",
  "feedback_guide",
  "sample_essay",
  "mixed"
] as const;

export const LIBRARY_PARSER_TYPES = ["html", "pdf", "docx", "mixed"] as const;
export const LIBRARY_CRAWL_FREQUENCIES = ["daily", "weekly", "monthly", "manual"] as const;
export const LIBRARY_PAGE_TYPES = ["example", "rubric", "feedback", "library_index", "pdf", "doc", "unknown"] as const;
export const LIBRARY_ACCESS_LEVELS = ["public", "restricted", "unknown"] as const;
export const LIBRARY_CRAWL_TRIGGER_TYPES = ["scheduled", "manual", "api"] as const;
export const LIBRARY_CRAWL_STATUSES = ["queued", "running", "completed", "partial", "failed"] as const;
export const LIBRARY_NORMALIZATION_STATUSES = ["queued", "running", "completed", "failed"] as const;
export const LIBRARY_PROGRAMME_LEVELS = ["undergraduate", "masters", "phd", "unknown"] as const;
export const LIBRARY_ASSIGNMENT_TYPES = ["essay", "dissertation", "report", "reflection", "proposal", "unknown"] as const;
export const LIBRARY_FEEDBACK_TYPES = ["strength", "weakness", "suggestion"] as const;
export const LIBRARY_FEEDBACK_CATEGORIES = [
  "structure",
  "critical_thinking",
  "literature",
  "referencing",
  "language",
  "general"
] as const;
export const LIBRARY_EMBEDDING_ENTITY_TYPES = ["example", "rubric", "feedback"] as const;
export const LIBRARY_NORMALIZATION_RECORD_TYPES = [
  "high_scoring_example",
  "rubric",
  "marker_feedback_pattern",
  "ignore"
] as const;

export const LIBRARY_DEFAULT_PAGE_SIZE = 12;
export const LIBRARY_MAX_PAGE_SIZE = 50;
export const LIBRARY_SYNC_EVENTS_POLL_MS = 2500;

export const LIBRARY_PROGRAMME_LEVEL_LABELS: Record<(typeof LIBRARY_PROGRAMME_LEVELS)[number], string> = {
  undergraduate: "本科",
  masters: "硕士",
  phd: "博士",
  unknown: "未知层级"
};

export const LIBRARY_ASSIGNMENT_TYPE_LABELS: Record<(typeof LIBRARY_ASSIGNMENT_TYPES)[number], string> = {
  essay: "Essay",
  dissertation: "Dissertation",
  report: "Report",
  reflection: "Reflection",
  proposal: "Proposal",
  unknown: "未知类型"
};

export const LIBRARY_CRAWL_STATUS_LABELS: Record<(typeof LIBRARY_CRAWL_STATUSES)[number], string> = {
  queued: "排队中",
  running: "运行中",
  completed: "已完成",
  partial: "部分完成",
  failed: "失败"
};

export const LIBRARY_NORMALIZATION_STATUS_LABELS: Record<
  (typeof LIBRARY_NORMALIZATION_STATUSES)[number],
  string
> = {
  queued: "排队中",
  running: "运行中",
  completed: "已完成",
  failed: "失败"
};

export const LIBRARY_ACCESS_LEVEL_LABELS: Record<(typeof LIBRARY_ACCESS_LEVELS)[number], string> = {
  public: "公开",
  restricted: "受限",
  unknown: "未知"
};
