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
  Wand2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, wordCount } from "@/lib/utils";
import type { BriefAnalysisJson, ProjectLanguage } from "@/types/scholardesk";

const schools = [
  "Bangor University",
  "University of East Anglia",
  "University of Surrey",
  "University of the West of England",
  "Coventry University",
  "Oxford Brookes University"
];

const projects = ["3+1", "2+2", "Top-up", "Foundation", "Direct entry"];
const levels = ["Bachelor", "Master", "PhD"];

const previewSections = {
  assignmentType: "Critical essay",
  expectedStructure: ["Introduction and task framing", "Theory-led discussion", "Critical comparison", "Conclusion linked to wording"],
  keyDeliverables: ["Directly answer the brief wording", "Define the core concepts clearly", "Apply relevant theory rather than only describing", "Use references consistently throughout paragraphs"],
  markingPriorities: ["Task response", "Critical analysis", "Use of evidence", "Academic structure"],
  likelyPitfalls: ["Too descriptive", "Weak linkage to rubric", "Theory mentioned but not applied", "Conclusion too general"],
  recommendedOutline: ["Brief introduction", "Context and definitions", "Main analytical section 1", "Main analytical section 2", "Comparison and critique", "Conclusion"],
  suggestedResearchQuestions: [
    "What core issue is the assignment actually asking you to evaluate?",
    "Which theory best explains the case or scenario in the brief?",
    "Where can stronger comparison or critique be introduced?"
  ]
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
  options: string[];
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
        <Select value={value} onChange={(event) => onChange(event.target.value)} className="h-16 rounded-2xl border-slate-200 bg-slate-50 px-5 pr-12 text-lg font-medium text-slate-900 shadow-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200">
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
        className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100", accent)}
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

function OutputPanel({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function BriefAnalyzerForm({ language }: { language: ProjectLanguage }) {
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("Bangor University");
  const [selectedProject, setSelectedProject] = useState("3+1");
  const [selectedLevel, setSelectedLevel] = useState(language === "en" ? "Bachelor" : "Bachelor");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<BriefAnalysisJson | null>(null);

  const promptWordCount = useMemo(() => wordCount(assignmentPrompt), [assignmentPrompt]);
  const currentResult = result ?? previewSections;

  async function analyze() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentPrompt, rubricText, language })
      });

      const payload = (await response.json().catch(() => null)) as BriefAnalysisJson & { error?: string } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "分析暂时无法完成，请稍后重试。");
      }

      setResult(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "分析暂时无法完成，请稍后重试。");
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
      <FloatingOrb className="pointer-events-none absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-100/25 blur-3xl" duration={7} x={10} y={8} />

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
          <div className="text-sm font-medium text-slate-500">School-aware brief analyzer</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">先选学校，再按学校要求分析作业 brief。</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            这块工作台会先结合学校、项目和层级，再读取学生当前输入的 assignment prompt 与 rubric，输出作业类型、结构要求、评分重点、常见风险和建议研究方向。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[selectedSchool, selectedProject, selectedLevel].map((item, index) => (
              <motion.div key={item} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.05 }}>
                <Badge className="rounded-full px-3 py-1 shadow-none">{item}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SurfaceCard>
              <div className="p-6">
                <SectionHeading
                  icon={ShieldCheck}
                  eyebrow="Automatic matching"
                  title="1. 已自动匹配学校要求"
                  description="系统会先根据学校、项目和层级设定当前示例生成标准。"
                />
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <SettingField label="学校" value={selectedSchool} onChange={setSelectedSchool} options={schools} />
                    <SettingField label="项目" value={selectedProject} onChange={setSelectedProject} options={projects} />
                    <SettingField label="层级" value={selectedLevel} onChange={setSelectedLevel} options={levels} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { title: "作业类型", icon: FileText, accent: "from-sky-500/20 to-cyan-500/10" },
                      { title: "评分重点", icon: Target, accent: "from-violet-500/20 to-fuchsia-500/10" },
                      { title: "学术规范", icon: BookOpen, accent: "from-emerald-500/20 to-teal-500/10" }
                    ].map((item, index) => (
                      <MatchCard key={item.title} title={item.title} icon={item.icon} accent={item.accent} delay={0.1 + index * 0.06} />
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
                  title="2. 输入作业要求与 rubric"
                  description="支持直接粘贴 assignment prompt 和评分要求，用更清楚的工作台方式来做分析。"
                />
                <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <motion.div whileHover={{ y: -2 }} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Assignment prompt</span>
                      <span className="text-xs text-slate-500">{promptWordCount} words</span>
                    </div>
                    <Textarea
                      value={assignmentPrompt}
                      onChange={(event) => setAssignmentPrompt(event.target.value)}
                      className="min-h-[280px] resize-none rounded-[24px] border-0 bg-white p-5 text-sm leading-7 shadow-none focus-visible:ring-1"
                      placeholder="粘贴作业题目、任务说明或老师给的 brief。"
                    />
                  </motion.div>

                  <div className="space-y-4">
                    <motion.div whileHover={{ y: -2 }} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-medium text-slate-700">Rubric / grading criteria</div>
                      <Textarea
                        value={rubricText}
                        onChange={(event) => setRubricText(event.target.value)}
                        className="min-h-[170px] resize-none rounded-[24px] border-0 bg-white p-5 text-sm leading-7 shadow-none focus-visible:ring-1"
                        placeholder="粘贴学校 rubric、评分标准、老师反馈重点或 marking criteria。"
                      />
                    </motion.div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-700">分析预期</div>
                        <Badge className="rounded-full border border-slate-200 bg-white text-[11px] text-slate-600 shadow-none">Brief engine</Badge>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {[
                          "识别作业类型和真实 deliverables",
                          "拆出评分重点和常见风险点",
                          "生成推荐结构与研究问题"
                        ].map((item) => (
                          <div key={item} className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={analyze} disabled={loading || !assignmentPrompt.trim()} className="w-full rounded-[22px]">
                      {loading ? "Analyzing brief..." : "生成学校专属分析"}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
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
          </div>

          <SurfaceCard className="xl:sticky xl:top-6">
            <div className="relative overflow-hidden p-6">
              <motion.div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-start">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
                  >
                    <Wand2 className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Analysis output</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">3. 分析结果</div>
                    <div className="text-sm leading-6 text-slate-600">根据当前输入内容，展示作业类型、结构要求、重点、风险和建议研究问题。</div>
                  </div>
                </div>
                <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 shadow-none">
                  {result ? "Live result" : "Preview mode"}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-5 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-300">Assignment type</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">{currentResult.assignmentType}</div>
                      <div className="mt-2 text-sm text-slate-300">{selectedSchool} · {selectedProject} · {selectedLevel}</div>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-3 text-right text-sm">
                      <div>{currentResult.keyDeliverables.length} deliverables</div>
                      <div className="mt-1 text-slate-300">{currentResult.markingPriorities.length} marking signals</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { label: "Structure", value: `${currentResult.expectedStructure.length} steps` },
                      { label: "Pitfalls", value: `${currentResult.likelyPitfalls.length} risks` },
                      { label: "Questions", value: `${currentResult.suggestedResearchQuestions.length} prompts` }
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                        <div className="text-[11px] text-slate-300">{item.label}</div>
                        <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <OutputPanel title="Expected structure" items={currentResult.expectedStructure} />
                  <OutputPanel title="Key deliverables" items={currentResult.keyDeliverables} />
                  <OutputPanel title="Marking priorities" items={currentResult.markingPriorities} />
                  <OutputPanel title="Likely pitfalls" items={currentResult.likelyPitfalls} />
                  <OutputPanel title="Recommended outline" items={currentResult.recommendedOutline} />
                  <OutputPanel title="Suggested research questions" items={currentResult.suggestedResearchQuestions} />
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
