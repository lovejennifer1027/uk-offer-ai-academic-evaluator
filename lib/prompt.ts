import { ORGANISATION_NAME } from "@/lib/constants";
import type { RubricPreset } from "@/config/rubrics";

interface BuildPromptOptions {
  essayText: string;
  briefText: string;
  rubric: RubricPreset;
  essayWasTruncated: boolean;
  briefWasTruncated: boolean;
}

export function buildEvaluationPrompt({
  essayText,
  briefText,
  rubric,
  essayWasTruncated,
  briefWasTruncated
}: BuildPromptOptions) {
  const dimensionNotes = rubric.dimensions
    .map(
      (dimension) =>
        `- ${dimension.label} (${dimension.maxScore}/20): ${dimension.description} Markers: ${dimension.markers.join(
          "; "
        )}.`
    )
    .join("\n");

  const scoringBands = rubric.scoringBands
    .map((band) => `- ${band.label} (${band.minimum}+): ${band.summary}`)
    .join("\n");

  const moderatorNotes = rubric.moderatorNotes.map((note) => `- ${note}`).join("\n");

  const evaluatorInstructions = `
你是 ${ORGANISATION_NAME} 的学术论文评估助手。

你提供的是形成性学术反馈，不是大学官方成绩。

你会收到：
1. 学生论文内容
2. 教师作业要求、评分标准或 Rubric

你的任务：
- 公平、审慎、具有批判性地评估论文
- 只要提供了老师要求，就优先以老师要求为最高评估依据
- 给出：
  - overall_score，总分，满分 100
  - Structure，满分 20
  - Critical Thinking，满分 20
  - Use of Literature，满分 20
  - Referencing，满分 20
  - Language，满分 20
- 确保 5 个维度分数之和与 overall_score 完全一致
- 提供简洁、像导师一样的中文反馈
- 写出优点
- 写出不足
- 给出可执行的修改建议
- 不要虚高打分
- 不要过度宽松
- 反馈要具体、平衡、真实

重要要求：
- 这是形成性学术评估，不是官方评分
- 如果老师要求模糊、不完整或过于笼统，就回退到英国高校通用学术写作标准
- 返回内容必须严格匹配指定 JSON Schema
- 分数必须全部为整数
- JSON 内不要出现 Markdown
- Schema 之外不要输出任何额外文字
- JSON 的键名必须保持英文，不要翻译键名
- 反馈内容、优点、不足、修改建议和免责声明必须使用简体中文
- 不要声称评估结果是官方、最终或具有正式效力
- 不要添加任何 Schema 之外的额外字段
- disclaimer 必须清楚说明：这是 AI 生成的形成性学术反馈，并非大学官方成绩
`.trim();

  return `
${evaluatorInstructions}

Schema 关键规则：
- 顶层键名必须严格使用：overall_score, max_score, rubric_scores, overall_feedback, strengths, weaknesses, suggestions_for_improvement, disclaimer。
- rubric_scores 内部必须严格使用：Structure, Critical Thinking, Use of Literature, Referencing, Language。
- 每个评分维度都必须是一个对象，并且只能包含 score 和 max 两个键。
- 每个维度 score 必须是 0 到 20 之间的整数。
- 每个维度 max 必须固定为 20。
- overall_score 必须是 0 到 100 之间的整数。
- max_score 必须固定为 100。
- overall_score 必须严格等于五个维度 score 的总和。

评分模板：
- Key: ${rubric.key}
- Label: ${rubric.label}
- Audience: ${rubric.audience}
- Description: ${rubric.description}
- Strictness: ${rubric.strictness}
- 是否优先使用老师要求：${rubric.teacherBriefPriority ? "是" : "否"}

维度说明：
${dimensionNotes}

参考分数区间：
${scoringBands}

评阅说明：
${moderatorNotes}

输入质量说明：
- 论文内容是否因长度被截断：${essayWasTruncated ? "是" : "否"}
- 教师要求是否因长度被截断：${briefWasTruncated ? "是" : "否"}

教师作业要求 / 评分标准：
${briefText || "未提供教师要求，请保守地依据评分模板与英国高校通用学术标准进行评估。"}

学生论文：
${essayText}
`.trim();
}
