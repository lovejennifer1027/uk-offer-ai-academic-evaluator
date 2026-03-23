"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useId, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  Sparkles,
  UploadCloud
} from "lucide-react";

import { buildAcademicSchoolOptions, resolveAcademicSchoolProfile } from "@/config/academic-schools";
import { SourceCitationPanel } from "@/components/dashboard/source-citation-panel";
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

type UploadSlot = "paper" | "rubric";

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

function dimensionTone(score: number) {
  if (score >= 80) return "优秀";
  if (score >= 70) return "较强";
  if (score >= 60) return "合格";
  return "需加强";
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
    <label
      htmlFor={inputId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(slot, event)}
      className={cn(
        "group mt-4 flex cursor-pointer items-center gap-4 rounded-[24px] border border-dashed border-slate-200 bg-white/80 px-5 py-4 transition",
        status.status === "uploading" && "border-indigo-300 bg-indigo-50/70",
        status.status === "done" && "border-emerald-200 bg-emerald-50/60",
        status.status === "error" && "border-rose-200 bg-rose-50/60"
      )}
    >
      <input id={inputId} type="file" className="hidden" onChange={(event) => onSelect(slot, event)} />
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
        <UploadCloud className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-500">{description}</div>
        <div className="mt-2 text-xs leading-6 text-slate-500">
          当前自动提取支持 PDF / Word / TXT / Markdown；图片与 PPT 已纳入下一阶段资料格式扩展。
        </div>
        {status.message ? (
          <div
            className={cn(
              "mt-2 text-xs font-medium",
              status.status === "error" ? "text-rose-600" : "text-slate-600"
            )}
          >
            {status.message}
          </div>
        ) : null}
      </div>
      <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition group-hover:border-slate-300">
        {status.status === "uploading" ? "提取中..." : status.fileName ? status.fileName : "拖拽或选择"}
      </div>
    </label>
  );
}

