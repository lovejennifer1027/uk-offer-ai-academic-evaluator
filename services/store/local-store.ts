import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { getLocalDataDir } from "@/lib/local-data-dir";
import type {
  AdminSettingRecord,
  AppUser,
  BriefAnalysisRecord,
  ChatMessageRecord,
  ChatThreadRecord,
  CitationJobRecord,
  DocumentChunkRecord,
  EvaluationReportRecord,
  LocalStoreShape,
  ProjectRecord,
  PromptTemplateRecord,
  SchoolKnowledgeChunkRecord,
  SchoolKnowledgeFileRecord,
  UploadedFileRecord,
  UsageLogRecord
} from "@/types/scholardesk";

const STORE_PATH = path.join(getLocalDataDir(), "store.json");

function now() {
  return new Date().toISOString();
}

function createDefaultStore(): LocalStoreShape {
  const demoUserId = randomUUID();
  const demoProjectId = randomUUID();
  const demoThreadId = randomUUID();

  return {
    users: [
      {
        id: demoUserId,
        name: "Demo Student",
        email: "demo@scholardesk.ai",
        role: "student",
        plan: "pro",
        createdAt: now()
      },
      {
        id: randomUUID(),
        name: "ScholarDesk Admin",
        email: "admin@scholardesk.ai",
        role: "admin",
        plan: "team",
        createdAt: now()
      }
    ],
    projects: [
      {
        id: demoProjectId,
        userId: demoUserId,
        title: "International Business Strategy Essay",
        school: "Demo University",
        module: "BUS702",
        assignmentType: "essay",
        language: "en",
        status: "active",
        tags: ["strategy", "business", "demo"],
        createdAt: now(),
        updatedAt: now()
      }
    ],
    uploadedFiles: [
      {
        id: randomUUID(),
        projectId: demoProjectId,
        filename: "sample-brief.md",
        mimeType: "text/markdown",
        storagePath: "local://demo/sample-brief.md",
        extractedText: "Discuss market entry strategy for a UK-based company expanding into Southeast Asia.",
        extractionStatus: "completed",
        embeddingStatus: "pending",
        createdAt: now()
      }
    ],
    schoolKnowledgeFiles: [],
    documentChunks: [],
    schoolKnowledgeChunks: [],
    evaluationReports: [],
    briefAnalyses: [],
    citationJobs: [],
    chatThreads: [
      {
        id: demoThreadId,
        projectId: demoProjectId,
        title: "Research Notes",
        createdAt: now()
      }
    ],
    chatMessages: [],
    usageLogs: [],
    adminSettings: [
      { id: randomUUID(), key: "featureFlags.paperEvaluation", value: "true", updatedAt: now() },
      { id: randomUUID(), key: "featureFlags.appealOrganizer", value: "true", updatedAt: now() }
    ],
    promptTemplates: [
      {
        id: randomUUID(),
        key: "evaluation-default",
        title: "Evaluation default prompt",
        prompt: "Evaluate the paper using the rubric and retrieved evidence.",
        updatedAt: now()
      }
    ]
  };
}

function normaliseStore(store: Partial<LocalStoreShape>): LocalStoreShape {
  const defaults = createDefaultStore();

  return {
    users: store.users ?? defaults.users,
    projects: store.projects ?? defaults.projects,
    uploadedFiles: store.uploadedFiles ?? defaults.uploadedFiles,
    schoolKnowledgeFiles: store.schoolKnowledgeFiles ?? [],
    documentChunks: store.documentChunks ?? defaults.documentChunks,
    schoolKnowledgeChunks: store.schoolKnowledgeChunks ?? [],
    evaluationReports: store.evaluationReports ?? defaults.evaluationReports,
    briefAnalyses: store.briefAnalyses ?? defaults.briefAnalyses,
    citationJobs: store.citationJobs ?? defaults.citationJobs,
    chatThreads: store.chatThreads ?? defaults.chatThreads,
    chatMessages: store.chatMessages ?? defaults.chatMessages,
    usageLogs: store.usageLogs ?? defaults.usageLogs,
    adminSettings: store.adminSettings ?? defaults.adminSettings,
    promptTemplates: store.promptTemplates ?? defaults.promptTemplates
  };
}

