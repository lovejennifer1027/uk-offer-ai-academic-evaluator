"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { RUBRIC_PRESETS, DEFAULT_RUBRIC_KEY } from "@/config/rubrics";
import { ACCEPTED_UPLOAD_EXTENSIONS, MAX_UPLOAD_BYTES, MAX_UPLOAD_SIZE_LABEL } from "@/lib/constants";
import { saveSubmissionToLocalHistory } from "@/lib/browser-history";
import { UploadPanel } from "@/components/upload-panel";
import type { EvaluationApiResponse } from "@/lib/types";

function validateSelectedFile(file: File | null) {
  if (!file) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ACCEPTED_UPLOAD_EXTENSIONS.includes(extension as (typeof ACCEPTED_UPLOAD_EXTENSIONS)[number])) {
    return `不支持的文件类型：“${file.name}”。请仅上传 PDF、DOCX 或 TXT 文件。`;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `“${file.name}” 超过 ${MAX_UPLOAD_SIZE_LABEL}，请上传更小的文件。`;
  }

  return null;
}

export function SubmissionForm() {
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [essayTitle, setEssayTitle] = useState("");
  const [essayText, setEssayText] = useState("");
  const [briefText, setBriefText] = useState("");
  const [rubricKey, setRubricKey] = useState(DEFAULT_RUBRIC_KEY);
  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = submitting || navigating;
  const selectedRubric = RUBRIC_PRESETS.find((preset) => preset.key === rubricKey) ?? RUBRIC_PRESETS[0];

  function handleFileSelection(kind: "essay" | "brief", file: File | null) {
    const validationMessage = validateSelectedFile(file);

    if (validationMessage) {
      setError(validationMessage);

      if (kind === "essay") {
        setEssayFile(null);
      } else {
        setBriefFile(null);
      }

      return;
    }

    setError(null);

    if (kind === "essay") {
      setEssayFile(file);
      return;
    }

    setBriefFile(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!essayText.trim() && !essayFile) {
      setError("请先粘贴论文内容，或上传论文文件后再开始评估。");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("essayTitle", essayTitle);
      formData.append("essayText", essayText);
      formData.append("briefText", briefText);
      formData.append("rubricKey", rubricKey);

      if (essayFile) {
        formData.append("essayFile", essayFile);
      }

      if (briefFile) {
        formData.append("briefFile", briefFile);
      }

      const response = await fetch("/api/evaluate", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => null)) as
        | (EvaluationApiResponse & { error?: string })
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("submission" in payload)) {
        throw new Error(payload?.error ?? "评估暂时无法完成，请稍后重试。");
      }

      saveSubmissionToLocalHistory(payload.submission);
      startTransition(() => {
        router.push(`/results/${payload.submission.id}`);
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "提交过程中发生了异常，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1.14fr)_360px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="story-shell relative overflow-hidden rounded-[38px] p-7 md:p-9">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(160,189,229,0.16),transparent)]" />
          <div className="relative">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">提交配置</p>
                <h2 className="mt-4 text-2xl text-[var(--navy)] md:text-3xl">先确认标题和评分模板</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  这里决定报告标题和默认评估框架。若你同时提交老师要求，系统会在模型层优先参考老师标准。
                </p>
              </div>

              <div className="section-panel rounded-[28px] px-5 py-4 text-sm leading-7 text-[var(--muted)]">
                建议在标题中写清课程或论文主题，这样历史记录页面会更整齐，也更适合后续回看和对外展示。这个区域更像评估单抬头，先把基本设置定清楚，后面整页读起来会更顺。
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-[1fr_0.72fr]">
              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">论文标题</span>
                <input
                  value={essayTitle}
                  onChange={(event) => {
                    setEssayTitle(event.target.value);
                    setError(null);
                  }}
                  name="essayTitle"
                  placeholder="例如：英国可持续金融监管的批判性分析"
                  className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[var(--navy)]">评分模板</span>
                <select
                  value={rubricKey}
                  onChange={(event) => {
                    setRubricKey(event.target.value);
                    setError(null);
                  }}
                  className="mt-3 w-full rounded-[24px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
                >
                  {RUBRIC_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="stat-tile">
                <div className="stat-tile-label">标题</div>
                <div className="stat-tile-value">决定历史记录辨识度</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label">模板</div>
                <div className="stat-tile-value">给出默认评分框架</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label">老师要求</div>
                <div className="stat-tile-value">提交后会优先覆盖默认模板</div>
              </div>
            </div>
          </div>
        </section>

        <UploadPanel
          title="学生论文"
          description="请粘贴完整论文内容，或上传支持的文件。系统在评估完整文章时会更准确，不建议只提交片段。"
          textValue={essayText}
          onTextChange={(event) => {
            setEssayText(event.target.value);
            setError(null);
          }}
          fileName={essayFile?.name ?? ""}
          onFileChange={(event) => handleFileSelection("essay", event.target.files?.[0] ?? null)}
          onClearFile={() => {
            setEssayFile(null);
            setError(null);
          }}
          textareaPlaceholder="请在这里粘贴学生论文内容..."
          textareaName="essayText"
          fileInputName="essayFile"
        />

        <UploadPanel
          title="作业要求、评分标准或评分量表"
          description="请粘贴老师的作业说明或上传相关文件。只要提供了要求，系统就会优先按老师标准进行评估。"
          textValue={briefText}
          onTextChange={(event) => {
            setBriefText(event.target.value);
            setError(null);
          }}
          fileName={briefFile?.name ?? ""}
          onFileChange={(event) => handleFileSelection("brief", event.target.files?.[0] ?? null)}
          onClearFile={() => {
            setBriefFile(null);
            setError(null);
          }}
          textareaPlaceholder="请在这里粘贴老师的作业要求或评分标准..."
          textareaName="briefText"
          fileInputName="briefFile"
          rows={10}
        />

        {error ? (
          <div
            role="alert"
            className="rounded-[28px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-5 py-4 text-sm text-[#8b1e1e] shadow-[0_10px_24px_rgba(160,38,38,0.05)]"
          >
            {error}
          </div>
        ) : null}

        <section className="story-shell rounded-[38px] p-7 md:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">评估前说明</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                系统会返回 5 个学术维度的整数分数，并自动汇总成 100 分制总分。结果属于 AI 生成的形成性反馈，不是大学官方成绩，也不会替代人工导师判断。
              </p>
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="luxury-button min-w-[240px] text-sm disabled:cursor-wait disabled:opacity-75"
            >
              {isBusy ? "正在生成评估报告..." : "开始评估"}
            </button>
          </div>
        </section>
      </form>

      <aside className="space-y-6 xl:sticky xl:top-24">
        <section className="story-shell rounded-[38px] p-7">
          <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">当前模板</p>
          <h2 className="mt-3 text-xl text-[var(--navy)] md:text-2xl">{selectedRubric.label}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{selectedRubric.description}</p>
        </section>

        <section className="card-surface rounded-[38px] p-7">
          <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">评分结构</p>
          <div className="mt-4 grid gap-3">
            {[
              "总分：100 分",
              "结构：20 分",
              "批判性思维：20 分",
              "文献使用：20 分",
              "引用规范：20 分",
              "语言表达：20 分"
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,247,252,0.92))] px-4 py-3 text-sm text-[var(--muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="dark-panel rounded-[38px] p-7 text-white">
          <p className="section-eyebrow text-sm font-semibold text-[var(--gold-soft)]">输出说明</p>
          <h2 className="mt-3 text-2xl md:text-3xl">结果会保持简洁，但足够正式。</h2>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-white/75">
            <li>分别评估结构、批判性思维、文献使用、引用规范和语言表达。</li>
            <li>优先依据老师要求评分，并确保五项分数与总分严格一致。</li>
            <li>历史记录在接入 Supabase 后可保存到云端，便于正式使用和演示。</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
