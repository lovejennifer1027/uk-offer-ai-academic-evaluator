import "server-only";

import { createEmbedding } from "@/lib/openai/client";
import {
  getExampleById,
  getRubricById,
  listExamples,
  listFeedbackPatterns,
  listRubrics,
  replaceEmbeddingsForEntity
} from "@/lib/library/repository";
import type { HighScoringExampleRecord, LibraryEmbeddingEntityType, MarkerFeedbackPatternRecord, RubricRecord } from "@/lib/library/types";
import { cleanText } from "@/lib/utils";

interface EmbeddingEntityTarget {
  entity_type: LibraryEmbeddingEntityType;
  entity_id: string;
}

function chunkText(text: string, maxChars = 1200, overlap = 180) {
  const normalized = cleanText(text);

  if (!normalized) {
    return [];
  }

  if (normalized.length <= maxChars) {
    return [normalized];
  }

  const chunks: string[] = [];
  let index = 0;

  while (index < normalized.length) {
    const chunk = normalized.slice(index, index + maxChars).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    index += Math.max(1, maxChars - overlap);
  }

  return chunks;
}

function renderExampleText(example: HighScoringExampleRecord) {
  return [
    example.title ?? "",
    example.department ?? "",
    example.programme_level,
    example.assignment_type,
    example.score_band ?? "",
    example.public_excerpt ?? "",
    example.ai_summary ?? "",
    ...example.strengths,
    ...example.weaknesses,
    ...example.marker_comments_summary
  ].join("\n");
}

function renderRubricText(rubric: RubricRecord) {
  return [
    rubric.rubric_name ?? "",
    rubric.department ?? "",
    rubric.programme_level ?? "",
    rubric.rubric_text ?? "",
    ...(rubric.score_ranges ?? []).map((range) => `${range.label}: ${range.descriptor}`),
    ...(rubric.rubric_json?.criteria ?? []).map((item) => `${item.criterion}: ${item.descriptor}`)
  ].join("\n");
}

function renderFeedbackText(feedback: MarkerFeedbackPatternRecord) {
  return [feedback.programme_level ?? "", feedback.feedback_type, feedback.category, feedback.feedback_text].join("\n");
}

async function resolveTargets(input?: {
  entity_type?: LibraryEmbeddingEntityType;
  entity_id?: string;
  limit?: number;
  entities?: EmbeddingEntityTarget[];
}) {
  if (input?.entities?.length) {
    return input.entities;
  }

  if (input?.entity_type && input.entity_id) {
    return [
      {
        entity_type: input.entity_type,
        entity_id: input.entity_id
      }
    ];
  }

  const limit = input?.limit ?? 50;
  const targets: EmbeddingEntityTarget[] = [];
  const remaining = () => Math.max(limit - targets.length, 0);

  if ((!input?.entity_type || input.entity_type === "example") && remaining() > 0) {
    const examples = await listExamples({
      page: 1,
      page_size: remaining()
    });
    targets.push(...examples.items.map((item) => ({ entity_type: "example" as const, entity_id: item.id })));
  }

  if ((!input?.entity_type || input.entity_type === "rubric") && remaining() > 0) {
    const rubrics = await listRubrics({
      page: 1,
      page_size: remaining()
    });
    targets.push(...rubrics.items.map((item) => ({ entity_type: "rubric" as const, entity_id: item.id })));
  }

  if ((!input?.entity_type || input.entity_type === "feedback") && remaining() > 0) {
    const feedback = await listFeedbackPatterns({});
    targets.push(
      ...feedback.slice(0, remaining()).map((item) => ({ entity_type: "feedback" as const, entity_id: item.id }))
    );
  }

  return targets;
}

export async function rebuildEmbeddings(input?: {
  entity_type?: LibraryEmbeddingEntityType;
  entity_id?: string;
  limit?: number;
  entities?: EmbeddingEntityTarget[];
}) {
  const targets = await resolveTargets(input);
  let rebuilt = 0;

  for (const target of targets) {
    let chunks: string[] = [];

    if (target.entity_type === "example") {
      const example = await getExampleById(target.entity_id);
      if (!example) {
        continue;
      }
      chunks = chunkText(renderExampleText(example));
    } else if (target.entity_type === "rubric") {
      const rubric = await getRubricById(target.entity_id);
      if (!rubric) {
        continue;
      }
      chunks = chunkText(renderRubricText(rubric));
    } else {
      const feedback = (await listFeedbackPatterns({})).find((item) => item.id === target.entity_id);
      if (!feedback) {
        continue;
      }
      chunks = chunkText(renderFeedbackText(feedback));
    }

    const embeddingRows = [];

    for (const [chunkIndex, chunkTextValue] of chunks.entries()) {
      const embedding = process.env.OPENAI_API_KEY ? await createEmbedding(chunkTextValue) : null;
      embeddingRows.push({
        chunk_text: chunkTextValue,
        chunk_index: chunkIndex,
        embedding
      });
    }

    await replaceEmbeddingsForEntity(target.entity_type, target.entity_id, embeddingRows);
    rebuilt += 1;
  }

  return {
    rebuilt,
    targets: targets.length
  };
}