export function EvaluationWorkspace({
  projectId,
  language,
  initialSchool,
  projectTitle,
  moduleCode
}: {
  projectId: string;
  language: ProjectLanguage;
  initialSchool: string;
  projectTitle: string;
  moduleCode: string;
}) {
  const [paperText, setPaperText] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [targetLevel, setTargetLevel] = useState("Master's");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("Harvard");
  const [selectedSchool, setSelectedSchool] = useState(initialSchool);
  const [studyRoute, setStudyRoute] = useState<(typeof studyRouteOptions)[number]>("Direct entry");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paperUploadState, setPaperUploadState] = useState<UploadState>({ status: "idle" });
  const [rubricUploadState, setRubricUploadState] = useState<UploadState>({ status: "idle" });
  const [result, setResult] = useState<{ overallScore: number; jsonReport: EvaluationReportJson } | null>(null);

  const schoolOptions = buildAcademicSchoolOptions(initialSchool);
  const schoolProfile = resolveAcademicSchoolProfile(selectedSchool);
  const overallScore = result?.overallScore ?? 0;

  async function uploadAndExtract(slot: UploadSlot, file: File | null) {
    if (!file) {
      return;
    }

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
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          school: schoolProfile.name,
          studyRoute,
          paperText,
          rubricText,
          targetLevel,
          citationStyle,
          language
        })
      });

      const payload = (await response.json()) as { overallScore?: number; jsonReport?: EvaluationReportJson; error?: string };

      if (!response.ok || !payload.jsonReport || typeof payload.overallScore !== "number") {
        throw new Error(payload.error ?? "评估暂时无法完成，请检查输入后重试。");
      }

      setResult({
        overallScore: payload.overallScore,
        jsonReport: payload.jsonReport
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "评估暂时无法完成，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <div className="space-y-6">
        <Card className="hero-shell overflow-hidden rounded-[36px] p-0">
          <div className="px-7 py-7 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="eyebrow-pill text-xs font-semibold">School-aware evaluation engine</div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950">先选学校，再按学校要求做一份清楚的评估报告。</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  这块工作台会先调取学校资料，再结合学生论文与评估要求，输出总分、分项评分、优先修改项和证据来源。
                </p>
              </div>
              <div className="quiet-badge flex items-center gap-2 px-4 py-2 text-xs font-semibold">
                <Database className="h-4 w-4" />
                {schoolProfile.shortName} knowledge-first
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700">{projectTitle}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span>{moduleCode}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-[24px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_12px_26px_rgba(67,84,120,0.05)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">学校</div>
                <Select
                  value={selectedSchool}
                  onChange={(event) => setSelectedSchool(event.target.value)}
                  className="mt-3 rounded-[18px] border-white bg-white"
                >
                  {schoolOptions.map((school) => (
                    <option key={school.id} value={school.name}>
                      {school.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_12px_26px_rgba(67,84,120,0.05)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">路径</div>
                <Select
                  value={studyRoute}
                  onChange={(event) => setStudyRoute(event.target.value as (typeof studyRouteOptions)[number])}
                  className="mt-3 rounded-[18px] border-white bg-white"
                >
                  {studyRouteOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
              <div className="rounded-[22px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_10px_24px_rgba(67,84,120,0.04)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">评估语言</div>
                <div className="mt-3 text-sm font-semibold text-slate-900">
                  {language === "zh" ? "中文" : language === "bilingual" ? "中英双语" : "English"}
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_10px_24px_rgba(67,84,120,0.04)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">目标层级</div>
                <Input
                  value={targetLevel}
                  onChange={(event) => setTargetLevel(event.target.value)}
                  className="mt-3 rounded-[18px] border-white bg-white"
                />
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_10px_24px_rgba(67,84,120,0.04)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">引用格式</div>
                <Select
                  value={citationStyle}
                  onChange={(event) => setCitationStyle(event.target.value as CitationStyle)}
                  className="mt-3 rounded-[18px] border-white bg-white"
                >
                  {citationStyleOptions.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/78 px-4 py-4 text-sm leading-7 text-slate-600">
              {schoolProfile.supportNote}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] border border-slate-100 bg-white/76 p-0 shadow-[0_18px_42px_rgba(67,84,120,0.05)]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">论文内容</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      粘贴学生论文正文，或直接把论文文件拖进来。上传后会自动提取文本，并同步到当前评估。
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                    {wordCount(paperText)} words
                  </div>
                </div>
                <div className="px-6 py-6">
                  <Textarea
                    value={paperText}
                    onChange={(event) => setPaperText(event.target.value)}
                    className="min-h-[330px] rounded-[24px] border-white bg-white/90 px-5 py-4 text-sm leading-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                    placeholder="把学生论文正文粘贴到这里，或把 PDF / Word / TXT / Markdown 文件拖进下方上传区。"
                  />
                  <UploadSurface
                    slot="paper"
                    title="上传论文文件"
                    description="支持把论文草稿直接拖入。上传后会自动提取文本，并把这份文件存进项目资料库。"
                    status={paperUploadState}
                    onDrop={handleDrop}
                    onSelect={handleSelect}
                  />
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-100 bg-white/76 p-0 shadow-[0_18px_42px_rgba(67,84,120,0.05)]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">学校要求与评分标准</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      上传 brief、rubric、老师要求或课程说明。系统会优先把这些学校资料作为评估依据。
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                    {schoolProfile.shortName}
                  </div>
                </div>
                <div className="px-6 py-6">
                  <Textarea
                    value={rubricText}
                    onChange={(event) => setRubricText(event.target.value)}
                    className="min-h-[250px] rounded-[24px] border-white bg-white/90 px-5 py-4 text-sm leading-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                    placeholder="把 rubric、assignment brief、老师评估要求或课程重点粘贴到这里。"
                  />
                  <UploadSurface
                    slot="rubric"
                    title="上传要求文件"
                    description="把学校评估要求、brief、rubric 或讲义拖进来，让系统优先按照学校标准来拆分评分。"
                    status={rubricUploadState}
                    onDrop={handleDrop}
                    onSelect={handleSelect}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {schoolProfile.focusAreas.map((area) => (
                      <div key={area} className="quiet-badge px-3 py-2 text-xs font-semibold">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div className="text-sm leading-7 text-slate-500">
                输出会按学校要求拆解总分和各部分评分，并给出优先修改建议与证据来源。
              </div>
              <Button
                className="min-w-[220px]"
                onClick={handleSubmit}
                disabled={loading || !paperText.trim() || !selectedSchool.trim()}
              >
                {loading ? "正在生成评估报告..." : "生成学校专属评估"}
              </Button>
            </div>
          </div>
        </Card>

        {errorMessage ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <Card className="dark-panel rounded-[36px] overflow-hidden p-0 text-white">
          <div className="border-b border-white/10 px-7 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="eyebrow-pill border-white/10 bg-white/8 text-[11px] font-semibold text-white/80 shadow-none">
                  Evaluation output
                </div>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">右侧只看结果，不再混输入控件。</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                  总分、分项评分、解释、优先修改项和证据来源都集中在这一侧，方便学生直接阅读与导出。
                </p>
              </div>
              <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold text-white/80">
                {schoolProfile.shortName} evaluation mode
              </div>
            </div>
          </div>

          {result ? (
            <div className="space-y-6 px-7 py-7">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                  <div
                    className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#b8c5ff ${overallScore * 3.6}deg, rgba(255,255,255,0.12) 0deg)`
                    }}
                  >
                    <div className="flex h-[122px] w-[122px] flex-col items-center justify-center rounded-full bg-[rgba(23,34,55,0.9)]">
                      <div className="text-4xl font-semibold tracking-[-0.05em] text-white">{overallScore}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">overall</div>
                    </div>
                  </div>
                  <div className="mt-5 text-center">
                    <div className="text-sm font-semibold text-white">{schoolProfile.name}</div>
                    <div className="mt-2 text-sm leading-6 text-white/65">按学校资料与上传 rubric 综合评估后的参考得分。</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4" />
                    评分拆解
                  </div>
                  <div className="mt-5 space-y-4">
                    {scoreDimensions.map((dimension) => {
                      const score = result.jsonReport.dimensionScores[dimension.key];

                      return (
                        <div key={dimension.key} className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold text-white">{dimension.label}</div>
                              <div className="mt-1 text-xs leading-5 text-white/55">{dimension.hint}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-semibold text-white">{score}</div>
                              <div className="text-xs text-white/55">{dimensionTone(score)}</div>
                            </div>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(197,209,255,0.92),rgba(147,171,255,0.92))]"
                              style={{ width: `${Math.max(6, score)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BookOpen className="h-4 w-4" />
                  总评摘要
                </div>
                <p className="mt-4 text-sm leading-7 text-white/74">{result.jsonReport.overallSummary}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 px-7 py-7">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "学校资料", value: "已接入", icon: Database },
                  { label: "评估方式", value: "Rubric-first", icon: FileText },
                  { label: "输出形式", value: "可视化报告", icon: Sparkles }
                ].map((item) => (
                  <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/8 px-5 py-5">
                    <item.icon className="h-5 w-5 text-white/70" />
                    <div className="mt-4 text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-[30px] border border-dashed border-white/14 bg-white/6 px-6 py-8">
                <div className="text-2xl font-semibold tracking-[-0.05em] text-white">这里会生成学校专属评估结果。</div>
                <div className="mt-3 max-w-xl text-sm leading-7 text-white/68">
                  生成后，右侧会显示总分、分项评分、每部分解释、优先修改建议，以及本次评估引用到的学校资料证据。
                </div>
                <div className="mt-6 grid gap-3">
                  {[
                    "先选择学校，再让系统调用对应知识库。",
                    "上传论文和要求文件后，文本会自动进入评估工作台。",
                    "结果侧专门用于阅读报告，不再放输入控件。"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[20px] bg-white/7 px-4 py-3 text-sm text-white/74">
                      <CheckCircle2 className="h-4 w-4 text-white/68" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {result ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-[34px]">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-slate-500" />
                  做得好的部分
                </div>
                <div className="mt-5 space-y-3">
                  {result.jsonReport.strengths.map((item) => (
                    <div key={item} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[34px]">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  优先修改项
                </div>
                <div className="mt-5 space-y-3">
                  {result.jsonReport.priorityImprovements.map((item) => (
                    <div key={item} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="rounded-[34px]">
              <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    修改清单
                  </div>
                  <div className="mt-5 space-y-3">
                    {result.jsonReport.revisionChecklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50/75 px-4 py-4 text-sm leading-7 text-slate-600">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
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
              </div>
            </Card>

            <SourceCitationPanel items={result.jsonReport.sourcesUsed} />
          </>
        ) : null}
      </div>
    </div>
  );
}
