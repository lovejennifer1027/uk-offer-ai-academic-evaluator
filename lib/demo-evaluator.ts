import { FORMATIVE_DISCLAIMER } from "@/lib/constants";
import { getRubricPreset } from "@/config/rubrics";
import { wordCount } from "@/lib/utils";
import type { EvaluationReport } from "@/lib/types";

interface DemoEvaluationInput {
  essayText: string;
  briefText: string;
  rubricKey: string;
}

function countMatches(value: string, pattern: RegExp) {
  return (value.match(pattern) ?? []).length;
}

export function generateDemoEvaluation({ essayText, briefText, rubricKey }: DemoEvaluationInput): EvaluationReport {
  const rubric = getRubricPreset(rubricKey);
  const words = wordCount(essayText);
  const paragraphs = essayText.split(/\n{2,}/).filter((section) => section.trim().length > 0).length;
  const citations = countMatches(essayText, /\(([^)]+,\s?\d{4}[a-z]?)\)|\[[0-9]+\]/g);
  const critique = countMatches(
    essayText.toLowerCase(),
    /\b(however|although|whereas|conversely|therefore|nonetheless|in contrast|argues that|suggests that)\b/g
  );
  const referenceListBonus = /references|bibliography/i.test(essayText) ? 2 : 0;

  const structure = Math.min(20, 6 + Math.min(paragraphs, 7) + (words > 1200 ? 3 : words > 800 ? 2 : 1));
  const criticalThinking = Math.min(20, 5 + Math.min(critique * 2, 10));
  const useOfLiterature = Math.min(20, 4 + Math.min(citations * 2, 10) + (briefText ? 1 : 0));
  const referencing = Math.min(20, 4 + Math.min(citations, 8) + referenceListBonus);
  const language = Math.min(20, 8 + (words > 1200 ? 4 : words > 800 ? 3 : words > 400 ? 2 : 1));

  const rubric_scores = {
    Structure: { score: structure, max: 20 as const },
    "Critical Thinking": { score: criticalThinking, max: 20 as const },
    "Use of Literature": { score: useOfLiterature, max: 20 as const },
    Referencing: { score: referencing, max: 20 as const },
    Language: { score: language, max: 20 as const }
  };

  const overall_score =
    rubric_scores.Structure.score +
    rubric_scores["Critical Thinking"].score +
    rubric_scores["Use of Literature"].score +
    rubric_scores.Referencing.score +
    rubric_scores.Language.score;

  return {
    overall_score,
    max_score: 100,
    rubric_scores,
    overall_feedback:
      `这份演示评估按照「${rubric.label}」的标准进行保守打分。文章已具备基本的学术写作基础，但若想进入更高分段，仍需要提升分析深度与文献控制能力。`,
    strengths: [
      "文章内容已经足以支持一次形成性学术评估。",
      "可以看出作者尝试通过段落或小节组织论述内容。",
      "对题目已有一定理解，具备继续提升的基础。"
    ],
    weaknesses: [
      "分析深度可能仍不稳定，部分观点提出后缺少充分权衡与论证。",
      "文献使用和引用规范仍显不足，尤其是在文献整合不够充分时更明显。",
      "文章论证主线还可以更清晰，让每一部分都更明确地推进核心观点。"
    ],
    suggestions_for_improvement: [
      "让每一段只完成一个明确的分析任务，并直接回应论文题目。",
      "增加比较、评价和综合，而不是主要停留在总结或描述层面。",
      "逐条检查文内引用与参考文献，确保格式与要求保持一致。"
    ],
    disclaimer: FORMATIVE_DISCLAIMER
  };
}
