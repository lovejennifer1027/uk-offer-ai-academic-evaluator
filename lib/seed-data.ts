import { FORMATIVE_DISCLAIMER } from "@/lib/constants";
import type { SubmissionRecord } from "@/lib/types";

export const sampleSubmissions: SubmissionRecord[] = [
  {
    id: "sample-undergraduate-essay",
    createdAt: "2026-03-18T14:20:00.000Z",
    essayTitle: "英国上市公司 ESG 披露比较评估",
    essayTextPreview:
      "这篇示例论文比较了部分英国上市公司的 ESG 披露实践，并讨论自愿性披露框架是否能够提升信息可信度……",
    briefPreview:
      "老师要求重点比较至少六篇文献，论证逻辑清晰，使用 Harvard 引用格式，并明确评估披露框架的局限性。",
    rubricKey: "uk-undergraduate-essay",
    rubricLabel: "英国本科论文",
    source: "sample",
    report: {
      overall_score: 66,
      max_score: 100,
      rubric_scores: {
        Structure: { score: 14, max: 20 },
        "Critical Thinking": { score: 13, max: 20 },
        "Use of Literature": { score: 14, max: 20 },
        Referencing: { score: 12, max: 20 },
        Language: { score: 13, max: 20 }
      },
      overall_feedback:
        "这篇文章具备较清晰的学术框架和基本连贯的论证，但分析深度还不足以稳定达到高分水平。不同公司之间的比较具有一定价值，但部分段落仍停留在描述层面，没有进一步分析披露质量差异背后的原因。",
      strengths: [
        "文章具备明确的讨论主线，整体结构较为合理。",
        "相关文献能够较好地服务于讨论，而不是与论证脱节。",
        "整体语气较正式，基本符合学术写作要求。"
      ],
      weaknesses: [
        "部分段落只是概述披露实践，没有充分分析其意义或局限。",
        "文章后半段的引用一致性下降，影响了技术规范性。",
        "结论虽然总结了主要内容，但学术判断还可以更明确。"
      ],
      suggestions_for_improvement: [
        "把描述性观察转化为分析性论点，解释这些差异为何会影响投资者或利益相关者。",
        "在每段开头加入更明确的主题句，让比较逻辑更易于追踪。",
        "提交前再进行一次 Harvard 引用格式核查。"
      ],
      disclaimer: FORMATIVE_DISCLAIMER
    }
  },
  {
    id: "sample-postgraduate-policy",
    createdAt: "2026-03-17T09:05:00.000Z",
    essayTitle: "国际学生流动性与毕业生就业力的政策批判",
    essayTextPreview:
      "这篇示例论文批判了“国际流动天然提升毕业生就业结果”的假设，并指出政策设计、劳动力市场环境与社会资本都会影响就业收益……",
    briefPreview:
      "作业要求整合政策材料与学术文献，保持批判性立场，并体现硕士层级的原创判断。",
    rubricKey: "uk-postgraduate-analysis",
    rubricLabel: "英国硕士分析型论文",
    source: "sample",
    report: {
      overall_score: 72,
      max_score: 100,
      rubric_scores: {
        Structure: { score: 15, max: 20 },
        "Critical Thinking": { score: 15, max: 20 },
        "Use of Literature": { score: 15, max: 20 },
        Referencing: { score: 13, max: 20 },
        Language: { score: 14, max: 20 }
      },
      overall_feedback:
        "这是一篇较强的硕士层级论文，分析立场清晰，文献使用也较有说服力。文章在多个部分已经超越简单总结，尤其是在比较政策叙事与劳动力市场证据时表现较好，但引用细节和个别过长段落仍影响了整体完成度。",
      strengths: [
        "核心论点明确，并且能贯穿全文。",
        "政策材料与学术文献实现了较好的整合，而不是彼此割裂。",
        "作者体现出一定的评价性判断，而不是机械重复文献观点。"
      ],
      weaknesses: [
        "个别段落信息过密，需要更清楚的内部结构提示。",
        "引用总体不错，但在更高分段要求下还不够稳定和精确。",
        "结尾部分对现实意义的表达还可以更有力度。"
      ],
      suggestions_for_improvement: [
        "拆分较长的分析段落，让每一段只完成一个明确的评价动作。",
        "进一步细化引用细节和参考文献格式，减少可避免的技术性失误。",
        "在结论中更有力地陈述论点的现实意义与影响。"
      ],
      disclaimer: FORMATIVE_DISCLAIMER
    }
  }
];
