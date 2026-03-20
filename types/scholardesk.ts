export type Locale = "en" | "zh";

export type UserRole = "student" | "admin";
export type UserPlan = "free" | "pro" | "team";
export type ProjectStatus = "draft" | "active" | "review" | "archived";
export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";
export type EmbeddingStatus = "pending" | "processing" | "completed" | "failed";
export type CitationStyle = "APA" | "MLA" | "Harvard" | "Chicago";
export type AssignmentType =
  | "essay"
  | "report"
  | "dissertation"
  | "reflection"
  | "proposal"
  | "presentation";
export type ProjectLanguage = "en" | "zh" | "bilingual";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface MarketingFeature {
  key: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
}

export interface PricingTier {
  key: string;
  name: LocalizedText;
  price: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  highlighted?: boolean;
}

export interface FAQItem {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface TestimonialItem {
  name: string;
  role: LocalizedText;
  quote: LocalizedText;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  title: string;
  school: string;
  module: string;
  assignmentType: AssignmentType;
  language: ProjectLanguage;
  status: ProjectStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFileRecord {
  id: string;
  projectId: string;
  filename: string;
  mimeType: string;
  storagePath: string;
  extractedText: string;
  extractionStatus: ExtractionStatus;
  embeddingStatus: EmbeddingStatus;
  createdAt: string;
}

export interface DocumentChunkRecord {
  id: string;
  fileId: string;
  content: string;
  embedding: number[] | null;
  chunkIndex: number;
  tokenCount: number;
  pageNumber?: number | null;
}

export interface EvidenceSnippet {
  fileId: string;
  filename: string;
  snippet: string;
  score?: number;
}

export interface EvaluationReportJson {
  overallSummary: string;
  dimensionScores: {
    structure: number;
    argument: number;
    evidenceUse: number;
    citationQuality: number;
    languageClarity: number;
    academicTone: number;
  };
  strengths: string[];
  priorityImprovements: string[];
  revisionChecklist: string[];
  citationFeedback: string[];
  grammarStyleNotes: string[];
  academicToneNotes: string[];
  optionalExamples: string[];
  sourcesUsed: EvidenceSnippet[];
}

export interface EvaluationReportRecord {
  id: string;
  projectId: string;
  overallScore: number;
  jsonReport: EvaluationReportJson;
  createdAt: string;
}

export interface BriefAnalysisJson {
  assignmentType: string;
  expectedStructure: string[];
  keyDeliverables: string[];
  markingPriorities: string[];
  likelyPitfalls: string[];
  recommendedOutline: string[];
  suggestedResearchQuestions: string[];
}

export interface BriefAnalysisRecord {
  id: string;
  projectId: string;
  jsonAnalysis: BriefAnalysisJson;
  createdAt: string;
}

export interface CitationJobRecord {
  id: string;
  projectId?: string;
  style: CitationStyle;
  inputText: string;
  outputText: string;
  createdAt: string;
}

export interface ChatThreadRecord {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citationsJson: EvidenceSnippet[];
  createdAt: string;
}

export interface UsageLogRecord {
  id: string;
  userId: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AdminSettingRecord {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface PromptTemplateRecord {
  id: string;
  key: string;
  title: string;
  prompt: string;
  updatedAt: string;
}

export interface LocalStoreShape {
  users: AppUser[];
  projects: ProjectRecord[];
  uploadedFiles: UploadedFileRecord[];
  documentChunks: DocumentChunkRecord[];
  evaluationReports: EvaluationReportRecord[];
  briefAnalyses: BriefAnalysisRecord[];
  citationJobs: CitationJobRecord[];
  chatThreads: ChatThreadRecord[];
  chatMessages: ChatMessageRecord[];
  usageLogs: UsageLogRecord[];
  adminSettings: AdminSettingRecord[];
  promptTemplates: PromptTemplateRecord[];
}
