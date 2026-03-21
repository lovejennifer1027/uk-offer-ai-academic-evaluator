import "server-only";

import { requestStructuredJson } from "@/lib/openai/client";
import { retrieveProjectEvidence } from "@/services/rag/retrieval";
import { briefAnalysisJsonSchema, briefAnalysisSchema, chatAnswerJsonSchema, chatAnswerSchema, evaluationReportJsonSchema, evaluationReportSchema } from "@/services/ai/schemas";
import { buildBriefAnalyzerPrompt, buildChatPrompt, buildEvaluationPrompt } from "@/services/ai/prompts";
import type { CitationStyle, ProjectLanguage } from "@/types/scholardesk";

export async function generateEvaluationReport(input: {
  projectId: string;
  paperText: string;
  rubricText?: string;
  targetLevel: string;
  citationStyle: CitationStyle;
  language: ProjectLanguage;
}) {
  const evidence = await retrieveProjectEvidence(input.projectId, `${input.paperText}\n${input.rubricText ?? ""}`);

  if (!process.env.OPENAI_API_KEY || process.env.ENABLE_DEMO_EVALUATION === "true") {
    const demo = {
      overallSummary:
        "The draft has a workable structure and a credible academic tone, but the argument needs tighter evidence handling and more explicit evaluation.",
      dimensionScores: {
        structure: 74,
        argument: 68,
        evidenceUse: 66,
        citationQuality: 70,
        languageClarity: 79,
        academicTone: 77
      },
      strengths: [
        "The draft maintains a recognizably academic tone throughout.",
        "Paragraph openings usually signal the intended topic clearly.",
        "The conclusion returns to the stated question rather than ending abruptly."
      ],
      priorityImprovements: [
        "Strengthen the line of argument between descriptive evidence and evaluative claims.",
        "Use cited material more selectively and explain why each source matters.",
        "Tighten transitions so each paragraph clearly advances the central claim."
      ],
      revisionChecklist: [
        "Rewrite the introduction so the research focus and argument are explicit.",
        "Check whether each body paragraph contains claim, evidence, and interpretation.",
        "Remove repetitive summary sentences that do not add analysis.",
        "Standardize in-text citation formatting before final review."
      ],
      citationFeedback: [
        "The citation style is mostly recognizable but still needs consistency checks.",
        "A final reference-list sweep is recommended before submission."
      ],
      grammarStyleNotes: [
        "Sentence control is mostly clear, but a few paragraphs become too dense.",
        "There is room to cut filler phrasing and improve precision."
      ],
      academicToneNotes: [
        "The tone is generally formal enough for higher-education writing.",
        "Some claims would feel stronger with more cautious analytical wording."
      ],
      optionalExamples: [
        "Open body paragraphs with a claim that names the analytical function of the section."
      ],
      sourcesUsed: evidence
    };

    return {
      overallScore: Math.round(
        Object.values(demo.dimensionScores).reduce((total, value) => total + value, 0) /
          Object.values(demo.dimensionScores).length
      ),
      jsonReport: demo
    };
  }

  const response = await requestStructuredJson({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4",
    schemaName: "scholardesk_evaluation_report",
    schemaDescription: "ScholarDesk AI structured paper evaluation report.",
    schema: evaluationReportJsonSchema,
    input: buildEvaluationPrompt({
      paperText: input.paperText,
      rubricText: input.rubricText,
      targetLevel: input.targetLevel,
      citationStyle: input.citationStyle,
      language: input.language,
      evidence
    }),
    maxOutputTokens: 2200
  });

  const parsedReport = evaluationReportSchema.omit({ sourcesUsed: true }).parse(response.data);
  const jsonReport = evaluationReportSchema.parse({
    ...parsedReport,
    sourcesUsed: evidence
  });
  const overallScore = Math.round(
    Object.values(jsonReport.dimensionScores).reduce((total, value) => total + value, 0) /
      Object.values(jsonReport.dimensionScores).length
  );

  return {
    overallScore,
    jsonReport
  };
}

export async function generateBriefAnalysis(input: {
  assignmentPrompt: string;
  rubricText?: string;
  language: ProjectLanguage;
}) {
  if (!process.env.OPENAI_API_KEY || process.env.ENABLE_DEMO_EVALUATION === "true") {
    return briefAnalysisSchema.parse({
      assignmentType: "Essay",
      expectedStructure: ["Introduction", "Literature context", "Analysis", "Conclusion"],
      keyDeliverables: ["Respond directly to the prompt", "Use academic sources", "Maintain a clear line of argument"],
      markingPriorities: ["Argument quality", "Evidence integration", "Critical evaluation"],
      likelyPitfalls: ["Over-describing sources", "Ignoring the exact task wording", "Weak citation consistency"],
      recommendedOutline: [
        "Clarify the question and working position",
        "Map the main debates or source categories",
        "Build 2-3 analytical body sections",
        "Close by returning to the marking focus"
      ],
      suggestedResearchQuestions: [
        "What tension or debate should the paper resolve?",
        "Which sources best support a comparative argument?",
        "Where is the strongest opportunity for critical evaluation?"
      ]
    });
  }

  const response = await requestStructuredJson({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4",
    schemaName: "scholardesk_brief_analysis",
    schemaDescription: "ScholarDesk AI assignment brief analysis output.",
    schema: briefAnalysisJsonSchema,
    input: buildBriefAnalyzerPrompt(input),
    maxOutputTokens: 1800
  });

  return briefAnalysisSchema.parse(response.data);
}

export async function generateKnowledgeAnswer(input: {
  projectId: string;
  question: string;
  language: ProjectLanguage;
}) {
  const evidence = await retrieveProjectEvidence(input.projectId, input.question);

  if (!process.env.OPENAI_API_KEY || process.env.ENABLE_DEMO_EVALUATION === "true") {
    return chatAnswerSchema.parse({
      answer:
        "Based on the currently indexed materials, the project evidence points toward a clearer emphasis on structure, source use, and explicit analytical framing.",
      followUpSuggestions: [
        "Compare the brief wording with the draft introduction.",
        "Check whether each key source is used analytically rather than descriptively.",
        "Ask for a paper evaluation run once the next revision is ready."
      ],
      sourcesUsed: evidence
    });
  }

  const response = await requestStructuredJson({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4",
    schemaName: "scholardesk_chat_answer",
    schemaDescription: "ScholarDesk AI grounded answer over project documents.",
    schema: chatAnswerJsonSchema,
    input: buildChatPrompt({
      question: input.question,
      language: input.language,
      evidence
    }),
    maxOutputTokens: 1400
  });

  const parsedAnswer = chatAnswerSchema.omit({ sourcesUsed: true }).parse(response.data);
  return chatAnswerSchema.parse({
    ...parsedAnswer,
    sourcesUsed: evidence
  });
}

export async function formatCitations(input: { rawText: string; style: CitationStyle }) {
  const lines = input.rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    style: input.style,
    formattedEntries: lines.map((line, index) => `[${input.style}] ${index + 1}. ${line}`)
  };
}
