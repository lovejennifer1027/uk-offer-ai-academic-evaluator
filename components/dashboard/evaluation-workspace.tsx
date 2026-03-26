"use client";

import type { ChangeEvent, ComponentType, DragEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Dot,
  FileText,
  School,
  Upload
} from "lucide-react";

import { buildAcademicSchoolOptions, resolveAcademicSchoolProfile } from "@/config/academic-schools";
import { SourceCitationPanel } from "@/components/dashboard/source-citation-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, wordCount } from "@/lib/utils";
import type { CitationStyle, EvaluationReportJson, ProjectLanguage } from "@/types/scholardesk";

const citationStyleOptions: CitationStyle[] = ["APA", "MLA", "Harvard", "Chicago"];
const studyRouteOptions = ["Direct entry", "3+1", "2+2"] as const;

const scoreDimensions: Array<{ key: keyof EvaluationReportJson["dimensionScores"]; label: string; hint: string }> = [
  { key: "structure", label: "结构", hint: "是否符合学校要求与论证顺序" },
  { key: "argument", label: "论证", hint: "观点推进、批判性和分析力度" },
  { key: "evidenceUse", label: "证据使用", hint: "文献、案例与证据解释质量" },
  { key: "citationQuality", label: "引用规范", hint: "引用格式、文献表与一致性" },
  { key: "languageClarity", label: "语言表达", hint: "句子清晰度、准确性与连贯性" },
  { key: "academicTone", label: "学术语气", hint: "是否符合英国高校学术写作风格" }
];

const previewPriorities = [
  {
    title: "Section 3 的批判性不够强",
    detail: "当前更多是在描述观点，建议加入方案比较、优先级判断和文献支撑，让分析从“说明”变成“论证”。",
    level: "高优先级"
  },
  {
    title: "段落中间的引用密度偏低",
    detail: "一些关键判断只有段末引用，建议把来源分散到核心分析句之后，提升学术可信度。",
    level: "高优先级"
  },
  {
    title: "结论需要更贴任务要求",
    detail: "结尾总结还可以更具体一些，直接回扣题目 wording 和评分标准会更稳。",
    level: "中优先级"
  }
];

const previewEvidence = [
  "Level 6 marking rubric – distinction descriptors",
  "Module brief – BUS702 assessment requirements",
  "Lecture week 4 guidance on critical evaluation",
  "Assignment handbook – academic writing notes"
];

type UploadSlot = "paper" | "rubric";
type ResultTab = "breakdown" | "priorities" | "evidence";
type ExportVariant = "full" | "student" | "advisor";

interface UploadState {
  status: "idle" | "uploading" | "done" | "error";
  message?: string;
  fileName?: string;
}

interface UploadPayload {
  message?: string;
  error?: string;
  file?: {
    extractedText?: string;
    filename?: string;
  };
}

