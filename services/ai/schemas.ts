import { z } from "zod";

export const evaluationReportSchema = z.object({
  overallSummary: z.string(),
  dimensionScores: z.object({
    structure: z.number().min(0).max(100),
    argument: z.number().min(0).max(100),
    evidenceUse: z.number().min(0).max(100),
    citationQuality: z.number().min(0).max(100),
    languageClarity: z.number().min(0).max(100),
    academicTone: z.number().min(0).max(100)
  }),
  strengths: z.array(z.string()).min(3).max(6),
  priorityImprovements: z.array(z.string()).min(3).max(6),
  revisionChecklist: z.array(z.string()).min(4).max(8),
  citationFeedback: z.array(z.string()).min(2).max(5),
  grammarStyleNotes: z.array(z.string()).min(2).max(5),
  academicToneNotes: z.array(z.string()).min(2).max(5),
  optionalExamples: z.array(z.string()).min(0).max(4),
  sourcesUsed: z
    .array(
      z.object({
        fileId: z.string(),
        filename: z.string(),
        snippet: z.string(),
        score: z.number().optional()
      })
    )
    .default([])
});

export const briefAnalysisSchema = z.object({
  assignmentType: z.string(),
  expectedStructure: z.array(z.string()).min(3).max(8),
  keyDeliverables: z.array(z.string()).min(3).max(8),
  markingPriorities: z.array(z.string()).min(3).max(8),
  likelyPitfalls: z.array(z.string()).min(3).max(8),
  recommendedOutline: z.array(z.string()).min(4).max(10),
  suggestedResearchQuestions: z.array(z.string()).min(3).max(8)
});

export const chatAnswerSchema = z.object({
  answer: z.string(),
  followUpSuggestions: z.array(z.string()).min(2).max(5),
  sourcesUsed: z
    .array(
      z.object({
        fileId: z.string(),
        filename: z.string(),
        snippet: z.string(),
        score: z.number().optional()
      })
    )
    .default([])
});

export const citationFormattingSchema = z.object({
  style: z.enum(["APA", "MLA", "Harvard", "Chicago"]),
  formattedEntries: z.array(z.string()).min(1)
});

export const evaluationReportJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallSummary: { type: "string" },
    dimensionScores: {
      type: "object",
      additionalProperties: false,
      properties: {
        structure: { type: "number", minimum: 0, maximum: 100 },
        argument: { type: "number", minimum: 0, maximum: 100 },
        evidenceUse: { type: "number", minimum: 0, maximum: 100 },
        citationQuality: { type: "number", minimum: 0, maximum: 100 },
        languageClarity: { type: "number", minimum: 0, maximum: 100 },
        academicTone: { type: "number", minimum: 0, maximum: 100 }
      },
      required: ["structure", "argument", "evidenceUse", "citationQuality", "languageClarity", "academicTone"]
    },
    strengths: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
    priorityImprovements: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
    revisionChecklist: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
    citationFeedback: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    grammarStyleNotes: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    academicToneNotes: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    optionalExamples: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 4 },
    sourcesUsed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          fileId: { type: "string" },
          filename: { type: "string" },
          snippet: { type: "string" },
          score: { type: "number" }
        },
        required: ["fileId", "filename", "snippet"]
      }
    }
  },
  required: [
    "overallSummary",
    "dimensionScores",
    "strengths",
    "priorityImprovements",
    "revisionChecklist",
    "citationFeedback",
    "grammarStyleNotes",
    "academicToneNotes",
    "optionalExamples",
    "sourcesUsed"
  ]
};

export const briefAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    assignmentType: { type: "string" },
    expectedStructure: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
    keyDeliverables: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
    markingPriorities: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
    likelyPitfalls: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
    recommendedOutline: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 10 },
    suggestedResearchQuestions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 }
  },
  required: [
    "assignmentType",
    "expectedStructure",
    "keyDeliverables",
    "markingPriorities",
    "likelyPitfalls",
    "recommendedOutline",
    "suggestedResearchQuestions"
  ]
};

export const chatAnswerJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    followUpSuggestions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    sourcesUsed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          fileId: { type: "string" },
          filename: { type: "string" },
          snippet: { type: "string" },
          score: { type: "number" }
        },
        required: ["fileId", "filename", "snippet"]
      }
    }
  },
  required: ["answer", "followUpSuggestions", "sourcesUsed"]
};
