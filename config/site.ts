import type { FAQItem, LocalizedText, MarketingFeature, PricingTier, TestimonialItem } from "@/types/scholardesk";

export const BRAND = {
  name: "ScholarDesk AI",
  tagline: {
    en: "Academic support powered by AI and your knowledge base",
    zh: "由 AI 与你的知识库驱动的学术支持平台"
  },
  description: {
    en: "A compliant academic productivity workspace for evaluation, requirement analysis, reference support, source review, and appeal evidence organization.",
    zh: "一个合规的学术效率平台，支持论文评估、作业要求分析、引用辅助、资料检索与申诉材料整理。"
  }
};

export const NAV_ITEMS: Array<{ href: string; label: LocalizedText }> = [
  { href: "/tools", label: { en: "Tools", zh: "工具" } },
  { href: "/pricing", label: { en: "Pricing", zh: "价格" } },
  { href: "/dashboard", label: { en: "Dashboard", zh: "工作台" } }
];

export const MARKETING_METRICS = [
  { value: "28k+", label: { en: "reports generated", zh: "已生成报告" } },
  { value: "120k+", label: { en: "documents analyzed", zh: "已分析文档" } },
  { value: "240+", label: { en: "institutions supported", zh: "覆盖院校类型" } }
];

export const FEATURES: MarketingFeature[] = [
  {
    key: "evaluation",
    title: { en: "Paper Evaluation", zh: "论文评估" },
    description: {
      en: "Generate structured revision reports with evidence-aware scoring and practical next-step guidance.",
      zh: "生成结构化修改报告，输出带证据感知的评分和可执行的下一步建议。"
    },
    icon: "FileCheck2"
  },
  {
    key: "brief",
    title: { en: "Requirement Analyzer", zh: "要求分析器" },
    description: {
      en: "Break down prompts, rubrics, deliverables, and marking priorities into a clear action plan.",
      zh: "把题目、评分标准、交付物与评分重点拆解成一份清晰的执行计划。"
    },
    icon: "ClipboardList"
  },
  {
    key: "knowledge",
    title: { en: "Knowledge Base Q&A", zh: "知识库问答" },
    description: {
      en: "Ask grounded questions against your uploaded materials and review the snippets used in each answer.",
      zh: "围绕你上传的材料进行问答，并查看每次回答所引用的片段。"
    },
    icon: "DatabaseZap"
  },
  {
    key: "citations",
    title: { en: "Citation Assistant", zh: "引用助手" },
    description: {
      en: "Format and clean references across common academic styles without promising academic shortcuts.",
      zh: "整理并格式化常见学术引用风格，不提供任何违规捷径。"
    },
    icon: "Quote"
  },
  {
    key: "search",
    title: { en: "Academic Search Workspace", zh: "学术检索工作区" },
    description: {
      en: "Review search results, save sources to projects, and generate concise summaries for faster review.",
      zh: "整理检索结果、保存到项目并生成简洁摘要，加速资料筛选。"
    },
    icon: "SearchCheck"
  },
  {
    key: "appeal",
    title: { en: "Appeal Evidence Organizer", zh: "申诉材料整理器" },
    description: {
      en: "Organize supporting facts, documents, and timelines for student review without offering legal advice.",
      zh: "整理支持事实、文档与时间线，辅助学生复核，不构成法律建议。"
    },
    icon: "FolderOpenDot"
  }
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: { en: "Create a project", zh: "创建项目" },
    description: {
      en: "Set the school, module, assignment type, and preferred working language.",
      zh: "设置学校、课程模块、作业类型与使用语言。"
    }
  },
  {
    step: "02",
    title: { en: "Upload and index files", zh: "上传并索引文件" },
    description: {
      en: "Extract text, split documents into chunks, and prepare them for retrieval-assisted workflows.",
      zh: "提取文本、切分文档块，并为检索增强工作流准备索引。"
    }
  },
  {
    step: "03",
    title: { en: "Run AI support workflows", zh: "运行 AI 支持流程" },
    description: {
      en: "Evaluate papers, analyze briefs, chat over knowledge, and organize reference or appeal materials.",
      zh: "执行论文评估、要求分析、知识库问答，以及引用或申诉材料整理。"
    }
  }
];

