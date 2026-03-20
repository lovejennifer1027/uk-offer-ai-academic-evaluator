import { z } from "zod";

import { FORMATIVE_DISCLAIMER } from "@/lib/constants";
import { clamp, stripMarkdown, sumRubricScores } from "@/lib/utils";
import type { EvaluationReport } from "@/lib/types";

export const evaluationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overall_score",
    "max_score",
    "rubric_scores",
    "overall_feedback",
    "strengths",
    "weaknesses",
    "suggestions_for_improvement",
    "disclaimer"
  ],
  properties: {
    overall_score: { type: "integer", minimum: 0, maximum: 100 },
    max_score: { type: "integer", const: 100 },
    rubric_scores: {
      type: "object",
      additionalProperties: false,
      required: ["Structure", "Critical Thinking", "Use of Literature", "Referencing", "Language"],
      properties: {
        Structure: {
          type: "object",
          additionalProperties: false,
          required: ["score", "max"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 20 },
            max: { type: "integer", const: 20 }
          }
        },
        "Critical Thinking": {
          type: "object",
          additionalProperties: false,
          required: ["score", "max"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 20 },
            max: { type: "integer", const: 20 }
          }
        },
        "Use of Literature": {
          type: "object",
          additionalProperties: false,
          required: ["score", "max"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 20 },
            max: { type: "integer", const: 20 }
          }
        },
        Referencing: {
          type: "object",
          additionalProperties: false,
          required: ["score", "max"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 20 },
            max: { type: "integer", const: 20 }
          }
        },
        Language: {
          type: "object",
          additionalProperties: false,
          required: ["score", "max"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 20 },
            max: { type: "integer", const: 20 }
          }
        }
      }
    },
    overall_feedback: { type: "string" },
    strengths: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
    weaknesses: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
    suggestions_for_improvement: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
    disclaimer: { type: "string" }
  }
} as const;

export const EvaluationReportSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  max_score: z.literal(100),
  rubric_scores: z.object({
    Structure: z.object({
      score: z.number().int().min(0).max(20),
      max: z.literal(20)
    }).strict(),
    "Critical Thinking": z.object({
      score: z.number().int().min(0).max(20),
      max: z.literal(20)
    }).strict(),
    "Use of Literature": z.object({
      score: z.number().int().min(0).max(20),
      max: z.literal(20)
    }).strict(),
    Referencing: z.object({
      score: z.number().int().min(0).max(20),
      max: z.literal(20)
    }).strict(),
    Language: z.object({
      score: z.number().int().min(0).max(20),
      max: z.literal(20)
    }).strict()
  }).strict(),
  overall_feedback: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(3).max(5),
  weaknesses: z.array(z.string().min(1)).min(3).max(5),
  suggestions_for_improvement: z.array(z.string().min(1)).min(3).max(5),
  disclaimer: z.string().min(1)
}).strict();

function normaliseList(items: string[], fallback: string[]) {
  const cleaned = Array.from(new Set(items.map((item) => stripMarkdown(item)).filter(Boolean)));

  if (cleaned.length >= 3) {
    return cleaned.slice(0, 5);
  }

  const padded = [...cleaned];

  for (const candidate of fallback) {
    const next = stripMarkdown(candidate);

    if (next && !padded.includes(next)) {
      padded.push(next);
    }

    if (padded.length >= 3) {
      break;
    }
  }

  return padded.slice(0, 5);
}

export function normaliseEvaluationReport(input: z.infer<typeof EvaluationReportSchema>): EvaluationReport {
  const rubric_scores = {
    Structure: {
      score: clamp(input.rubric_scores.Structure.score, 0, 20),
      max: 20 as const
    },
    "Critical Thinking": {
      score: clamp(input.rubric_scores["Critical Thinking"].score, 0, 20),
      max: 20 as const
    },
    "Use of Literature": {
      score: clamp(input.rubric_scores["Use of Literature"].score, 0, 20),
      max: 20 as const
    },
    Referencing: {
      score: clamp(input.rubric_scores.Referencing.score, 0, 20),
      max: 20 as const
    },
    Language: {
      score: clamp(input.rubric_scores.Language.score, 0, 20),
      max: 20 as const
    }
  };

  const overall_score = sumRubricScores(rubric_scores);

  return {
    overall_score,
    max_score: 100,
    rubric_scores,
    overall_feedback:
      stripMarkdown(input.overall_feedback) ||
      "这篇文章已经具备一定的学术基础，但若想达到更高水平，仍需要在分析深度、证据使用和技术规范方面进一步加强。",
    strengths: normaliseList(input.strengths, [
      "文章能够围绕题目展开，并具备基本的论证主线。",
      "文中已经使用了一定的相关证据或资料来支撑观点。",
      "整体结构具备基本的学术写作框架。"
    ]),
    weaknesses: normaliseList(input.weaknesses, [
      "关键段落中的分析仍然不够深入。",
      "证据与论点之间的结合还不够紧密。",
      "引用规范或技术准确性仍需进一步加强。"
    ]),
    suggestions_for_improvement: normaliseList(input.suggestions_for_improvement, [
      "进一步明确中心论点，并让每一段都更直接地服务于主论证。",
      "增加比较、评价与综合分析，减少单纯描述。",
      "在再次提交前，统一检查文内引用和参考文献格式。"
    ]),
    disclaimer: FORMATIVE_DISCLAIMER
  };
}
