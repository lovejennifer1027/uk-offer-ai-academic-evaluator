CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT,
  "role" TEXT NOT NULL DEFAULT 'student',
  "plan" TEXT NOT NULL DEFAULT 'free',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMPTZ NOT NULL,
  UNIQUE ("identifier", "token")
);

CREATE TABLE "Project" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "school" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "assignmentType" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ProjectTag" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL
);

CREATE TABLE "UploadedFile" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "extractedText" TEXT NOT NULL,
  "extractionStatus" TEXT NOT NULL DEFAULT 'pending',
  "embeddingStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "SchoolKnowledgeFile" (
  "id" TEXT PRIMARY KEY,
  "schoolId" TEXT NOT NULL,
  "schoolName" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "extractedText" TEXT NOT NULL,
  "extractionStatus" TEXT NOT NULL DEFAULT 'pending',
  "embeddingStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "DocumentChunk" (
  "id" TEXT PRIMARY KEY,
  "fileId" TEXT NOT NULL REFERENCES "UploadedFile"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "embedding" vector(1536),
  "chunkIndex" INTEGER NOT NULL,
  "tokenCount" INTEGER NOT NULL,
  "pageNumber" INTEGER
);

CREATE TABLE "SchoolKnowledgeChunk" (
  "id" TEXT PRIMARY KEY,
  "fileId" TEXT NOT NULL REFERENCES "SchoolKnowledgeFile"("id") ON DELETE CASCADE,
  "schoolId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector(1536),
  "chunkIndex" INTEGER NOT NULL,
  "tokenCount" INTEGER NOT NULL,
  "pageNumber" INTEGER
);

CREATE TABLE "EvaluationReport" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "overallScore" INTEGER NOT NULL,
  "jsonReport" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "BriefAnalysis" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "jsonAnalysis" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CitationJob" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT REFERENCES "Project"("id") ON DELETE SET NULL,
  "style" TEXT NOT NULL,
  "inputText" TEXT NOT NULL,
  "outputText" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ChatThread" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ChatMessage" (
  "id" TEXT PRIMARY KEY,
  "threadId" TEXT NOT NULL REFERENCES "ChatThread"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "citationsJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "UsageLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "AdminSetting" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "PromptTemplate" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "SchoolKnowledgeFile_schoolId_idx" ON "SchoolKnowledgeFile"("schoolId");
CREATE INDEX "SchoolKnowledgeFile_schoolName_idx" ON "SchoolKnowledgeFile"("schoolName");
CREATE INDEX "SchoolKnowledgeChunk_schoolId_idx" ON "SchoolKnowledgeChunk"("schoolId");
CREATE INDEX "SchoolKnowledgeChunk_fileId_chunkIndex_idx" ON "SchoolKnowledgeChunk"("fileId", "chunkIndex");
