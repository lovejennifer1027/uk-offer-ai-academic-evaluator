"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  FileText,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wand2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BriefAnalysisJson, ProjectLanguage } from "@/types/scholardesk";
import { cn, wordCount } from "@/lib/utils";

const schools = [
  "Bangor University",
  "University of East Anglia",
  "University of Surrey",
  "University of the West of England",
  "Coventry University",
  "Oxford Brookes University"
];

const projects = ["3+1", "Top-up", "Foundation", "Pre-master", "Standard"];
const levels = ["Bachelor", "Master", "PhD"];

const requirementCards = [
  { title: "作业类型", icon: FileText, accent: "from-sky-500/20 to-cyan-500/10" },
  { title: "评分重点", icon: Target, accent: "from-violet-500/20 to-fuchsia-500/10" },
  { title: "学术规范", icon: BookOpen, accent: "from-emerald-500/20 to-teal-500/10" }
] as const;

type ScoreBand = "50+" | "60+" | "70+";
type SavedBriefAnalysis = BriefAnalysisJson & {
  id?: string;
  createdAt?: string;
};

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

function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.22 }} className="h-full">
      <Card
        className={cn(
          "overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur",
          className
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <motion.div
        whileHover={{ rotate: -4, scale: 1.04 }}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm"
      >
        <Icon className="h-5 w-5" />
      </motion.div>
      <div>
        <div className="text-sm font-medium text-slate-500">{eyebrow}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
      </div>
    </div>
  );
}

function SettingField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="mb-3 text-sm font-medium text-slate-500">{label}</div>
      <div className="relative">
        <Select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-16 rounded-2xl border-slate-200 bg-slate-50 px-5 pr-12 text-lg font-medium text-slate-900 shadow-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
      </div>
    </motion.div>
  );
}

function MatchCard({
  title,
  icon: Icon,
  accent,
  delay
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100",
          accent
        )}
      />
      <motion.div
        className="absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-slate-300 to-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-white group-hover:shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          <motion.span
            className="h-2 w-2 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.45, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay }}
          />
          Auto matched
        </div>
      </div>

      <div className="relative mt-7 flex items-end justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">Live rule sync</div>
        </div>
        <motion.div
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay }}
          className="rounded-full bg-slate-100 p-2 text-slate-500"
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function ScoreTabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: ScoreBand;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-semibold transition",
        active
          ? "bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
          : "text-slate-500 hover:text-slate-800"
      )}
    >
      {label}
    </button>
  );
}