const exportVariants: Array<{
  key: ExportVariant;
  title: string;
  description: string;
  label: string;
  tier: string;
  price: string;
  highlights: string[];
}> = [
  {
    key: "full",
    title: "标准评分报告",
    description: "适合先快速看总分、分项评分和主要修改方向，适合作为第一次评估输出。",
    label: "Standard PDF",
    tier: "Basic",
    price: "GBP 9",
    highlights: ["总分与分项评分", "核心优点总结", "基础修改建议"]
  },
  {
    key: "student",
    title: "学生提分报告",
    description: "更适合直接发给学生查看，重点看结论、修改动作和提分优先级。",
    label: "Student PDF",
    tier: "Pro",
    price: "GBP 19",
    highlights: ["学生可读版本", "提分动作清单", "语言与引用提醒"]
  },
  {
    key: "advisor",
    title: "顾问复核报告",
    description: "给顾问或老师二次复核时使用，突出证据、语气、引用和风险提醒。",
    label: "Advisor PDF",
    tier: "Premium",
    price: "GBP 39",
    highlights: ["顾问复核视角", "证据来源明细", "高优先级风险提示"]
  }
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function buildPrintableReportHtml({
  variant,
  projectTitle,
  moduleCode,
  schoolName,
  studyRoute,
  overallScore,
  report,
  scores
}: {
  variant: ExportVariant;
  projectTitle: string;
  moduleCode: string;
  schoolName: string;
  studyRoute: string;
  overallScore: number;
  report: EvaluationReportJson;
  scores: Array<{ label: string; hint: string; value: number }>;
}) {
  const scoreRows = scores
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.label)}</td>
          <td>${escapeHtml(item.hint)}</td>
          <td>${item.value}/100</td>
        </tr>
      `
    )
    .join("");

  const evidenceRows = report.sourcesUsed.length
    ? report.sourcesUsed
        .map(
          (item) => `
            <div class="evidence-item">
              <div class="evidence-file">${escapeHtml(item.filename)}</div>
              <div class="evidence-snippet">${escapeHtml(item.snippet)}</div>
            </div>
          `
        )
        .join("")
    : "<div class='muted'>No evidence snippets were attached to this run.</div>";

  const sharedHeader = `
    <div class="hero">
      <div>
        <div class="eyebrow">ScholarDesk AI evaluation export</div>
        <h1>${variant === "full" ? "Academic Evaluation Report" : variant === "student" ? "Student Revision Report" : "Advisor Review Report"}</h1>
        <p>${escapeHtml(projectTitle)} · ${escapeHtml(moduleCode)} · ${escapeHtml(schoolName)} · ${escapeHtml(studyRoute)}</p>
      </div>
      <div class="score-card">
        <div class="score-label">Overall score</div>
        <div class="score-value">${overallScore}</div>
        <div class="score-caption">/ 100</div>
      </div>
    </div>
  `;

  const fullContent = `
    <section>
      <h2>Overall summary</h2>
      <p>${escapeHtml(report.overallSummary)}</p>
    </section>
    <section>
      <h2>Dimension scores</h2>
      <table>
        <thead>
          <tr><th>Dimension</th><th>Focus</th><th>Score</th></tr>
        </thead>
        <tbody>${scoreRows}</tbody>
      </table>
    </section>
    <section class="grid grid-2">
      <div class="panel">
        <h3>Strengths</h3>
        <ul>${renderList(report.strengths)}</ul>
      </div>
      <div class="panel">
        <h3>Priority improvements</h3>
        <ul>${renderList(report.priorityImprovements)}</ul>
      </div>
    </section>
    <section>
      <h2>Revision checklist</h2>
      <ul>${renderList(report.revisionChecklist)}</ul>
    </section>
    <section>
      <h2>Evidence used</h2>
      ${evidenceRows}
    </section>
  `;

  const studentContent = `
    <section>
      <h2>What this result means</h2>
      <p>${escapeHtml(report.overallSummary)}</p>
    </section>
    <section class="grid grid-2">
      <div class="panel">
        <h3>What is already working</h3>
        <ul>${renderList(report.strengths)}</ul>
      </div>
      <div class="panel">
        <h3>What to fix first</h3>
        <ul>${renderList(report.priorityImprovements.slice(0, 3))}</ul>
      </div>
    </section>
    <section>
      <h2>Action checklist</h2>
      <ul>${renderList(report.revisionChecklist)}</ul>
    </section>
    <section class="grid grid-2">
      <div class="panel">
        <h3>Citation notes</h3>
        <ul>${renderList(report.citationFeedback)}</ul>
      </div>
      <div class="panel">
        <h3>Language notes</h3>
        <ul>${renderList(report.grammarStyleNotes)}</ul>
      </div>
    </section>
  `;

  const advisorContent = `
    <section>
      <h2>Review summary</h2>
      <p>${escapeHtml(report.overallSummary)}</p>
    </section>
    <section>
      <h2>Dimension scores</h2>
      <table>
        <thead>
          <tr><th>Dimension</th><th>Focus</th><th>Score</th></tr>
        </thead>
        <tbody>${scoreRows}</tbody>
      </table>
    </section>
    <section class="grid grid-2">
      <div class="panel">
        <h3>Citation feedback</h3>
        <ul>${renderList(report.citationFeedback)}</ul>
      </div>
      <div class="panel">
        <h3>Academic tone notes</h3>
        <ul>${renderList(report.academicToneNotes)}</ul>
      </div>
    </section>
    <section class="grid grid-2">
      <div class="panel">
        <h3>Priority improvements</h3>
        <ul>${renderList(report.priorityImprovements)}</ul>
      </div>
      <div class="panel">
        <h3>Optional examples</h3>
        <ul>${renderList(report.optionalExamples.length ? report.optionalExamples : ["No optional examples were generated in this run."])}</ul>
      </div>
    </section>
    <section>
      <h2>Evidence used</h2>
      ${evidenceRows}
    </section>
  `;

  const body = variant === "full" ? fullContent : variant === "student" ? studentContent : advisorContent;

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(projectTitle)} - ${variant} export</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #0f172a;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          }
          main { max-width: 960px; margin: 0 auto; padding: 40px 28px 56px; }
          .hero {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding: 28px;
            border-radius: 28px;
            color: white;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }
          .eyebrow { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7; }
          h1 { margin: 10px 0 8px; font-size: 34px; line-height: 1.1; }
          h2 { margin: 0 0 14px; font-size: 22px; }
          h3 { margin: 0 0 12px; font-size: 16px; }
          p, li, td, th, div { line-height: 1.65; }
          section { margin-top: 24px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 24px; background: white; }
          .panel { padding: 20px; border-radius: 22px; border: 1px solid #e2e8f0; background: #f8fafc; }
          .grid { display: grid; gap: 16px; }
          .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .score-card {
            min-width: 180px;
            padding: 20px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.08);
            text-align: right;
          }
          .score-label { font-size: 12px; opacity: 0.72; text-transform: uppercase; letter-spacing: 0.08em; }
          .score-value { margin-top: 8px; font-size: 54px; font-weight: 700; line-height: 1; }
          .score-caption { margin-top: 6px; font-size: 13px; opacity: 0.75; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; vertical-align: top; }
          th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
          ul { margin: 0; padding-left: 20px; }
          .evidence-item { padding: 14px 0; border-bottom: 1px solid #e2e8f0; }
          .evidence-file { font-weight: 600; margin-bottom: 6px; }
          .evidence-snippet, .muted { color: #64748b; }
          @media print {
            body { background: white; }
            main { max-width: none; padding: 0; }
            section, .hero, .panel, .score-card { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <main>
          ${sharedHeader}
          ${body}
        </main>
        <script>
          window.addEventListener("load", () => {
            setTimeout(() => window.print(), 200);
          });
        </script>
      </body>
    </html>
  `;
}

