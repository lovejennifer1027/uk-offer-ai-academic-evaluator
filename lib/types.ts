export type DimensionKey =
  | "structure"
  | "criticalThinking"
  | "useOfLiterature"
  | "referencing"
  | "language";

export interface RubricScoreValue {
  score: number;
  max: 20;
}

export interface RubricScores {
  Structure: RubricScoreValue;
  "Critical Thinking": RubricScoreValue;
  "Use of Literature": RubricScoreValue;
  Referencing: RubricScoreValue;
  Language: RubricScoreValue;
}

export interface EvaluationReport {
  overall_score: number;
  max_score: number;
  rubric_scores: RubricScores;
  overall_feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions_for_improvement: string[];
  disclaimer: string;
}

export interface SubmissionRecord {
  id: string;
  createdAt: string;
  essayTitle: string;
  essayTextPreview: string;
  briefPreview: string;
  rubricKey: string;
  rubricLabel: string;
  report: EvaluationReport;
  source: "supabase" | "sample" | "local";
}

export interface EvaluationApiResponse {
  submission: SubmissionRecord;
  storageMode: "supabase" | "local";
}

export interface SubmissionListApiResponse {
  submissions: SubmissionRecord[];
}

export interface SubmissionDetailApiResponse {
  submission: SubmissionRecord | null;
}
