import { z } from "zod";

import {
  generatedExampleJsonSchema,
  generatedExampleOutputSchema,
  generatedInsightAnswerSchema,
  generatedInsightJsonSchema
} from "@/lib/ai-library/schemas";
import {
  LIBRARY_ACCESS_LEVELS,
  LIBRARY_ASSIGNMENT_TYPES,
  LIBRARY_FEEDBACK_CATEGORIES,
  LIBRARY_FEEDBACK_TYPES,
  LIBRARY_NORMALIZATION_RECORD_TYPES,
  LIBRARY_PROGRAMME_LEVELS
} from "@/lib/library/constants";

const nullableString = z.union([z.string(), z.null()]).transform((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
});

const stringList = z.array(z.string().trim().min(1).max(300)).max(8).default([]);

const rubricCriterionSchema = z.object({
  criterion: z.string().trim().min(1).max(120),
  descriptor: z.string().trim().min(1).max(500),
  band_label: nullableString
});

const rubricRangeSchema = z.object({
  label: z.string().trim().min(1).max(120),
  minimum: z.number().nullable(),
  maximum: z.number().nullable(),
  descriptor: z.string().trim().min(1).max(500)
});

export const NormalizationOutputSchema = z
  .object({
    record_type: z.enum(LIBRARY_NORMALIZATION_RECORD_TYPES),
    university: nullableString,
    department: nullableString,
    programme_level: z.enum(LIBRARY_PROGRAMME_LEVELS).nullable(),
    assignment_type: z.enum(LIBRARY_ASSIGNMENT_TYPES).nullable(),
    title: nullableString,
    year_label: nullableString,
    exact_score: z.number().nullable(),
    score_band: nullableString,
    public_excerpt: nullableString,
    strengths: stringList,
    weaknesses: stringList,
    marker_comments_summary: stringList,
    ai_summary: nullableString,
    rubric_name: nullableString,
    rubric_text: nullableString,
    rubric_json: z
      .object({
        criteria: z.array(rubricCriterionSchema).max(12).optional(),
        notes: stringList.optional(),
        raw_sections: z.array(z.string().trim().min(1).max(1000)).max(8).optional()
      })
      .strict()
      .nullable(),
    score_ranges: z.array(rubricRangeSchema).max(10).nullable(),
    feedback_type: z.enum(LIBRARY_FEEDBACK_TYPES).nullable(),
    feedback_text: nullableString,
    category: z.enum(LIBRARY_FEEDBACK_CATEGORIES).nullable(),
    source_url: z.string().trim().url(),
    access_level: z.enum(LIBRARY_ACCESS_LEVELS)
  })
  .strict();

export const normalizationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    record_type: {
      type: "string",
      enum: [...LIBRARY_NORMALIZATION_RECORD_TYPES]
    },
    university: {
      type: ["string", "null"]
    },
    department: {
      type: ["string", "null"]
    },
    programme_level: {
      type: ["string", "null"],
      enum: [...LIBRARY_PROGRAMME_LEVELS, null]
    },
    assignment_type: {
      type: ["string", "null"],
      enum: [...LIBRARY_ASSIGNMENT_TYPES, null]
    },
    title: {
      type: ["string", "null"]
    },
    year_label: {
      type: ["string", "null"]
    },
    exact_score: {
      type: ["number", "null"]
    },
    score_band: {
      type: ["string", "null"]
    },
    public_excerpt: {
      type: ["string", "null"]
    },
    strengths: {
      type: "array",
      items: {
        type: "string"
      },
      maxItems: 8
    },
    weaknesses: {
      type: "array",
      items: {
        type: "string"
      },
      maxItems: 8
    },
    marker_comments_summary: {
      type: "array",
      items: {
        type: "string"
      },
      maxItems: 8
    },
    ai_summary: {
      type: ["string", "null"]
    },
    rubric_name: {
      type: ["string", "null"]
    },
    rubric_text: {
      type: ["string", "null"]
    },
    rubric_json: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        criteria: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              criterion: { type: "string" },
              descriptor: { type: "string" },
              band_label: { type: ["string", "null"] }
            },
            required: ["criterion", "descriptor", "band_label"]
          }
        },
        notes: {
          type: "array",
          items: { type: "string" }
        },
        raw_sections: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: []
    },
    score_ranges: {
      type: ["array", "null"],
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          minimum: { type: ["number", "null"] },
          maximum: { type: ["number", "null"] },
          descriptor: { type: "string" }
        },
        required: ["label", "minimum", "maximum", "descriptor"]
      }
    },
    feedback_type: {
      type: ["string", "null"],
      enum: [...LIBRARY_FEEDBACK_TYPES, null]
    },
    feedback_text: {
      type: ["string", "null"]
    },
    category: {
      type: ["string", "null"],
      enum: [...LIBRARY_FEEDBACK_CATEGORIES, null]
    },
    source_url: {
      type: "string"
    },
    access_level: {
      type: "string",
      enum: [...LIBRARY_ACCESS_LEVELS]
    }
  },
  required: [
    "record_type",
    "university",
    "department",
    "programme_level",
    "assignment_type",
    "title",
    "year_label",
    "exact_score",
    "score_band",
    "public_excerpt",
    "strengths",
    "weaknesses",
    "marker_comments_summary",
    "ai_summary",
    "rubric_name",
    "rubric_text",
    "rubric_json",
    "score_ranges",
    "feedback_type",
    "feedback_text",
    "category",
    "source_url",
    "access_level"
  ]
} as const;

export const InsightSynthesisSchema = z
  .object({
    answer: z.string().trim().min(1).max(1800),
    key_points: z.array(z.string().trim().min(1).max(260)).min(2).max(6),
    caveats: z.array(z.string().trim().min(1).max(260)).min(1).max(4),
    evidence: z
      .array(
        z.object({
          entity_type: z.enum(["example", "rubric", "feedback"]),
          entity_id: z.string().uuid(),
          title: z.string().trim().min(1).max(200),
          university_name: z.string().trim().min(1).max(200),
          source_url: z.string().trim().url(),
          excerpt: z.string().trim().min(1).max(500)
        })
      )
      .min(1)
      .max(8)
  })
  .strict();

export const insightSynthesisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    key_points: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 6
    },
    caveats: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 4
    },
    evidence: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          entity_type: { type: "string", enum: ["example", "rubric", "feedback"] },
          entity_id: { type: "string" },
          title: { type: "string" },
          university_name: { type: "string" },
          source_url: { type: "string" },
          excerpt: { type: "string" }
        },
        required: ["entity_type", "entity_id", "title", "university_name", "source_url", "excerpt"]
      }
    }
  },
  required: ["answer", "key_points", "caveats", "evidence"]
} as const;

export const GeneratedExampleOutputSchema = generatedExampleOutputSchema;
export const generatedExamplePackJsonSchema = generatedExampleJsonSchema;
export const GeneratedInsightAnswerSchema = generatedInsightAnswerSchema;
export const generatedInsightAnswerJsonSchema = generatedInsightJsonSchema;