async function ensureStoreFile() {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(createDefaultStore(), null, 2), "utf8");
  }
}

export async function readStore() {
  await ensureStoreFile();
  const content = await readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(content) as Partial<LocalStoreShape>;
  return normaliseStore(parsed);
}

export async function writeStore(store: LocalStoreShape) {
  await ensureStoreFile();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getOrCreateDemoUser() {
  const store = await readStore();
  const existing = store.users.find((user) => user.email === "demo@scholardesk.ai");
  return existing ?? store.users[0];
}

export async function getUserById(userId: string) {
  const store = await readStore();
  return store.users.find((user) => user.id === userId) ?? null;
}

export async function findUserByEmail(email: string) {
  const store = await readStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(input: Pick<AppUser, "name" | "email" | "passwordHash" | "role" | "plan">) {
  const store = await readStore();
  const user: AppUser = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    role: input.role,
    plan: input.plan,
    createdAt: now()
  };
  store.users.unshift(user);
  await writeStore(store);
  return user;
}

export async function listProjectsByUser(userId: string) {
  const store = await readStore();
  return store.projects.filter((project) => project.userId === userId);
}

export async function getProjectById(projectId: string) {
  const store = await readStore();
  return store.projects.find((project) => project.id === projectId) ?? null;
}

export async function getProjectByIdForUser(projectId: string, userId: string) {
  const store = await readStore();
  return store.projects.find((project) => project.id === projectId && project.userId === userId) ?? null;
}

export async function createProject(
  input: Pick<ProjectRecord, "userId" | "title" | "school" | "module" | "assignmentType" | "language" | "status" | "tags">
) {
  const store = await readStore();
  const project: ProjectRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now(),
    updatedAt: now()
  };
  store.projects.unshift(project);
  await writeStore(store);
  return project;
}

export async function listFilesByProject(projectId: string) {
  const store = await readStore();
  return store.uploadedFiles.filter((file) => file.projectId === projectId);
}

export async function listSchoolKnowledgeFiles(schoolId?: string) {
  const store = await readStore();

  if (!schoolId) {
    return store.schoolKnowledgeFiles;
  }

  return store.schoolKnowledgeFiles.filter((file) => file.schoolId === schoolId);
}

export async function createUploadedFile(
  input: Pick<UploadedFileRecord, "projectId" | "filename" | "mimeType" | "storagePath" | "extractedText" | "extractionStatus" | "embeddingStatus">
) {
  const store = await readStore();
  const file: UploadedFileRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.uploadedFiles.unshift(file);
  await writeStore(store);
  return file;
}

export async function createSchoolKnowledgeFile(
  input: Pick<
    SchoolKnowledgeFileRecord,
    "schoolId" | "schoolName" | "filename" | "mimeType" | "storagePath" | "extractedText" | "extractionStatus" | "embeddingStatus"
  >
) {
  const store = await readStore();
  const file: SchoolKnowledgeFileRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.schoolKnowledgeFiles.unshift(file);
  await writeStore(store);
  return file;
}

export async function updateUploadedFile(
  fileId: string,
  patch: Partial<Pick<UploadedFileRecord, "extractedText" | "extractionStatus" | "embeddingStatus" | "storagePath" | "mimeType" | "filename">>
) {
  const store = await readStore();
  const index = store.uploadedFiles.findIndex((file) => file.id === fileId);

  if (index === -1) {
    return null;
  }

  store.uploadedFiles[index] = {
    ...store.uploadedFiles[index],
    ...patch
  };
  await writeStore(store);
  return store.uploadedFiles[index];
}

export async function updateSchoolKnowledgeFile(
  fileId: string,
  patch: Partial<
    Pick<
      SchoolKnowledgeFileRecord,
      "extractedText" | "extractionStatus" | "embeddingStatus" | "storagePath" | "mimeType" | "filename" | "schoolName"
    >
  >
) {
  const store = await readStore();
  const index = store.schoolKnowledgeFiles.findIndex((file) => file.id === fileId);

  if (index === -1) {
    return null;
  }

  store.schoolKnowledgeFiles[index] = {
    ...store.schoolKnowledgeFiles[index],
    ...patch
  };
  await writeStore(store);
  return store.schoolKnowledgeFiles[index];
}

