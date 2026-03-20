import type { GeneratedInsightContextItem } from "@/lib/ai-library/types";
import { z } from "zod";

import { generatedExampleRequestSchema } from "@/lib/ai-library/schemas";
import type { LibraryInsightEvidence } from "@/lib/library/types";
import type { SourcePageRecord } from "@/lib/library/types";

export const LIBRARY_NORMALIZATION_PROMPT_VERSION = "library-normalization-v1";
export const LIBRARY_INSIGHTS_PROMPT_VERSION = "library-insights-v1";
export const AI_LIBRARY_GENERATION_PROMPT_VERSION = "ai-library-generation-v1";
export const AI_LIBRARY_INSIGHTS_PROMPT_VERSION = "ai-library-insights-v1";

type GeneratedExampleInput = z.infer<typeof generatedExampleRequestSchema>;

interface BuildNormalizationPromptOptions {
  sourcePage: SourcePageRecord;
  universityName: string;
  sourceSiteName: string;
}

export function buildNormalizationPrompt({
  sourcePage,
  universityName,
  sourceSiteName
}: BuildNormalizationPromptOptions) {
  return `
You are normalizing public academic library source material for UK Offer International Education.

Safety requirements:
- This is not a piracy library.
- Never reproduce or invent private or restricted full text.
- Only extract public metadata, summaries, brief public excerpts, official rubric descriptors, or marker-feedback patterns.
- Present universities neutrally and do not imply endorsement of UK Offer.
- If the page is not useful, ambiguous, obviously restricted, or lacks enough public academic value, return record_type = ignore.

Your task:
- Read the supplied source page metadata and extracted public text.
- Classify the page into one of:
  1. high_scoring_example
  2. rubric
  3. marker_feedback_pattern
  4. ignore
- Return only structured data that matches the JSON schema.

Extraction rules:
- Prefer cautious extraction over aggressive guessing.
- If exact_score is not explicitly public, return null.
- If access appears restricted, set access_level accordingly and avoid storing a substantive excerpt.
- public_excerpt must stay short and suitable for a public library card.
- strengths, weaknesses, and marker_comments_summary should be concise bullet-style phrases, not paragraphs.
- rubric_json should only capture simple structured descriptors that are genuinely supported by the page.
- marker_feedback_pattern is for a single reusable feedback pattern; if the page contains several feedback patterns, choose the clearest one.
- source_url must match the supplied page URL.

Context:
- University: ${universityName}
- Source site: ${sourceSiteName}
- Page URL: ${sourcePage.page_url}
- Page title: ${sourcePage.page_title ?? "Unknown"}
- Page type guess: ${sourcePage.page_type}
- Access level guess: ${sourcePage.access_level}

Extracted text:
${sourcePage.raw_text ?? "[No extracted text available]"}
`.trim();
}

interface BuildInsightPromptOptions {
  query: string;
  evidence: LibraryInsightEvidence[];
}

export function buildInsightSynthesisPrompt({ query, evidence }: BuildInsightPromptOptions) {
  const renderedEvidence = evidence
    .map((item, index) => {
      return [
        `Evidence ${index + 1}:`,
        `- Entity type: ${item.entity_type}`,
        `- Entity id: ${item.entity_id}`,
        `- University: ${item.university_name}`,
        `- Title: ${item.title}`,
        `- Source URL: ${item.source_url}`,
        `- Excerpt: ${item.excerpt}`
      ].join("\n");
    })
    .join("\n\n");

  return `
You are producing source-backed academic library insights for UK Offer International Education.

Rules:
- Use only the supplied evidence.
- Do not invent university policies, scores, or claims that are not in the evidence.
- If evidence is mixed or limited, say so clearly in caveats.
- Keep the answer concise, analytical, and suitable for a premium education consultancy product.
- Return JSON only, matching the supplied schema.
- The evidence array in your answer must only contain evidence items that were supplied to you.

User query:
${query}

Evidence set:
${renderedEvidence}
`.trim();
}

export function buildGeneratedExamplePrompt(input: GeneratedExampleInput) {
  return `
You are an academic writing coach working for UK Offer International Education.

Your task:
- Generate an original AI-created high-scoring writing example pack.
- This is not a real university sample, not a copied excerpt, and not an official institutional model answer.
- The output must help students understand what stronger UK higher education writing often sounds like.

Safety and quality rules:
- Do not imply that any real university endorsed or authored the example.
- Do not mention or fabricate source URLs, real student names, or copied passages.
- Keep the pack practical, polished, and academically credible.
- Focus on realistic UK higher education expectations for structure, analysis, literature use, and formal academic tone.
- Produce original wording only.
- Return JSON only, matching the supplied schema.
- Do not use markdown syntax inside string fields.
- Write the actual model writing in formal academic English.
- Write explanations, analysis_notes, usage_notes, and disclaimer in Simplified Chinese.

Generation brief:
- Subject / discipline: ${input.subject}
- Programme level: ${input.programme_level}
- Assignment type: ${input.assignment_type}
- Target score band: ${input.score_band}
- Optional focus area: ${input.focus ?? "No extra focus supplied"}

Output intent:
- example_sentences should give reusable high-scoring sentence models with short explanations.
- paragraph_example should be one strong analytical paragraph, not a whole essay.
- expression_templates should be adaptable sentence frameworks, not full paragraphs.
- analysis_notes should explain what makes the pack look stronger.
- usage_notes should keep students from over-copying and should reinforce adaptation.
- disclaimer must clearly say the pack is AI-generated and for learning guidance.
`.trim();
}

interface BuildGeneratedInsightPromptOptions {
  query: string;
  examples: GeneratedInsightContextItem[];
}

export function buildGeneratedInsightPrompt({ query, examples }: BuildGeneratedInsightPromptOptions) {
  const renderedExamples = examples
    .map((item, index) =>
      [
        `Example ${index + 1}:`,
        `- Example id: ${item.id}`,
        `- Title: ${item.title}`,
        `- Subject: ${item.subject}`,
        `- Programme level: ${item.programme_level}`,
        `- Assignment type: ${item.assignment_type}`,
        `- Score band: ${item.score_band}`,
        `- Overview: ${item.overview}`,
        `- Excerpt: ${item.example_excerpt}`
      ].join("\n")
    )
    .join("\n\n");

  return `
You are synthesizing insights for UK Offer International Education from accumulated AI-generated high-scoring writing examples.

Rules:
- Use only the supplied generated examples.
- Do not claim these are real university samples or official university evidence.
- Make it clear through caveats that the answer is based on accumulated AI-generated examples.
- Keep the answer concise, analytical, useful, and suitable for a premium education product.
- Return JSON only, matching the supplied schema.
- In the evidence array, only cite examples that were supplied to you.
- Write the full answer in Simplified Chinese.

User query:
${query}

Generated example set:
${renderedExamples}
`.trim();
}