function FloatingOrb({
  className = "",
  duration = 10,
  x = 14,
  y = 10
}: {
  className?: string;
  duration?: number;
  x?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ x: [0, x, 0], y: [0, -y, 0], scale: [1, 1.06, 1] }}
      transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    />
  );
}

function LiveDot() {
  return (
    <span className="relative mr-1.5 flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}

function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.22 }} className="h-full">
      <Card className={cn("overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur", className)}>
        {children}
      </Card>
    </motion.div>
  );
}

function CardHeading({
  icon: Icon,
  title,
  description
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="pb-4">
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: -4, scale: 1.04 }}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 shadow-sm"
        >
          <Icon className="h-[18px] w-[18px]" />
        </motion.div>
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-900">{title}</div>
          <div className="mt-1 text-sm leading-6 text-slate-500">{description}</div>
        </div>
      </div>
    </div>
  );
}

function GuideStep({ number, text, delay = 0 }: { number: string; text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, delay }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.10)" }}
      className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/6 px-4 py-3.5 backdrop-blur-sm"
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, delay: delay + 0.2 }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm"
      >
        {number}
      </motion.div>
      <div className="pt-0.5 text-sm leading-6 text-slate-200">{text}</div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  delay = 0
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
      whileHover={{ x: 3 }}
      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </motion.div>
  );
}

function AnimatedNumber({ value, version }: { value: number; version: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start = 0;
    const duration = 900;

    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    setDisplay(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, version]);

  return <span>{display}</span>;
}