export async function replaceDocumentChunks(fileId: string, chunks: DocumentChunkRecord[]) {
  const store = await readStore();
  store.documentChunks = store.documentChunks.filter((chunk) => chunk.fileId !== fileId).concat(chunks);
  await writeStore(store);
}

export async function replaceSchoolKnowledgeChunks(fileId: string, chunks: SchoolKnowledgeChunkRecord[]) {
  const store = await readStore();
  store.schoolKnowledgeChunks = store.schoolKnowledgeChunks.filter((chunk) => chunk.fileId !== fileId).concat(chunks);
  await writeStore(store);
}

export async function getChunksForProject(projectId: string) {
  const store = await readStore();
  const fileIds = new Set(store.uploadedFiles.filter((file) => file.projectId === projectId).map((file) => file.id));
  return store.documentChunks.filter((chunk) => fileIds.has(chunk.fileId));
}

export async function getChunksForSchool(schoolId: string) {
  const store = await readStore();
  return store.schoolKnowledgeChunks.filter((chunk) => chunk.schoolId === schoolId);
}

export async function createEvaluationReport(
  input: Pick<EvaluationReportRecord, "projectId" | "overallScore" | "jsonReport">
) {
  const store = await readStore();
  const report: EvaluationReportRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.evaluationReports.unshift(report);
  await writeStore(store);
  return report;
}

export async function listReportsByProject(projectId: string) {
  const store = await readStore();
  return store.evaluationReports.filter((report) => report.projectId === projectId);
}

export async function createBriefAnalysis(input: Pick<BriefAnalysisRecord, "projectId" | "jsonAnalysis">) {
  const store = await readStore();
  const analysis: BriefAnalysisRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.briefAnalyses.unshift(analysis);
  await writeStore(store);
  return analysis;
}

export async function createCitationJob(input: Pick<CitationJobRecord, "projectId" | "style" | "inputText" | "outputText">) {
  const store = await readStore();
  const job: CitationJobRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.citationJobs.unshift(job);
  await writeStore(store);
  return job;
}

export async function listThreadsByProject(projectId: string) {
  const store = await readStore();
  return store.chatThreads.filter((thread) => thread.projectId === projectId);
}

export async function createChatThread(input: Pick<ChatThreadRecord, "projectId" | "title">) {
  const store = await readStore();
  const thread: ChatThreadRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.chatThreads.unshift(thread);
  await writeStore(store);
  return thread;
}

export async function listMessagesByThread(threadId: string) {
  const store = await readStore();
  return store.chatMessages.filter((message) => message.threadId === threadId);
}

export async function createChatMessage(
  input: Pick<ChatMessageRecord, "threadId" | "role" | "content" | "citationsJson">
) {
  const store = await readStore();
  const message: ChatMessageRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.chatMessages.push(message);
  await writeStore(store);
  return message;
}

export async function addUsageLog(input: Pick<UsageLogRecord, "userId" | "action" | "payload">) {
  const store = await readStore();
  const log: UsageLogRecord = {
    id: randomUUID(),
    ...input,
    createdAt: now()
  };
  store.usageLogs.unshift(log);
  await writeStore(store);
  return log;
}

export async function getAdminSettings() {
  const store = await readStore();
  return store.adminSettings;
}

export async function getPromptTemplates() {
  const store = await readStore();
  return store.promptTemplates;
}

export async function getAdminSnapshot() {
  const store = await readStore();
  return {
    users: store.users,
    projects: store.projects,
    files: store.uploadedFiles,
    schoolKnowledgeFiles: store.schoolKnowledgeFiles,
    reports: store.evaluationReports,
    logs: store.usageLogs,
    settings: store.adminSettings,
    promptTemplates: store.promptTemplates
  };
}
