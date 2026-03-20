import { z } from "zod";

import { AI_LIBRARY_SCORE_BANDS } from "@/lib/ai-library/constants";
import { LIBRARY_ASSIGNMENT_TYPES, LIBRARY_PROGRAMME_LEVELS } from "@/lib/library/constants";

const optionalText = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  });

const boundedString = (min: number, max: number) => z.string().trim().min(min).max(max);

export const generatedSentenceSchema = z
  .object({
    purpose: boundedString(2, 120),
    sentence: boundedString(12, 420),
    why_it_works: boundedString(12, 280)
  })
  .strict();

export const generatedParagraphSchema = z
  .object({
    title: boundedString(2, 120),
    paragraph: boundedString(60, 1200),
    why_it_works: boundedString(12, 360)
  })
  .strict();

export const generatedExpressionTemplateSchema = z
  .object({
    purpose: boundedString(2, 120),
    template: boundedString(8, 240),
    guidance: boundedString(12, 220)
  })
  .strict();

export const generatedExampleOutputSchema = z
  .object({
    title: boundedString(6, 180),
    overview: boundedString(20, 600),
    example_sentences: z.array(generatedSentenceSchema).min(4).max(6),
    paragraph_example: generatedParagraphSchema,
    expression_templates: z.array(generatedExpressionTemplateSchema).min(4).max(6),
    analysis_notes: z.array(boundedString(12, 220)).min(3).max(5),
    usage_notes: z.array(boundedString(12, 220)).min(2).max(4),
    disclaimer: boundedString(20, 320)
  })
  .strict();

export const generatedExampleRequestSchema = z
  .object({
    subject: boundedString(2, 120),
    programme_level: z.enum(LIBRARY_PROGRAMME_LEVELS),
    assignment_type: z.enum(LIBRARY_ASSIGNMENT_TYPES),
    score_band: z.enum(AI_LIBRARY_SCORE_BANDS),
    focus: optionalText
  })
  .strict();

export const generatedInsightContextSchema = z
  .object({
    id: z.string().uuid(),
    title: boundedString(2, 180),
    subject: boundedString(2, 120),
    programme_level: z.enum(LIBRARY_PROGRAMME_LEVELS),
    assignment_type: z.enum(LIBRARY_ASSIGNMENT_TYPES),
    score_band: z.enum(AI_LIBRARY_SCORE_BANDS),
    overview: boundedString(12, 600),
    example_excerpt: boundedString(12, 420)
  })
  .strict();

export const generatedInsightQuerySchema = z
  .object({
    query: boundedString(5, 600),
    subject: optionalText,
    programme_level: z.enum(LIBRARY_PROGRAMME_LEVELS).optional(),
    assignment_type: z.enum(LIBRARY_ASSIGNMENT_TYPES).optional(),
    score_band: z.enum(AI_LIBRARY_SCORE_BANDS).optional(),
    generated_examples: z.array(generatedInsightContextSchema).min(1).max(8)
  })
  .strict();

export const generatedInsightAnswerSchema = z
  .object({
    answer: boundedString(20, 1800),
    key_points: z.array(boundedString(8, 240)).min(2).max(6),
    caveats: z.array(boundedString(8, 240)).min(1).max(4),
    evidence: z
      .array(
        z
          .object({
            example_id: z.string().uuid(),
            title: boundedString(2, 180),
            subject: boundedString(2, 120),
            score_band: z.enum(AI_LIBRARY_SCORE_BANDS),
            excerpt: boundedString(12, 420)
          })
          .strict()
      )
      .min(1)
      .max(8)
  })
  .strict();

export const generatedExampleJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    overview: { type: "string" },
    example_sentences: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          purpose: { type: "string" },
          sentence: { type: "string" },
          why_it_works: { type: "string" }
        },
        required: ["purpose", "sentence", "why_it_works"]
      }
    },
    paragraph_example: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        paragraph: { type: "string" },
        why_it_works: { type: "string" }
      },
      required: ["title", "paragraph", "why_it_works"]
    },
    expression_templates: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          purpose: { type: "string" },
          template: { type: "string" },
          guidance: { type: "string" }
        },
        required: ["purpose", "template", "guidance"]
      }
    },
    analysis_notes: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    usage_notes: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" }
    },
    disclaimer: { type: "string" }
  },
  required: [
    "title",
    "overview",
    "example_sentences",
    "paragraph_example",
    "expression_templates",
    "analysis_notes",
    "usage_notes",
    "disclaimer"
  ]
} as const;

export const generatedInsightJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    key_points: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: { type: "string" }
    },
    caveats: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" }
    },
    evidence: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          example_id: { type: "string" },
          title: { type: "string" },
          subject: { type: "string" },
          score_band: {
            type: "string",
            enum: [...AI_LIBRARY_SCORE_BANDS]
          },
          excerpt: { type: "string" }
        },
        required: ["example_id", "title", "subject", "score_band", "excerpt"]
      }
    }
  },
  required: ["answer", "key_points", "caveats", "evidence"]
} as const;
