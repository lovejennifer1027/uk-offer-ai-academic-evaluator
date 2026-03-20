import type { DimensionKey } from "@/lib/types";

export interface RubricDimensionConfig {
  key: DimensionKey;
  label: string;
  maxScore: number;
  description: string;
  markers: string[];
}

export interface RubricBand {
  label: string;
  minimum: number;
  summary: string;
}

export interface RubricPreset {
  key: string;
  label: string;
  audience: string;
  description: string;
  strictness: "standard" | "rigorous";
  teacherBriefPriority: boolean;
  moderatorNotes: string[];
  dimensions: RubricDimensionConfig[];
  scoringBands: RubricBand[];
}

const SHARED_DIMENSIONS: RubricDimensionConfig[] = [
  {
    key: "structure",
    label: "结构",
    maxScore: 20,
    description: "考察文章结构安排、逻辑连贯性、段落控制，以及引言、主体和结论之间的呼应关系。",
    markers: [
      "论证主线清晰",
      "段落与章节衔接明确",
      "过渡自然且有目的",
      "结论聚焦且有效"
    ]
  },
  {
    key: "criticalThinking",
    label: "批判性思维",
    maxScore: 20,
    description: "考察分析、比较、评价、细致判断与独立思考，而不是只做概括性描述。",
    markers: [
      "能够质疑前提假设",
      "会比较不同观点",
      "能说明影响与意义",
      "给出有依据的判断"
    ]
  },
  {
    key: "useOfLiterature",
    label: "文献使用",
    maxScore: 20,
    description: "考察学术文献或资料来源的广度、相关性、整合能力与综合使用水平。",
    markers: [
      "使用相关证据",
      "能整合而非简单罗列文献",
      "文献能服务于论证",
      "能区分资料质量高低"
    ]
  },
  {
    key: "referencing",
    label: "引用规范",
    maxScore: 20,
    description: "考察文内引用、出处标注与参考文献列表的准确性和一致性。",
    markers: [
      "引用格式一致",
      "出处标注清晰",
      "参考文献完整",
      "格式错误较少"
    ]
  },
  {
    key: "language",
    label: "语言表达",
    maxScore: 20,
    description: "考察正式学术语气、句式控制、语法、表达清晰度与措辞准确性。",
    markers: [
      "语体正式",
      "句子结构清晰",
      "词汇使用准确",
      "语法错误较少"
    ]
  }
];

export const RUBRIC_PRESETS: RubricPreset[] = [
  {
    key: "uk-undergraduate-essay",
    label: "英国本科论文",
    audience: "预科、一年级及普通本科课程论文",
    description:
      "适用于英国本科常见论文作业，重点考察论证控制、文献整合和引用规范。",
    strictness: "standard",
    teacherBriefPriority: true,
    moderatorNotes: [
      "要肯定清晰度与证据使用，但不能忽视分析表层化的问题。",
      "只要提供了老师要求，就应优先以老师要求为主要评估依据。"
    ],
    dimensions: SHARED_DIMENSIONS,
    scoringBands: [
      { label: "优秀", minimum: 70, summary: "论证有力，分析充分，证据支持持续且扎实。" },
      { label: "良好", minimum: 60, summary: "整体可信且合格，但在深度、整合或准确性上仍有缺口。" },
      { label: "及格", minimum: 50, summary: "内容覆盖基本达标，但分析不均衡，批判性发展有限。" },
      { label: "临界", minimum: 40, summary: "有基本回应，但执行与控制层面存在较明显问题。" },
      { label: "不及格", minimum: 0, summary: "仅部分满足要求，或证据与分析明显不足。" }
    ]
  },
  {
    key: "uk-postgraduate-analysis",
    label: "英国硕士分析型论文",
    audience: "硕士阶段分析型学术写作",
    description:
      "对综合能力、原创判断、方法意识和成熟学术表达提出更高要求。",
    strictness: "rigorous",
    teacherBriefPriority: true,
    moderatorNotes: [
      "与本科相比，应期待更强的综合能力和更鲜明的分析判断。",
      "对停留在描述层面、没有转化为论证的写法要明确扣分。"
    ],
    dimensions: SHARED_DIMENSIONS,
    scoringBands: [
      { label: "优秀", minimum: 70, summary: "论证成熟，推理清晰，对文献有深入而有力的回应。" },
      { label: "良好", minimum: 60, summary: "整体控制较强，但部分内容仍偏保守或原创性不足。" },
      { label: "及格", minimum: 50, summary: "达到基本硕士标准，但分析 ambition 与深度仍有限。" },
      { label: "临界", minimum: 40, summary: "部分内容合格，但未能持续体现硕士层级的学术深度。" },
      { label: "不及格", minimum: 0, summary: "批判性不足、证据使用薄弱，或表达存在明显问题。" }
    ]
  },
  {
    key: "research-proposal",
    label: "研究计划评估",
    audience: "研究计划、毕业论文提案和项目方案类写作",
    description:
      "重点评估研究动机、可行性、证据基础与整体学术呈现，适用于 proposal 类文本。",
    strictness: "rigorous",
    teacherBriefPriority: true,
    moderatorNotes: [
      "重点看选题范围是否可行、方法是否有依据，以及研究目标与证据是否一致。",
      "如果没有教师 Rubric，也要保持保守而严谨的学术标准。"
    ],
    dimensions: SHARED_DIMENSIONS,
    scoringBands: [
      { label: "优秀", minimum: 70, summary: "研究动机充分，范围可行，学术框架清晰且有说服力。" },
      { label: "良好", minimum: 60, summary: "整体扎实，但仍有部分关键要素展开不够充分。" },
      { label: "及格", minimum: 50, summary: "具备基本可行性，但论证与整合仍不够均衡。" },
      { label: "临界", minimum: 40, summary: "核心要素虽有体现，但清晰度、深度或一致性不足。" },
      { label: "不及格", minimum: 0, summary: "研究逻辑、证据基础或执行层面存在明显不足。" }
    ]
  }
];

export const DEFAULT_RUBRIC_KEY = RUBRIC_PRESETS[0].key;

export function getRubricPreset(key?: string) {
  return RUBRIC_PRESETS.find((preset) => preset.key === key) ?? RUBRIC_PRESETS[0];
}
