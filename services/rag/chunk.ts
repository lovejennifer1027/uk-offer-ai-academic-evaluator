import "server-only";

import { cleanText } from "@/lib/utils";
import type { DocumentChunkRecord } from "@/types/scholardesk";

const CHUNK_SIZE = 1100;
const CHUNK_OVERLAP = 180;

export function splitIntoChunks(text: string, fileId: string) {
  const cleaned = cleanText(text);
  const chunks: Array<Omit<DocumentChunkRecord, "id">> = [];

  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    const end = Math.min(cleaned.length, start + CHUNK_SIZE);
    const content = cleaned.slice(start, end).trim();

    if (content) {
      chunks.push({
        fileId,
        content,
        embedding: null,
        chunkIndex: index,
        tokenCount: Math.ceil(content.length / 4),
        pageNumber: null
      });
    }

    if (end >= cleaned.length) {
      break;
    }

    start = Math.max(0, end - CHUNK_OVERLAP);
    index += 1;
  }

  return chunks;
}
