import { z } from "zod";

import type {
  GeneratedExamplePackCore,
  GeneratedInsightAnswer,
  GeneratedInsightContextItem
} from "@/lib/ai-library/types";
import { generatedExampleRequestSchema } from "@/lib/ai-library/schemas";
import { LIBRARY_ASSIGNMENT_TYPE_LABELS, LIBRARY_PROGRAMME_LEVEL_LABELS } from "@/lib/library/constants";

type GeneratedExampleInput = z.infer<typeof generatedExampleRequestSchema>;

const scoreBandFocusMap: Record<string, string> = {
  "60-69": "结构完整、论点清楚，但仍能看到论证密度和语言控制的提升空间",
  "70-79": "论证较成熟，文献整合与段落推进更有控制感",
  "80+": "学术判断更锋利，结构、证据和表达之间呈现高度一致性"
};

function cleanSubject(subject: string) {
  return subject.trim() || "Academic Writing";
}

export function generateDemoHighScoringExample(input: GeneratedExampleInput): GeneratedExamplePackCore {
  const subject = cleanSubject(input.subject);
  const levelLabel = LIBRARY_PROGRAMME_LEVEL_LABELS[input.programme_level];
  const assignmentLabel = LIBRARY_ASSIGNMENT_TYPE_LABELS[input.assignment_type];
  const scoreFocus = scoreBandFocusMap[input.score_band] ?? scoreBandFocusMap["70-79"];
  const focusTail = input.focus ? `，并特别聚焦于${input.focus}` : "";

  return {
    title: `${subject}${assignmentLabel} ${input.score_band} 高分写作示例包`,
    overview: `这是一组面向 ${levelLabel} ${assignmentLabel} 的 AI 生成高分写作示例，目标分数段为 ${input.score_band}。整体风格强调 ${scoreFocus}${focusTail}。`,
    example_sentences: [
      {
        purpose: "提出论点",
        sentence: `This ${assignmentLabel.toLowerCase()} argues that recent debates in ${subject} are best understood not as isolated disagreements, but as competing explanations of institutional change.`,
        why_it_works: "句子先明确论点，再交代争议范围，符合英国高校高分写作对 argument-led opening 的期待。"
      },
      {
        purpose: "界定分析范围",
        sentence: `Rather than attempting a descriptive overview of every position, the discussion concentrates on the tension between normative ambition and practical implementation.`,
        why_it_works: "通过主动限定范围，展示作者有能力控制材料，而不是把段落写成信息堆积。"
      },
      {
        purpose: "引入文献",
        sentence: `Existing scholarship is useful here not because it supplies a single answer, but because it exposes the assumptions that shape each line of interpretation.`,
        why_it_works: "这类写法把 literature 从“列举作者观点”提升为“服务分析框架”的工具。"
      },
      {
        purpose: "推进批判性分析",
        sentence: `However, this explanation becomes less convincing once the evidential basis is examined alongside the institutional context in which the claim is made.`,
        why_it_works: "高分表达往往不是直接否定，而是说明在什么条件下论点变弱，显得更有学术分寸。"
      },
      {
        purpose: "结尾收束",
        sentence: `Taken together, the analysis suggests that the strongest interpretation is the one that can connect conceptual precision with demonstrable explanatory value.`,
        why_it_works: "结尾没有简单重复，而是回到评判标准，帮助段落形成明确的 analytical closure。"
      }
    ],
    paragraph_example: {
      title: "高分分析段落示例",
      paragraph: `A stronger ${assignmentLabel.toLowerCase()} paragraph in ${subject} does more than summarise competing positions. It establishes why a debate matters, tests how far the supporting evidence actually carries the claim, and then explains what remains persuasive once weaker assumptions are removed. In practice, this means that evidence is introduced selectively and interpreted directly, rather than left to stand alone as if quotation itself were sufficient. The paragraph therefore signals control not through decorative complexity, but through a disciplined sequence of claim, evidence, evaluation, and analytical return.`,
      why_it_works: "这一段展示了高分段落常见的推进顺序：先立判断，再解释证据如何支持或削弱判断，最后回到核心分析。"
    },
    expression_templates: [
      {
        purpose: "段首立论",
        template: `This section argues that [core claim], particularly when viewed through [analytical lens].`,
        guidance: "适合用来快速建立段落中心判断。"
      },
      {
        purpose: "限定范围",
        template: `The discussion focuses less on [broad topic] and more on [specific tension / mechanism].`,
        guidance: "帮助你避免段落过宽，显得更可控。"
      },
      {
        purpose: "引文转分析",
        template: `[Author] is valuable here not simply for [summary], but for revealing [deeper implication].`,
        guidance: "把文献从复述拉回到分析用途。"
      },
      {
        purpose: "批判性转折",
        template: `This account is persuasive up to a point; however, its force weakens once [limitation] is taken into account.`,
        guidance: "更像导师式批判，而不是情绪化否定。"
      },
      {
        purpose: "结尾回扣",
        template: `What therefore matters is not only [surface point], but whether [evaluative criterion].`,
        guidance: "适合高分段落的收束和升格。"
      }
    ],
    analysis_notes: [
      "高分写作通常先交代论证任务，再安排证据，而不是先把材料全部摆出来。",
      "70+ 以上常见特征是段落内部有明显的判断链条，而不是只做描述性拼接。",
      "越接近 80+，越能看到作者主动筛选文献并解释其局限，而不只是引用权威。",
      "表达上会更节制，句子虽然不一定更长，但逻辑关系更明确。"
    ],
    usage_notes: [
      "请把这些句式当作结构和表达模板，不要整段照抄到正式作业中。",
      "真正的高分来自论证质量、证据使用与课程要求匹配，而不是表面上的“高级句型”。",
      "如果老师有明确 rubric，应优先按老师标准调整这些示例。"
    ],
    disclaimer:
      "以下内容为 AI 生成的学习示例，用于帮助理解英国高校高分写作特征，并非任何大学的官方样本或真实学生原文。"
  };
}

export function generateDemoGeneratedInsights(query: string, examples: GeneratedInsightContextItem[]): GeneratedInsightAnswer {
  const topExamples = examples.slice(0, 3);
  const subjectSet = Array.from(new Set(topExamples.map((item) => item.subject)));
  const scoreBandSet = Array.from(new Set(topExamples.map((item) => item.score_band)));

  return {
    answer:
      topExamples.length > 0
        ? `围绕“${query}”，当前积累的 AI 生成样本最一致的模式是：高分写作更强调先立判断、再解释证据如何服务论点，并在段末回到清晰的分析结论。${subjectSet.length > 0 ? `当前样本主要覆盖 ${subjectSet.join("、")}。` : ""}`
        : `当前还没有可分析的 AI 生成样本。请先生成一些高分案例后再提问。`,
    key_points:
      topExamples.length > 0
        ? [
            `当前 ${scoreBandSet.join(" / ")} 样本都强调结构控制，而不是单纯堆叠资料。`,
            "高分示句通常直接服务论点推进，而不是只追求表面上的学术化措辞。",
            "段落示例最稳定的共性是 claim、evidence、evaluation、return 这条推进链。"
          ]
        : ["当前没有足够样本支持总结。", "请先在示例页生成并积累一些案例。"],
    caveats: [
      "这些结论来自当前积累的 AI 生成示例，不是大学官方公开样本数据库。",
      "如果样本量较小，应把结论视为写作指导，而不是统计规律。"
    ],
    evidence: topExamples.map((item) => ({
      example_id: item.id,
      title: item.title,
      subject: item.subject,
      score_band: item.score_band,
      excerpt: item.example_excerpt
    }))
  };
}
