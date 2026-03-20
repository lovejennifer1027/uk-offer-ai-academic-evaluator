insert into public.essay_submissions (
  id,
  created_at,
  essay_title,
  essay_preview,
  brief_preview,
  rubric_key,
  rubric_label,
  total_score,
  evaluation
) values (
  '7f8c9c0c-beb2-45c7-9b7b-1d5d3cb51f21',
  '2026-03-18T14:20:00.000Z',
  '英国上市公司 ESG 披露比较评估',
  '这篇示例论文比较了部分英国上市公司的 ESG 披露实践，并讨论自愿性披露框架是否能够提升信息可信度……',
  '老师要求重点比较至少六篇文献，论证逻辑清晰，使用 Harvard 引用格式，并明确评估披露框架的局限性。',
  'uk-undergraduate-essay',
  '英国本科论文',
  66,
  '{
    "overall_score": 66,
    "max_score": 100,
    "rubric_scores": {
      "Structure": { "score": 14, "max": 20 },
      "Critical Thinking": { "score": 13, "max": 20 },
      "Use of Literature": { "score": 14, "max": 20 },
      "Referencing": { "score": 12, "max": 20 },
      "Language": { "score": 13, "max": 20 }
    },
    "overall_feedback": "这篇文章具备较清晰的学术框架和基本连贯的论证，但分析深度还不足以稳定达到高分水平。",
    "strengths": [
      "文章具备明确的讨论主线，整体结构较为合理。",
      "相关文献能够较好地服务于讨论，而不是与论证脱节。",
      "整体语气较正式，基本符合学术写作要求。"
    ],
    "weaknesses": [
      "部分段落只是概述披露实践，没有充分分析其意义或局限。",
      "文章后半段的引用一致性下降，影响了技术规范性。",
      "结论虽然总结了主要内容，但学术判断还可以更明确。"
    ],
    "suggestions_for_improvement": [
      "把描述性观察转化为分析性论点。",
      "使用更明确的主题句，让比较逻辑更清楚。",
      "提交前再进行一次 Harvard 引用格式核查。"
    ],
    "disclaimer": "本报告由 UK Offer 国际教育基于 AI 生成，仅用于形成性学术反馈参考，并非大学官方成绩，不能替代导师、讲师或考官的正式判断。"
  }'::jsonb
)
on conflict (id) do nothing;