export const FAQS: FAQItem[] = [
  {
    question: {
      en: "Does ScholarDesk AI write full assignments for submission?",
      zh: "ScholarDesk AI 会直接帮用户代写整篇作业吗？"
    },
    answer: {
      en: "No. The platform is positioned for compliant academic support: evaluation, summarization, outlining, citation help, and grounded revision guidance.",
      zh: "不会。平台定位是合规学术支持：评估、总结、提纲建议、引用辅助与基于证据的修改建议。"
    }
  },
  {
    question: {
      en: "Can users ask questions against their own uploaded materials?",
      zh: "用户可以基于自己上传的材料进行问答吗？"
    },
    answer: {
      en: "Yes. Uploaded files are indexed into a project knowledge base so AI answers can reference relevant snippets when available.",
      zh: "可以。上传文件会被索引进项目知识库，AI 在可用时会引用相关片段来回答。"
    }
  },
  {
    question: {
      en: "Does the platform claim official institutional endorsement?",
      zh: "平台会宣称与学校或机构有官方合作关系吗？"
    },
    answer: {
      en: "No. The UI avoids unverifiable partnership claims and positions the product as an independent academic support workspace.",
      zh: "不会。界面避免任何无法验证的合作背书，产品定位为独立的学术支持工作台。"
    }
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "M. Chen",
    role: { en: "Master's student", zh: "硕士学生" },
    quote: {
      en: "The dashboard made it much easier to compare my rubric with my draft and plan the next revision cycle.",
      zh: "这个工作台让我更容易把 rubric 和草稿对照起来，也更容易规划下一轮修改。"
    }
  },
  {
    name: "A. Rahman",
    role: { en: "Foundation programme student", zh: "预科学生" },
    quote: {
      en: "I liked seeing the evidence panel beside the evaluation instead of receiving generic feedback only.",
      zh: "我喜欢评估旁边能直接看到 evidence panel，而不是只收到泛泛的反馈。"
    }
  },
  {
    name: "L. Wang",
    role: { en: "Education consultant", zh: "教育顾问" },
    quote: {
      en: "The project structure feels client-ready and makes follow-up support much easier to explain.",
      zh: "项目结构很适合面向客户展示，也更方便解释后续的支持流程。"
    }
  }
];

export const PRICING_TIERS: PricingTier[] = [
  {
    key: "free",
    name: { en: "Free", zh: "免费版" },
    price: { en: "$0", zh: "¥0" },
    description: { en: "For first-time evaluation and demo workflows.", zh: "适合首次体验评估与演示流程。" },
    features: [
      { en: "1 active project", zh: "1 个活跃项目" },
      { en: "Basic evaluation runs", zh: "基础评估次数" },
      { en: "Local knowledge-base demo", zh: "本地知识库演示" }
    ]
  },
  {
    key: "pro",
    name: { en: "Pro", zh: "专业版" },
    price: { en: "$29/mo", zh: "¥199/月" },
    description: { en: "For students and advisors who need regular support.", zh: "适合需要持续使用的学生与顾问。" },
    highlighted: true,
    features: [
      { en: "Unlimited projects", zh: "不限项目数" },
      { en: "Retrieval-assisted AI workflows", zh: "检索增强 AI 工作流" },
      { en: "Exportable reports and citations", zh: "可导出报告与引用" }
    ]
  },
  {
    key: "team",
    name: { en: "Team", zh: "团队版" },
    price: { en: "Custom", zh: "联系咨询" },
    description: { en: "For tutoring teams, consultancies, and academic support operations.", zh: "适合辅导团队、咨询机构与学术支持团队。" },
    features: [
      { en: "Admin controls and feature flags", zh: "管理控制与功能开关" },
      { en: "Shared projects and content blocks", zh: "共享项目与内容模块" },
      { en: "Prompt template management", zh: "Prompt 模板管理" }
    ]
  }
];