function buildExamples({
  school,
  project,
  level,
  prompt
}: {
  school: string;
  project: string;
  level: string;
  prompt: string;
}): Record<ScoreBand, string> {
  const topic =
    prompt.trim().slice(0, 120) || "the assignment topic provided by the student";
  const schoolLabel = `${school} · ${project} · ${level}`;

  return {
    "50+": `At ${schoolLabel}, a basic passing response would usually identify the core theme of "${topic}" and explain it in a mostly descriptive way. The discussion may mention one or two relevant ideas, but it would often stay at the level of summary rather than sustained analysis. A student writing at this level would normally show awareness of the task, yet the argument may remain loose, the connection to theory may be brief, and the critical depth would still feel limited.`,
    "60+": `For ${schoolLabel}, a solid mid-band response should move beyond description and begin to organise "${topic}" into a clearer academic argument. The writing would normally define the issue, introduce a relevant theoretical frame, and show why the topic matters in relation to the task wording. At this level, the structure is more controlled, topic sentences are clearer, and references are used to support interpretation rather than only to decorate the paragraph.`,
    "70+": `A stronger high-band example for ${schoolLabel} would treat "${topic}" as an issue that requires judgement, comparison, and theory-led explanation. Rather than simply describing the brief, the response would frame the debate, apply concepts with purpose, and evaluate competing interpretations in relation to the assignment objective. This level of writing would usually feel more deliberate, with tighter paragraph control, stronger transitions, and more explicit linkage between evidence, argument, and the marking expectations of the school.`
  };
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AnalyzeBriefWorkspace({
  projectId,
  language,
  initialSchool = "Bangor University",
  initialAnalysis,
  initialAnalysisCreatedAt
}: {
  projectId: string;
  language: ProjectLanguage;
  initialSchool?: string;
  initialAnalysis?: BriefAnalysisJson | null;
  initialAnalysisCreatedAt?: string | null;
}) {
  const [selectedSchool, setSelectedSchool] = useState(initialSchool);
  const [selectedProject, setSelectedProject] = useState("3+1");
  const [selectedLevel, setSelectedLevel] = useState("Bachelor");
  const [assignmentPrompt, setAssignmentPrompt] = useState(
    "我想写社交媒体营销如何影响大学生的购买意愿。目前我想到两个方向：一个是折扣活动带来的即时刺激，另一个是博主推荐带来的信任感。但我不确定理论怎么接，也担心整篇文章会比较描述性。"
  );
  const [rubricText, setRubricText] = useState(
    "Discuss the factors influencing student purchasing intention. Demonstrate application of theory, use academic sources, and maintain critical analysis throughout."
  );
  const [activeBand, setActiveBand] = useState<ScoreBand>("70+");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(
    initialAnalysisCreatedAt ? `Latest brief analysis saved ${formatTimestamp(initialAnalysisCreatedAt)}.` : null
  );
  const [savedAnalysis, setSavedAnalysis] = useState<SavedBriefAnalysis | null>(
    initialAnalysis
      ? {
          ...initialAnalysis,
          createdAt: initialAnalysisCreatedAt ?? undefined
        }
      : null
  );

  const promptWordCount = useMemo(() => wordCount(assignmentPrompt), [assignmentPrompt]);
  const examples = useMemo(
    () =>
      buildExamples({
        school: selectedSchool,
        project: selectedProject,
        level: selectedLevel,
        prompt: assignmentPrompt
      }),
    [assignmentPrompt, selectedLevel, selectedProject, selectedSchool]
  );

  async function handleGenerate() {
    if (assignmentPrompt.trim().length < 10) {
      setErrorMessage("Please add a fuller assignment prompt before running Brief analysis.");
      setSavedMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/analyze-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          assignmentPrompt,
          rubricText,
          language
        })
      });

      const payload = (await response.json().catch(() => null)) as (SavedBriefAnalysis & { error?: string }) | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "Brief analysis failed.");
      }

      setSavedAnalysis(payload);
      setSavedMessage(`Latest brief analysis saved ${payload.createdAt ? formatTimestamp(payload.createdAt) : "successfully"}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Brief analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden rounded-[40px] bg-slate-50 p-1 text-slate-900">
      <motion.div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-200/25 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <FloatingOrb
        className="pointer-events-none absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-100/25 blur-3xl"
        duration={7}
        x={10}
        y={8}
      />

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-violet-500 to-emerald-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <div className="text-sm font-medium text-slate-500">School-aware example engine</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            先选学校，再按学校要求生成不同层次的写作范本。
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            这块工作台会先结合学校、项目和层级，再读取学生当前输入内容，输出 50+、60+、70+ 的示例内容，帮助学生更清楚地理解结构、表达和写作方向。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[selectedSchool, selectedProject, selectedLevel].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.05 }}
              >
                <Badge className="rounded-full px-3 py-1 shadow-none">{item}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mx-auto max-w-6xl space-y-6">
          <SurfaceCard>
            <div className="p-6">
              <SectionHeading
                icon={ShieldCheck}
                eyebrow="Automatic matching"
                title="1. 已自动匹配学校要求"
                description="系统会先根据学校、项目和层级设定当前示例生成标准。"
              />

              <div className="mt-6 space-y-4">
                <div className="grid gap-4">
                  <SettingField label="学校" value={selectedSchool} onChange={setSelectedSchool} options={schools} />
                  <SettingField label="项目" value={selectedProject} onChange={setSelectedProject} options={projects} />
                  <SettingField label="层级" value={selectedLevel} onChange={setSelectedLevel} options={levels} />
                </div>

                <div className="grid gap-4">
                  {requirementCards.map((item, index) => (
                    <MatchCard
                      key={item.title}
                      title={item.title}
                      icon={item.icon}
                      accent={item.accent}
                      delay={0.1 + index * 0.06}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="p-6">
              <SectionHeading
                icon={Lightbulb}
                eyebrow="Student input"
                title="2. 输入作业要求与 rubric / 学生思路"
                description="保留输入区和上传区，让学生可以把 prompt、评分标准和自己的想法放进同一个工作区。"
              />

              <div className="mt-8 space-y-6">
                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-[32px] border border-slate-200 bg-slate-50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">论文内容</span>
                      <span className="text-xs text-slate-500">{promptWordCount} words</span>
                    </div>
                    <Textarea
                      value={assignmentPrompt}
                      onChange={(event) => setAssignmentPrompt(event.target.value)}
                      className="min-h-[360px] resize-none rounded-[28px] border-0 bg-white p-6 text-base leading-8 shadow-none focus-visible:ring-1"
                      placeholder="粘贴 assignment prompt、老师要求，或者先写学生自己的想法。"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="group relative overflow-hidden rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-8 py-10"
                  >
                    <motion.div
                      className="absolute inset-x-10 top-0 h-2 rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />

                    <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_18px_30px_rgba(15,23,42,0.08)]">
                        <Upload className="h-10 w-10" />
                      </div>
                      <div className="mt-8 text-3xl font-semibold tracking-tight text-slate-900">上传学生文件</div>
                      <div className="mt-4 max-w-sm text-lg leading-9 text-slate-600">
                        支持草稿、老师反馈、课堂笔记和作业要求文件。
                      </div>
                      <Button type="button" className="mt-10 rounded-[22px] bg-slate-900 px-10 py-4 text-lg text-white hover:bg-slate-800">
                        拖拽或选择
                      </Button>
                    </div>
                  </motion.div>
                </div>

                <motion.div whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">Rubric / grading criteria</div>
                    <Badge className="rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 shadow-none">
                      School rubric
                    </Badge>
                  </div>
                  <Textarea
                    value={rubricText}
                    onChange={(event) => setRubricText(event.target.value)}
                    className="min-h-[180px] resize-none rounded-[24px] border-0 bg-white p-5 text-sm leading-7 shadow-none focus-visible:ring-1"
                    placeholder="粘贴学校 rubric、评分标准、老师反馈重点或 grading criteria。"
                  />
                </motion.div>

                <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">这页会输出什么</div>
                    <Badge className="rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 shadow-none">
                      Example engine
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {[
                      "根据学校、项目和层级匹配写作口径",
                      "按 50+ / 60+ / 70+ 三档展示范本",
                      "帮助学生看清结构、表达和分析深度差异"
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="relative overflow-hidden p-6">
              <motion.div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
                  >
                    <Wand2 className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Example output</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">3. 示例内容</div>
                    <div className="text-sm leading-6 text-slate-600">
                      根据当前学校、项目和层级展示 50+、60+、70+ 不同层次的学校专属写作范本。
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800 sm:w-auto"
                >
                  {loading ? "保存分析中..." : "保存当前项目 Brief 分析"}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {errorMessage ? (
                <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {savedAnalysis ? (
                <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-500">Latest saved brief analysis</div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">{savedAnalysis.assignmentType}</div>
                    </div>
                    {savedAnalysis.createdAt ? (
                      <Badge className="rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 shadow-none">
                        Saved {formatTimestamp(savedAnalysis.createdAt)}
                      </Badge>
                    ) : null}
                  </div>
                  {savedMessage ? <div className="mt-3 text-sm leading-6 text-slate-600">{savedMessage}</div> : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Marking priorities</div>
                      <div className="mt-2 text-sm leading-6 text-slate-700">
                        {savedAnalysis.markingPriorities.slice(0, 3).join(" · ")}
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Recommended outline</div>
                      <div className="mt-2 text-sm leading-6 text-slate-700">
                        {savedAnalysis.recommendedOutline.slice(0, 3).join(" · ")}
                      </div>
                    </div>
                  </div>
                  {savedAnalysis.id ? (
                    <div className="mt-4">
                      <a
                        href={`/dashboard/projects/${projectId}/briefs/${savedAnalysis.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
                      >
                        View full brief analysis
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-100/80 p-1">
                <div className="grid grid-cols-3 gap-1">
                  {(["50+", "60+", "70+"] as ScoreBand[]).map((band) => (
                    <ScoreTabButton
                      key={band}
                      active={activeBand === band}
                      label={band}
                      onClick={() => setActiveBand(band)}
                    />
                  ))}
                </div>
              </div>

              <motion.div
                key={`${activeBand}-${selectedSchool}-${selectedProject}-${selectedLevel}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className="mt-4 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5"
              >
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full bg-slate-900 text-white shadow-none">{activeBand}</Badge>
                  <span className="text-xs text-slate-500">
                    学校专属写作范本 · {selectedSchool} · {selectedProject} · {selectedLevel}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">{examples[activeBand]}</p>
              </motion.div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
