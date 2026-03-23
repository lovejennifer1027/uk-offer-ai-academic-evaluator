import "server-only";

import { randomUUID } from "crypto";

import { resolveAcademicSchoolProfile } from "@/config/academic-schools";
import { createEmbedding } from "@/lib/openai/client";
import { cleanText } from "@/lib/utils";
import { extractTextFromFile } from "@/lib/file-extract";
import {
  createSchoolKnowledgeFile,
  createUploadedFile,
  replaceDocumentChunks,
  replaceSchoolKnowledgeChunks,
  updateSchoolKnowledgeFile,
  updateUploadedFile
} from "@/services/store/local-store";
import { splitIntoChunks } from "@/services/rag/chunk";
import { storeUploadedBuffer } from "@/services/files/storage";
import type { DocumentChunkRecord, SchoolKnowledgeChunkRecord } from "@/types/scholardesk";

const allowedExtensions = ["pdf", "docx", "txt", "md"] as const;
const maxUploadBytes = 12 * 1024 * 1024;

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function validateFile(file: File) {
  const extension = getExtension(file.name);

  if (!allowedExtensions.includes(extension as (typeof allowedExtensions)[number])) {
    throw new Error("Unsupported file type. Please upload pdf, docx, txt, or md.");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("File is too large. Please upload a file under 12MB.");
  }
}

function normaliseMimeType(file: File) {
  if (file.type) {
    return file.type;
  }

  if (file.name.endsWith(".md")) {
    return "text/markdown";
  }

  if (file.name.endsWith(".txt")) {
    return "text/plain";
  }

  return "application/octet-stream";
}

async function extractFileText(file: File) {
  if (file.name.endsWith(".md")) {
    const text = Buffer.from(await file.arrayBuffer()).toString("utf8");
    return cleanText(text);
  }

  return extractTextFromFile(file);
}

export async function processUpload(projectId: string, file: File) {
  validateFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await storeUploadedBuffer(file.name, buffer);
  const extractedText = await extractFileText(file);

  const uploadedFile = await createUploadedFile({
    projectId,
    filename: file.name,
    mimeType: normaliseMimeType(file),
    storagePath,
    extractedText,
    extractionStatus: "completed",
    embeddingStatus: process.env.OPENAI_API_KEY ? "processing" : "pending"
  });

  const chunks = splitIntoChunks(extractedText, uploadedFile.id);
  const enrichedChunks: DocumentChunkRecord[] = [];

  for (const chunk of chunks) {
    const embedding = process.env.OPENAI_API_KEY ? await createEmbedding(chunk.content).catch(() => null) : null;
    enrichedChunks.push({
      id: randomUUID(),
      ...chunk,
      embedding
    });
  }

  await replaceDocumentChunks(uploadedFile.id, enrichedChunks);
  const finalFile =
    (await updateUploadedFile(uploadedFile.id, {
      embeddingStatus: process.env.OPENAI_API_KEY ? "completed" : "pending"
    })) ?? uploadedFile;

  return {
    file: {
      ...finalFile
    },
    chunkCount: enrichedChunks.length
  };
}

export async function processSchoolKnowledgeUpload(schoolInput: string, file: File) {
  validateFile(file);
  const school = resolveAcademicSchoolProfile(schoolInput);
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await storeUploadedBuffer(`${school.id}-${file.name}`, buffer);
  const extractedText = await extractFileText(file);

  const uploadedFile = await createSchoolKnowledgeFile({
    schoolId: school.id,
    schoolName: school.name,
    filename: file.name,
    mimeType: normaliseMimeType(file),
    storagePath,
    extractedText,
    extractionStatus: "completed",
    embeddingStatus: process.env.OPENAI_API_KEY ? "processing" : "pending"
  });

  const chunks = splitIntoChunks(extractedText, uploadedFile.id);
  const enrichedChunks: SchoolKnowledgeChunkRecord[] = [];

  for (const chunk of chunks) {
    const embedding = process.env.OPENAI_API_KEY ? await createEmbedding(chunk.content).catch(() => null) : null;
    enrichedChunks.push({
      id: randomUUID(),
      fileId: chunk.fileId,
      schoolId: school.id,
      content: chunk.content,
      embedding,
      chunkIndex: chunk.chunkIndex,
      tokenCount: chunk.tokenCount,
      pageNumber: chunk.pageNumber
    });
  }

  await replaceSchoolKnowledgeChunks(uploadedFile.id, enrichedChunks);
  const finalFile =
    (await updateSchoolKnowledgeFile(uploadedFile.id, {
      embeddingStatus: process.env.OPENAI_API_KEY ? "completed" : "pending"
    })) ?? uploadedFile;

  return {
    school,
    file: {
      ...finalFile
    },
    chunkCount: enrichedChunks.length
  };
}
