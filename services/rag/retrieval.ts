import "server-only";

import { randomUUID } from "crypto";

import { createEmbedding } from "@/lib/openai/client";
import { getChunksForProject, listFilesByProject } from "@/services/store/local-store";
import type { EvidenceSnippet } from "@/types/scholardesk";

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  return dot / ((Math.sqrt(normA) * Math.sqrt(normB)) || 1);
}

function keywordScore(query: string, content: string) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return terms.reduce((total, term) => total + (content.toLowerCase().includes(term) ? 1 : 0), 0);
}

export async function retrieveProjectEvidence(projectId: string, query: string, topK = 6): Promise<EvidenceSnippet[]> {
  const chunks = await getChunksForProject(projectId);
  const files = await listFilesByProject(projectId);

  if (chunks.length === 0) {
    return [];
  }

  const queryEmbedding = process.env.OPENAI_API_KEY ? await createEmbedding(query).catch(() => null) : null;

  const ranked = chunks
    .map((chunk) => {
      const file = files.find((item) => item.id === chunk.fileId);
      const embeddingScore =
        queryEmbedding && chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0;
      const lexicalScore = keywordScore(query, chunk.content);

      return {
        id: randomUUID(),
        fileId: chunk.fileId,
        filename: file?.filename ?? "Project document",
        snippet: chunk.content.slice(0, 280),
        score: embeddingScore + lexicalScore * 0.12
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);

  return ranked.map(({ id, ...item }) => ({ ...item }));
}
