import type { CitationStyle, EvidenceSnippet, ProjectLanguage } from "@/types/scholardesk";

export function buildEvaluationPrompt(input: {
  paperText: string;
  school: string;
  programme?: string;
  studyRoute?: string;
  rubricText?: string;
  targetLevel: string;
  citationStyle: CitationStyle;
  language: ProjectLanguage;
  evidence: EvidenceSnippet[];
}) {
  return `You are ScholarDesk AI, a compliant academic support assistant.

Task:
- evaluate the paper fairly
- provide revision-oriented academic feedback
- do not ghostwrite a full assignment
- use retrieved evidence only when relevant

Selected school: ${input.school}
Selected programme: ${input.programme?.trim() || "Use current project/module context"}
Study route: ${input.studyRoute?.trim() || "Not specified"}
Target level: ${input.targetLevel}
Citation style: ${input.citationStyle}
Working language: ${input.language}

Rubric:
${input.rubricText?.trim() || "No rubric provided. Use general higher-education academic writing standards."}

Retrieved evidence:
${input.evidence.map((item, index) => `${index + 1}. [${item.filename}] ${item.snippet}`).join("\n") || "No relevant project evidence found."}

Paper:
${input.paperText}
`;
}

export function buildBriefAnalyzerPrompt(input: {
  assignmentPrompt: string;
  rubricText?: string;
  language: ProjectLanguage;
}) {
  return `You are ScholarDesk AI, a compliant academic support assistant.

Task:
- analyze the assignment brief
- identify structure expectations, likely pitfalls, and a useful outline
- do not write a submission-ready assignment

Working language: ${input.language}

Assignment prompt:
${input.assignmentPrompt}

Rubric:
${input.rubricText?.trim() || "No rubric supplied."}
`;
}

export function buildChatPrompt(input: {
  question: string;
  language: ProjectLanguage;
  evidence: EvidenceSnippet[];
}) {
  return `You are ScholarDesk AI, a compliant academic support assistant.

Task:
- answer using the retrieved project evidence when possible
- do not hallucinate unsupported claims
- do not provide plagiarism evasion or academic misconduct advice

Working language: ${input.language}

Retrieved evidence:
${input.evidence.map((item, index) => `${index + 1}. [${item.filename}] ${item.snippet}`).join("\n") || "No project evidence available."}

Question:
${input.question}
`;
}
