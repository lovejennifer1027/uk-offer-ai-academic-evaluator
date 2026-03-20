import "server-only";

import type {
  GeneratedExamplePackCore,
  GeneratedInsightAnswer,
  GeneratedInsightContextItem
} from "@/lib/ai-library/types";
import { cleanText, stripMarkdown } from "@/lib/utils";
import { requestStructuredJson } from "@/lib/openai/client";
import {
  AI_LIBRARY_GENERATION_PROMPT_VERSION,
  AI_LIBRARY_INSIGHTS_PROMPT_VERSION,
  buildGeneratedExamplePrompt,
  buildGeneratedInsightPrompt
} from "@/lib/openai/prompts";
import {
  GeneratedExampleOutputSchema,
  GeneratedInsightAnswerSchema,
  generatedExamplePackJsonSchema,
  generatedInsightAnswerJsonSchema
} from "@/lib/openai/schemas";
import { z } from "zod";

import { generatedExampleRequestSchema } from "@/lib/ai-library/schemas";

type GeneratedExampleInput = z.infer<typeof generatedExampleRequestSchema>;

function cleanList(items: string[]) {
  return items.map((item) => stripMarkdown(cleanText(item))).filter(Boolean);
}

function sanitizeGeneratedExamplePack(pack: GeneratedExamplePackCore): GeneratedExamplePackCore {
  return {
    title: stripMarkdown(cleanText(pack.title)),
    overview: stripMarkdown(cleanText(pack.overview)),
    example_sentences: pack.example_sentences.map((item) => ({
      purpose: stripMarkdown(cleanText(item.purpose)),
      sentence: stripMarkdown(cleanText(item.sentence)),
      why_it_works: stripMarkdown(cleanText(item.why_it_works))
    })),
    paragraph_example: {
      title: stripMarkdown(cleanText(pack.paragraph_example.title)),
      paragraph: stripMarkdown(cleanText(pack.paragraph_example.paragraph)),
      why_it_works: stripMarkdown(cleanText(pack.paragraph_example.why_it_works))
    },
    expression_templates: pack.expression_templates.map((item) => ({
      purpose: stripMarkdown(cleanText(item.purpose)),
      template: stripMarkdown(cleanText(item.template)),
      guidance: stripMarkdown(cleanText(item.guidance))
    })),
    analysis_notes: cleanList(pack.analysis_notes),
    usage_notes: cleanList(pack.usage_notes),
    disclaimer: stripMarkdown(cleanText(pack.disclaimer))
  };
}

function sanitizeGeneratedInsightAnswer(answer: GeneratedInsightAnswer): GeneratedInsightAnswer {
  return {
    answer: stripMarkdown(cleanText(answer.answer)),
    key_points: cleanList(answer.key_points),
    caveats: cleanList(answer.caveats),
    evidence: answer.evidence.map((item) => ({
      example_id: item.example_id,
      title: stripMarkdown(cleanText(item.title)),
      subject: stripMarkdown(cleanText(item.subject)),
      score_band: item.score_band,
      excerpt: stripMarkdown(cleanText(item.excerpt))
    }))
  };
}

export async function generateAiHighScoringExample(input: GeneratedExampleInput) {
  const response = await requestStructuredJson<GeneratedExamplePackCore>({
    model: process.env.OPENAI_EXAMPLE_GENERATION_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5.4",
    schemaName: "uk_offer_ai_generated_writing_example_pack",
    schemaDescription: "Generate an AI-created high-scoring academic writing example pack for learning use.",
    schema: generatedExamplePackJsonSchema,
    input: buildGeneratedExamplePrompt(input),
    maxOutputTokens: 2400,
    reasoningEffort: "medium"
  });

  return {
    pack: sanitizeGeneratedExamplePack(GeneratedExampleOutputSchema.parse(response.data)),
    prompt_version: AI_LIBRARY_GENERATION_PROMPT_VERSION,
    response_id: response.response_id,
    input_tokens: response.input_tokens,
    output_tokens: response.output_tokens
  };
}

export async function synthesizeGeneratedExampleInsights(query: string, examples: GeneratedInsightContextItem[]) {
  const response = await requestStructuredJson<GeneratedInsightAnswer>({
    model: process.env.OPENAI_EXAMPLE_INSIGHTS_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5.4",
    schemaName: "uk_offer_ai_generated_writing_insight_answer",
    schemaDescription: "Summarize recurring patterns from accumulated AI-generated academic writing examples.",
    schema: generatedInsightAnswerJsonSchema,
    input: buildGeneratedInsightPrompt({
      query,
      examples
    }),
    maxOutputTokens: 1800,
    reasoningEffort: "medium"
  });

  return {
    answer: sanitizeGeneratedInsightAnswer(GeneratedInsightAnswerSchema.parse(response.data)),
    prompt_version: AI_LIBRARY_INSIGHTS_PROMPT_VERSION,
    response_id: response.response_id,
    input_tokens: response.input_tokens,
    output_tokens: response.output_tokens
  };
}
