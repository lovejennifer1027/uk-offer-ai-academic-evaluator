import { z } from "zod";

import {
  LIBRARY_ACCESS_LEVELS,
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_CRAWL_FREQUENCIES,
  LIBRARY_CRAWL_TRIGGER_TYPES,
  LIBRARY_EMBEDDING_ENTITY_TYPES,
  LIBRARY_FEEDBACK_CATEGORIES,
  LIBRARY_FEEDBACK_TYPES,
  LIBRARY_MAX_PAGE_SIZE,
  LIBRARY_NORMALIZATION_STATUSES,
  LIBRARY_PARSER_TYPES,
  LIBRARY_PROGRAMME_LEVELS,
  LIBRARY_SOURCE_TYPES
} from "@/lib/library/constants";

const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const optionalText = z.string().transform(emptyToNull).nullish().transform((value) => value ?? null);
const optionalUrl = z
  .union([z.string().url(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" && value.trim() ? value : null));
const optionalUuid = z
  .union([z.string().uuid(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" && value.trim() ? value : null));
const numericField = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const numberValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  });

const stringArrayField = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  });

const booleanishField = z
  .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value > 0;
    }

    if (typeof value === "string") {
      return ["1", "true", "yes", "on"].includes(value.toLowerCase());
    }

    return false;
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(LIBRARY_MAX_PAGE_SIZE).default(12)
});

export const universityCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  short_name: optionalText,
  country: z.string().trim().min(2).max(80).default("UK"),
  website_url: optionalUrl,
  logo_url: optionalUrl,
  is_active: booleanishField.default(true)
});

export const universityPatchSchema = universityCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少提供一个需要更新的字段。"
);

export const sourceSiteCreateSchema = z.object({
  university_id: z.string().uuid(),
  name: z.string().trim().min(2).max(200),
  base_url: z.string().trim().url(),
  source_type: z.enum(LIBRARY_SOURCE_TYPES),
  parser_type: z.enum(LIBRARY_PARSER_TYPES),
  is_active: booleanishField.default(true),
  crawl_frequency: z.enum(LIBRARY_CRAWL_FREQUENCIES).default("weekly"),
  notes: optionalText
});

export const sourceSitePatchSchema = sourceSiteCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少提供一个需要更新的字段。"
);

export const testCrawlSchema = z.object({
  max_pages: z.coerce.number().int().min(1).max(25).default(8)
});

export const crawlRunSchema = z.object({
  source_site_id: optionalUuid,
  trigger_type: z.enum(LIBRARY_CRAWL_TRIGGER_TYPES).default("manual"),
  created_by: optionalText,
  deep_sync: booleanishField.default(false)
});

export const normalizationRetrySchema = z.object({
  ids: z.array(z.string().uuid()).max(50).optional(),
  status: z.enum(LIBRARY_NORMALIZATION_STATUSES).optional(),
  process_now: booleanishField.default(true)
});

export const exampleListQuerySchema = paginationSchema.extend({
  query: optionalText,
  university_id: optionalUuid,
  department: optionalText,
  programme_level: z.enum(LIBRARY_PROGRAMME_LEVELS).optional(),
  assignment_type: z.enum(LIBRARY_ASSIGNMENT_TYPES).optional(),
  score_band: optionalText,
  verified_only: booleanishField.optional(),
  access_level: z.enum(LIBRARY_ACCESS_LEVELS).optional()
});

export const rubricListQuerySchema = paginationSchema.extend({
  query: optionalText,
  university_id: optionalUuid,
  department: optionalText,
  programme_level: optionalText,
  verified_only: booleanishField.optional()
});

export const crawlListQuerySchema = paginationSchema.extend({
  status: optionalText
});

export const normalizationListQuerySchema = paginationSchema.extend({
  status: z.enum(LIBRARY_NORMALIZATION_STATUSES).optional()
});

export const examplePatchSchema = z
  .object({
    department: optionalText,
    programme_level: z.enum(LIBRARY_PROGRAMME_LEVELS).optional(),
    assignment_type: z.enum(LIBRARY_ASSIGNMENT_TYPES).optional(),
    title: optionalText,
    year_label: optionalText,
    exact_score: numericField,
    score_band: optionalText,
    public_excerpt: optionalText,
    strengths: stringArrayField.optional(),
    weaknesses: stringArrayField.optional(),
    marker_comments_summary: stringArrayField.optional(),
    ai_summary: optionalText,
    source_url: z.string().trim().url().optional(),
    access_level: z.enum(LIBRARY_ACCESS_LEVELS).optional()
  })
  .refine((value) => Object.keys(value).length > 0, "至少提供一个需要更新的字段。");

export const verifySchema = z.object({
  verified_by: optionalText
});

export const rubricScoreRangeSchema = z.object({
  label: z.string().trim().min(1).max(120),
  minimum: numericField,
  maximum: numericField,
  descriptor: z.string().trim().min(1).max(500)
});

export const rubricJsonSchema = z
  .object({
    criteria: z
      .array(
        z.object({
          criterion: z.string().trim().min(1).max(120),
          descriptor: z.string().trim().min(1).max(500),
          band_label: optionalText
        })
      )
      .optional(),
    notes: z.array(z.string().trim().min(1).max(240)).optional(),
    raw_sections: z.array(z.string().trim().min(1).max(1000)).optional()
  })
  .strict();

export const rubricPatchSchema = z
  .object({
    department: optionalText,
    programme_level: optionalText,
    rubric_name: optionalText,
    rubric_text: optionalText,
    rubric_json: rubricJsonSchema.nullish(),
    score_ranges: z.array(rubricScoreRangeSchema).nullish(),
    source_url: z.string().trim().url().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "至少提供一个需要更新的字段。");

export const statusActionSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  entity_type: z.enum(LIBRARY_EMBEDDING_ENTITY_TYPES).optional(),
  entity_id: optionalUuid
});

export const librarySearchSchema = paginationSchema.extend({
  query: z.string().trim().min(2).max(300),
  university_id: optionalUuid,
  programme_level: optionalText,
  assignment_type: optionalText,
  entity_type: z.enum([...LIBRARY_EMBEDDING_ENTITY_TYPES, "all"] as const).default("all")
});

export const libraryInsightQuerySchema = z.object({
  query: z.string().trim().min(5).max(600),
  university_id: optionalUuid,
  programme_level: optionalText,
  assignment_type: optionalText
});

export type UniversityCreateInput = z.infer<typeof universityCreateSchema>;
export type UniversityPatchInput = z.infer<typeof universityPatchSchema>;
export type SourceSiteCreateInput = z.infer<typeof sourceSiteCreateSchema>;
export type SourceSitePatchInput = z.infer<typeof sourceSitePatchSchema>;
export type ExamplePatchInput = z.infer<typeof examplePatchSchema>;
export type RubricPatchInput = z.infer<typeof rubricPatchSchema>;