function AnimatedBar({
  label,
  value,
  hint,
  delay = 0,
  version
}: {
  label: string;
  value: number;
  hint: string;
  delay?: number;
  version: number;
}) {
  return (
    <motion.div
      key={`${label}-${version}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4"
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-500">{value}/100</span>
      </div>
      <div className="mb-3 text-xs leading-5 text-slate-500">{hint}</div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#334155_100%)]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

function UploadSurface({
  slot,
  title,
  description,
  status,
  onDrop,
  onSelect
}: {
  slot: UploadSlot;
  title: string;
  description: string;
  status: UploadState;
  onDrop: (slot: UploadSlot, event: DragEvent<HTMLLabelElement>) => void;
  onSelect: (slot: UploadSlot, event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputId = useId();

  return (
    <motion.label
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.22 }}
      htmlFor={inputId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(slot, event)}
      className={cn(
        "relative mt-4 block cursor-pointer overflow-hidden rounded-[24px] border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-4",
        status.status === "uploading" && "border-indigo-300 from-indigo-50 to-white",
        status.status === "done" && "border-emerald-200 from-emerald-50 to-white",
        status.status === "error" && "border-rose-200 from-rose-50 to-white"
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        animate={{ x: ["-10%", "430%"] }}
        transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", repeatDelay: 1.6 }}
      />

      <input id={inputId} type="file" className="hidden" onChange={(event) => onSelect(slot, event)} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-900">{title}</div>
          <div className="mt-1 text-sm leading-6 text-slate-500">{description}</div>
          <div className="mt-2 text-xs text-slate-500">当前自动提取支持 PDF / Word / TXT / Markdown；图片与 PPT 作为下一阶段格式扩展。</div>
        </div>
        <Badge className="rounded-full border border-slate-200 bg-white px-3 text-[11px] text-slate-600 shadow-none">
          {status.status === "uploading" ? "提取中" : status.fileName ? "已选文件" : "拖拽上传"}
        </Badge>
      </div>

      <div className="relative mt-4 flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="rounded-2xl bg-slate-100 p-3"
        >
          <Upload className="h-5 w-5 text-slate-700" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900">拖拽或点击上传</div>
          <div className="truncate text-xs text-slate-500">
            {status.message ?? "支持 PDF / DOCX / TXT / Markdown"}
          </div>
        </div>
        <Button variant="secondary" className="rounded-xl border-slate-200 px-4 py-2 text-sm shadow-none">
          上传
        </Button>
      </div>
    </motion.label>
  );
}

function ResultTabButton({
  tab,
  activeTab,
  onClick,
  children
}: {
  tab: ResultTab;
  activeTab: ResultTab;
  onClick: (tab: ResultTab) => void;
  children: ReactNode;
}) {
  const isActive = activeTab === tab;

  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={cn(
        "rounded-[14px] px-3 py-2 text-sm font-medium transition",
        isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
      )}
    >
      {children}
    </button>
  );
}

export function EvaluationWorkspace({
  projectId,
  language,
  initialSchool,
  initialProgramme,
  projectTitle,
  moduleCode
}: {
  projectId: string;
  language: ProjectLanguage;
  initialSchool: string;
  initialProgramme: string;
  projectTitle: string;
  moduleCode: string;
}) {
  const [paperText, setPaperText] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [targetLevel, setTargetLevel] = useState("Master");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("Harvard");
  const [selectedSchool, setSelectedSchool] = useState(initialSchool);
  const [programme, setProgramme] = useState(initialProgramme);
  const [studyRoute, setStudyRoute] = useState<(typeof studyRouteOptions)[number]>("3+1");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paperUploadState, setPaperUploadState] = useState<UploadState>({ status: "idle" });
  const [rubricUploadState, setRubricUploadState] = useState<UploadState>({ status: "idle" });
  const [result, setResult] = useState<{ overallScore: number; jsonReport: EvaluationReportJson } | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("breakdown");
  const [resultsVersion, setResultsVersion] = useState(0);

  const schoolOptions = buildAcademicSchoolOptions(initialSchool);
  const schoolProfile = resolveAcademicSchoolProfile(selectedSchool);
  const wordTotal = useMemo(() => wordCount(paperText), [paperText]);
  const overallScore = result?.overallScore ?? 72;
  const isUploading = paperUploadState.status === "uploading" || rubricUploadState.status === "uploading";
  const canEvaluate = Boolean(paperText.trim() && selectedSchool.trim() && programme.trim()) && !loading && !isUploading;

  const displayedScores = useMemo(() => {
    if (result) {
      return scoreDimensions.map((dimension) => ({
        label: dimension.label,
        hint: dimension.hint,
        value: result.jsonReport.dimensionScores[dimension.key]
      }));
    }

    return [
      { label: "Rubric alignment", hint: "学校要求与 rubric 的贴合度", value: 74 },
      { label: "Assignment fit", hint: "任务回应是否精准", value: 71 },
      { label: "Critical analysis", hint: "分析与批判性深度", value: 69 },
      { label: "Evidence use", hint: "证据、文献和案例运用", value: 76 },
      { label: "Structure & coherence", hint: "结构推进与段落连贯", value: 72 },
      { label: "Referencing", hint: "引用格式与一致性", value: 67 }
    ];
  }, [result]);

  const exportReport = (variant: ExportVariant) => {
    if (!result || typeof window === "undefined") {
      return;
    }

    const popup = window.open("", "_blank", "noopener,noreferrer,width=1100,height=900");

    if (!popup) {
      setErrorMessage("浏览器阻止了弹窗，请允许弹窗后再导出 PDF。");
      return;
    }

    const html = buildPrintableReportHtml({
      variant,
      projectTitle,
      moduleCode,
      schoolName: schoolProfile.name,
      studyRoute,
      overallScore: result.overallScore,
      report: result.jsonReport,
      scores: displayedScores
    });

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  };

  async function uploadAndExtract(slot: UploadSlot, file: File | null) {
    if (!file) {
      return;
    }

    setErrorMessage(null);
    const setState = slot === "paper" ? setPaperUploadState : setRubricUploadState;
    setState({
      status: "uploading",
      fileName: file.name,
      message: "正在上传并提取文本..."
    });

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => null)) as UploadPayload | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "上传失败，请稍后重试。");
      }

      const extractedText = payload?.file?.extractedText?.trim() ?? "";

      if (slot === "paper") {
        setPaperText((current) => extractedText || current);
      } else {
        setRubricText((current) => extractedText || current);
      }

      setState({
        status: "done",
        fileName: payload?.file?.filename ?? file.name,
        message: extractedText ? "文本已提取并同步到当前评估工作台。" : payload?.message ?? "资料已上传到项目知识库。"
      });
    } catch (error) {
      setState({
        status: "error",
        fileName: file.name,
        message: error instanceof Error ? error.message : "上传失败，请稍后重试。"
      });
    }
  }

  function handleDrop(slot: UploadSlot, event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void uploadAndExtract(slot, event.dataTransfer.files?.[0] ?? null);
  }

  function handleSelect(slot: UploadSlot, event: ChangeEvent<HTMLInputElement>) {
    void uploadAndExtract(slot, event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  async function handleSubmit() {
    if (!paperText.trim()) {
      setErrorMessage("请先粘贴论文正文，或上传论文文件后再开始评估。");
      return;
    }

    if (!selectedSchool.trim()) {
      setErrorMessage("请先选择学校。");
      return;
    }

    if (!programme.trim()) {
      setErrorMessage("请先确认 programme 信息。");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          school: schoolProfile.name,
          programme: programme.trim(),
          studyRoute,
          paperText,
          rubricText,
          targetLevel,
          citationStyle,
          language
        })
      });

      const payload = (await response.json().catch(() => null)) as {
        overallScore?: number;
        jsonReport?: EvaluationReportJson;
        error?: string;
      } | null;

      if (!response.ok || !payload?.jsonReport || typeof payload.overallScore !== "number") {
        throw new Error(payload?.error ?? "评估暂时无法完成，请检查输入后重试。");
      }

      setResult({
        overallScore: payload.overallScore,
        jsonReport: payload.jsonReport
      });
      setResultsVersion((previous) => previous + 1);
      setActiveTab("breakdown");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "评估暂时无法完成，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden rounded-[40px] bg-[#f7f8fc] p-1 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_26%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(to_bottom,#fbfbfe,rgba(247,248,252,1))]" />
      <FloatingOrb className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-indigo-200/25 blur-3xl" duration={11} x={20} y={12} />
      <FloatingOrb className="pointer-events-none absolute right-0 top-0 -z-10 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl" duration={13} x={-18} y={14} />
      <FloatingOrb className="pointer-events-none absolute left-1/3 top-1/2 -z-10 h-56 w-56 rounded-full bg-violet-200/15 blur-3xl" duration={15} x={12} y={18} />

      <div className="space-y-6">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0f172a_0%,#111827_50%,#1e293b_100%)] p-7 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:p-8"
          >
            <FloatingOrb className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" duration={9} x={-10} y={8} />
            <FloatingOrb className="pointer-events-none absolute bottom-0 left-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" duration={12} x={10} y={6} />

            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
              <div className="max-w-none">
                <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
                  Academic evaluation workspace
                </div>
                <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.15rem]">
                  先放入论文和学校要求，再生成更清晰、更可信的评估结果
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  这个页面用于把学生论文、学校 rubric、brief 和老师要求整合到同一个工作区中，再在右侧输出有结构的评分结果、问题提示和依据来源。
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["学校匹配", "论文输入", "依据上传", "结果输出"].map((item) => (
                    <div key={item} className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">使用说明</div>
                  <div className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] text-slate-300">4 steps</div>
                </div>

                <div className="mt-4 space-y-3">
                  <GuideStep number="1" text="先选择学校并确认 programme，让系统匹配对应的评分标准。" delay={0.05} />
                  <GuideStep number="2" text="粘贴论文正文，或者直接上传论文文件。" delay={0.12} />
                  <GuideStep number="3" text="上传 rubric、brief 或老师要求，作为评估依据。" delay={0.19} />
                  <GuideStep number="4" text="在右侧查看评分结果、重点问题和依据来源。" delay={0.26} />
                </div>
              </div>
            </div>
          </motion.section>

        <div className="grid items-stretch gap-6 xl:grid-cols-2">
          <SurfaceCard className="h-full">
            <div className="flex h-full min-h-[420px] flex-col p-6">
              <CardHeading
                icon={School}
                title="评估设置"
                description="学校、programme、路径和学历层级会一起决定系统匹配的评估标准。"
              />
              <div className="flex flex-1 flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                    <div className="mb-2 text-sm font-medium text-slate-900">学校</div>
                    <Select value={selectedSchool} onChange={(event) => setSelectedSchool(event.target.value)} className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm">
                      {schoolOptions.map((school) => (
                        <option key={school.id} value={school.name}>
                          {school.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                    <div className="mb-2 text-sm font-medium text-slate-900">Programme</div>
                    <Input
                      value={programme}
                      onChange={(event) => setProgramme(event.target.value)}
                      placeholder="例如 International Business / BUS702"
                      className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                    />
                    <div className="mt-2 text-xs leading-5 text-slate-500">
                      Programme 现在会作为当前项目字段保存，并在评估时与学校、路径和层级一起进入分析上下文。
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                    <div className="mb-2 text-sm font-medium text-slate-900">路径</div>
                    <Select
                      value={studyRoute}
                      onChange={(event) => setStudyRoute(event.target.value as (typeof studyRouteOptions)[number])}
                      className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                    >
                      {studyRouteOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                    <div className="mb-2 text-sm font-medium text-slate-900">学历层级</div>
                    <Select
                      value={targetLevel}
                      onChange={(event) => setTargetLevel(event.target.value)}
                      className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                    >
                      {["Bachelor", "Master", "PhD"].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-600">
                  当前系统会沿用项目的评估语言与引用规则进行分析；programme 会作为当前项目字段参与后续评估与结果生成。
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="h-full">
              <div className="flex h-full min-h-[420px] flex-col p-6">
                <CardHeading
                  icon={ClipboardList}
                  title="学校依据区"
                  description="把 rubric、brief 和课程说明集中在一个更可信的区域里。"
                />
                <div className="flex flex-1 flex-col space-y-4">
                  <div className="rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#f6fffb_100%)] p-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.07, 1] }}
                        transition={{ duration: 2.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        className="rounded-full bg-white p-2 text-emerald-700 shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.div>
                      <div>
                        <div className="flex items-center text-sm font-medium text-emerald-950">
                          <LiveDot />
                          {schoolProfile.name} knowledge base connected
                        </div>
                        <div className="mt-1 text-sm leading-6 text-emerald-900/75">
                          系统会优先调用 rubric、brief 和 module evidence 作为评分解释依据。
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {schoolProfile.focusAreas.slice(0, 3).map((item) => (
                      <div key={item} className="rounded-[20px] border border-slate-200 bg-slate-50 px-3 py-4 text-center text-[11px] font-medium text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>

                  <UploadSurface
                    slot="rubric"
                    title="上传要求文件"
                    description="支持 rubric、brief、老师要求、lecture notes 或 module handbook。"
                    status={rubricUploadState}
                    onDrop={handleDrop}
                    onSelect={handleSelect}
                  />
                </div>
              </div>
          </SurfaceCard>
        </div>

          <SurfaceCard>
            <div className="p-6">
              <CardHeading
                icon={FileText}
                title="论文输入"
                description="正文输入放上面，辅助上传和解析信息放右边，格式保持整齐。"
              />
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_420px]">
                <div className="space-y-3">
                  <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] p-5 shadow-inner">
                    <div className="mb-3 text-sm leading-6 text-slate-500">
                      把学生论文正文粘贴到这里，系统会自动识别结构、统计字数，并进入评估上下文。
                    </div>
                    <Textarea
                      value={paperText}
                      onChange={(event) => setPaperText(event.target.value)}
                      className="min-h-[360px] rounded-[22px] border-slate-200 bg-white p-5 text-sm leading-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus-visible:ring-slate-300"
                      placeholder="把学生论文正文粘贴到这里，系统会自动识别结构、统计字数，并进入评估上下文。"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Dot className="-ml-2 mr-0.5 h-4 w-4" />
                      自动进入学校匹配评估流程
                    </span>
                    <span>{wordTotal} words</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <UploadSurface
                    slot="paper"
                    title="上传论文文件"
                    description="上传后自动提取文本，并同步到当前项目资料库。"
                    status={paperUploadState}
                    onDrop={handleDrop}
                    onSelect={handleSelect}
                  />

                  <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900">解析预期</div>
                      <Badge className="rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 shadow-none">
                        Pipeline
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                      <InfoRow label="正文提取" value={paperUploadState.status === "done" ? "Ready" : "Pending"} delay={0.05} />
                      <InfoRow label="章节识别" value="Enabled" delay={0.1} />
                      <InfoRow label="学校规则匹配" value="Linked" delay={0.15} />
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canEvaluate}
                    className="group h-14 w-full rounded-[24px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-6 text-base font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] hover:opacity-95"
                  >
                    <motion.span
                      animate={loading || isUploading ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 1, repeat: loading || isUploading ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
                      className="mr-2 inline-flex"
                    >
                      <Activity className="h-4 w-4" />
                    </motion.span>
                    {isUploading ? "正在处理上传文件..." : loading ? "正在刷新评估结果..." : "生成学校专属评估"}
                  </Button>

                  {errorMessage ? (
                    <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
                      {errorMessage}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                      <BarChart3 className="h-[18px] w-[18px] text-slate-700" />
                    </div>
                    评估结果
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">右侧结果区改成独立模块，先看总分，再看分项和依据，阅读顺序更清楚。</div>
                </div>
                <motion.div
                  animate={loading ? { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 1, repeat: loading ? Number.POSITIVE_INFINITY : 0 }}
                >
                  <Badge className="rounded-full border border-slate-200 bg-white px-3 text-[11px] text-slate-600 hover:bg-white">
                    {loading ? "Analyzing" : "Live preview"}
                  </Badge>
                </motion.div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <motion.div
                key={resultsVersion}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-5 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
              >
                <motion.div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <BarChart3 className="h-4 w-4" />
                      Overall evaluation
                    </div>
                    <div className="mt-2 flex items-end gap-3">
                      <div className="text-5xl font-semibold tracking-tight">
                        <AnimatedNumber value={overallScore} version={resultsVersion} />
                      </div>
                      <div className="mb-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-slate-200">
                        score / 100
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      {overallScore >= 80 ? "Upper Merit, close to Distinction threshold" : "Solid working draft with clear improvement space"}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-3 text-right text-sm">
                    <div>{schoolProfile.name}</div>
                    <div className="mt-1 text-slate-300">{studyRoute} pathway</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Coverage", value: result ? `${Math.min(98, 82 + result.jsonReport.sourcesUsed.length * 2)}%` : "92%" },
                    { label: "Confidence", value: result ? "High" : "Preview" },
                    { label: "Status", value: loading ? "Updating" : result ? "Ready" : "Draft" }
                  ].map((item) => (
                    <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                      <div className="text-[11px] text-slate-300">{item.label}</div>
                      <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="grid h-12 w-full grid-cols-3 rounded-[18px] border border-slate-200 bg-slate-50 p-1">
                <ResultTabButton tab="breakdown" activeTab={activeTab} onClick={setActiveTab}>
                  Breakdown
                </ResultTabButton>
                <ResultTabButton tab="priorities" activeTab={activeTab} onClick={setActiveTab}>
                  Priorities
                </ResultTabButton>
                <ResultTabButton tab="evidence" activeTab={activeTab} onClick={setActiveTab}>
                  Evidence
                </ResultTabButton>
              </div>

              {activeTab === "breakdown" ? (
                <div className="space-y-3">
                  {displayedScores.map((item, index) => (
                    <AnimatedBar
                      key={`${item.label}-${resultsVersion}`}
                      label={item.label}
                      value={item.value}
                      hint={item.hint}
                      delay={index * 0.08}
                      version={resultsVersion}
                    />
                  ))}
                </div>
              ) : null}

              {activeTab === "priorities" ? (
                <div className="space-y-3">
                  {(result?.jsonReport.priorityImprovements.length
                    ? result.jsonReport.priorityImprovements.map((item, index) => ({
                        title: `优先修改项 ${index + 1}`,
                        detail: item,
                        level: index < 2 ? "高优先级" : "中优先级"
                      }))
                    : previewPriorities
                  ).map((item, index) => (
                    <motion.div
                      key={`${item.title}-${index}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ y: -2 }}
                      className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                          className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </motion.div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium text-slate-900">{item.title}</div>
                            <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-700 shadow-none">
                              {item.level}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : null}

              {activeTab === "evidence" ? (
                <div className="space-y-3">
                  {(result?.jsonReport.sourcesUsed.length
                    ? result.jsonReport.sourcesUsed.map((item) => item.filename)
                    : previewEvidence
                  ).map((item, index) => (
                    <motion.div
                      key={`${item}-${index}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      whileHover={{ x: 3 }}
                      className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2">
                          <BookOpen className="h-4 w-4 text-slate-700" />
                        </div>
                        <div className="truncate text-sm font-medium text-slate-800">{item}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                        Linked
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="p-6">
              <CardHeading
                icon={Download}
                title="报告导出"
                description="评估完成后可以选择 3 种不同层级的报告输出，对应不同内容深度和价格。"
              />
              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {exportVariants.map((variant, index) => (
                  <motion.div
                    key={variant.key}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <motion.div
                      className="absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r from-sky-400 via-violet-500 to-emerald-400"
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.18, ease: "easeInOut" }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                        <Download className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-600 shadow-none">
                          {variant.label}
                        </Badge>
                        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                          {variant.price}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center gap-2">
                        <div className="text-base font-semibold text-slate-950">{variant.title}</div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {variant.tier}
                        </span>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">{variant.description}</div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {[
                        `学校：${schoolProfile.name}`,
                        `路径：${studyRoute}`,
                        result ? `总分：${result.overallScore}/100` : "请先完成一次评估"
                      ].map((item) => (
                        <div key={item} className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-600">
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {variant.highlights.map((item) => (
                        <div
                          key={item}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      disabled={!result}
                      onClick={() => exportReport(variant.key)}
                      className="mt-6 w-full rounded-[18px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] py-3 text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      导出 {variant.title}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="grid items-stretch gap-6 xl:grid-cols-2">
          <SurfaceCard className="h-full">
            <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[30px] border border-amber-200/70 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#fffbeb_100%)] px-6 py-5">
              <motion.div
                className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl"
                animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="max-w-md">
                  <div className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm">
                    1v1 Advisor Support
                  </div>
                  <div className="mt-3 text-base font-semibold tracking-tight text-slate-900">
                    想知道更详细的修改方向？添加顾问 1v1 给你进一步分析
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    除了基础评估结果，还可以进一步针对结构、论证、引用和提分路径给出更具体的修改建议。
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    更细的逐段修改建议
                  </div>
                  <Button className="h-11 rounded-[16px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:opacity-95">
                    添加顾问 1v1
                  </Button>
                </div>
              </div>
            </div>
          </SurfaceCard>

          {result ? (
            <SurfaceCard className="h-full">
              <div className="flex h-full min-h-[320px] flex-col p-6">
                <CardHeading
                  icon={ArrowRight}
                  title="修改清单与证据"
                  description="修改动作、引用提醒和学校资料证据保持在同一页里。"
                />
                <div className="flex flex-1 flex-col space-y-5">
                  <div className="space-y-3">
                    {result.jsonReport.revisionChecklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50/75 px-4 py-4 text-sm leading-7 text-slate-600">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="text-sm font-semibold text-slate-900">引用与规范</div>
                      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                        {result.jsonReport.citationFeedback.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="text-sm font-semibold text-slate-900">语言与学术语气</div>
                      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                        {[...result.jsonReport.grammarStyleNotes, ...result.jsonReport.academicToneNotes].map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <SourceCitationPanel items={result.jsonReport.sourcesUsed} />
                </div>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard className="h-full">
              <div className="flex h-full min-h-[320px] flex-col p-6">
                <CardHeading
                  icon={BookOpen}
                  title="评估摘要"
                  description="把最关键信息压缩成一眼能看懂的三条。"
                />
                <div className="flex flex-1 flex-col justify-between space-y-3">
                  {[
                    "结构已经比较稳定，但批判性分析还需要更直接地回应评分标准。",
                    "引用要更密集地进入分析句，而不是只出现在段落结尾。",
                    "结论如果更贴任务 wording，整体表现会更接近 distinction 区间。"
                  ].map((text, index) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 + 0.1 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      {text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </SurfaceCard>
          )}
        </div>

        {result ? (
          <SurfaceCard>
            <div className="p-6">
              <CardHeading
                icon={BookOpen}
                title="评估摘要"
                description="把这次最重要的判断压缩成一眼能读懂的摘要。"
              />
              <div className="space-y-3">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                  {result.jsonReport.overallSummary}
                </div>
                {result.jsonReport.strengths.slice(0, 2).map((text, index) => (
                  <motion.div
                    key={`${text}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 + 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
                  >
                    {text}
                  </motion.div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        ) : null}
      </div>
    </div>
  );
}
