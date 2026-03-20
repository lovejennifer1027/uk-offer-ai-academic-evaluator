import type { LibraryInsightEvidence } from "@/lib/library/types";
import type { SourcePageRecord } from "@/lib/library/types";

export const LIBRARY_NORMALIZATION_PROMPT_VERSION = "library-normalization-v1";
export const LIBRARY_INSIGHTS_PROMPT_VERSION = "library-insights-v1";

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
