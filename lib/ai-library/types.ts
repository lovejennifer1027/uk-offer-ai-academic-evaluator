import { AI_LIBRARY_SCORE_BANDS } from "@/lib/ai-library/constants";
import type { LibraryAssignmentType, LibraryProgrammeLevel } from "@/lib/library/types";

export type GeneratedScoreBand = (typeof AI_LIBRARY_SCORE_BANDS)[number];

export interface GeneratedSentenceExample {
  purpose: string;
  sentence: string;
  why_it_works: string;
}

export interface GeneratedParagraphExample {
  title: string;
  paragraph: string;
  why_it_works: string;
}

export interface GeneratedExpressionTemplate {
  purpose: string;
  template: string;
  guidance: string;
}

export interface GeneratedExamplePackCore {
  title: string;
  overview: string;
  example_sentences: GeneratedSentenceExample[];
  paragraph_example: GeneratedParagraphExample;
  expression_templates: GeneratedExpressionTemplate[];
  analysis_notes: string[];
  usage_notes: string[];
  disclaimer: string;
}

export interface GeneratedExamplePack extends GeneratedExamplePackCore {
  id: string;
  createdAt: string;
  subject: string;
  programme_level: LibraryProgrammeLevel;
  assignment_type: LibraryAssignmentType;
  score_band: GeneratedScoreBand;
  focus: string | null;
  source: "openai" | "demo";
  accumulation_mode: "local";
}

export interface GeneratedExampleApiResponse {
  result: GeneratedExamplePack;
  prompt_version: string;
  storageMode: "local";
}

export interface GeneratedInsightContextItem {
  id: string;
  title: string;
  subject: string;
  programme_level: LibraryProgrammeLevel;
  assignment_type: LibraryAssignmentType;
  score_band: GeneratedScoreBand;
  overview: string;
  example_excerpt: string;
}

export interface GeneratedInsightEvidence {
  example_id: string;
  title: string;
  subject: string;
  score_band: GeneratedScoreBand;
  excerpt: string;
}

export interface GeneratedInsightAnswer {
  answer: string;
  key_points: string[];
  caveats: string[];
  evidence: GeneratedInsightEvidence[];
}
