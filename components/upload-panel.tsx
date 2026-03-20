import type { ChangeEventHandler } from "react";

import { ACCEPTED_UPLOAD_LABEL, MAX_UPLOAD_SIZE_LABEL } from "@/lib/constants";

interface UploadPanelProps {
  title: string;
  description: string;
  textValue: string;
  onTextChange: ChangeEventHandler<HTMLTextAreaElement>;
  fileName: string;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onClearFile: () => void;
  textareaPlaceholder: string;
  textareaName: string;
  fileInputName: string;
  rows?: number;
}

export function UploadPanel({
  title,
  description,
  textValue,
  onTextChange,
  fileName,
  onFileChange,
  onClearFile,
  textareaPlaceholder,
  textareaName,
  fileInputName,
  rows = 13
}: UploadPanelProps) {
  return (
    <section className="card-surface rounded-[38px] p-7 md:p-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">输入区域</p>
          <h2 className="mt-4 text-2xl text-[var(--navy)] md:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
        </div>
        <div className="rounded-full border border-[rgba(141,139,198,0.16)] bg-[rgba(141,139,198,0.1)] px-4 py-2 text-xs font-semibold text-[var(--navy)]">
          上传或粘贴
        </div>
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.18fr_0.82fr]">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--navy)]">粘贴文本</span>
          <textarea
            name={textareaName}
            value={textValue}
            onChange={onTextChange}
            rows={rows}
            placeholder={textareaPlaceholder}
            className="mt-3 min-h-[320px] w-full rounded-[28px] border border-[var(--line)] bg-white px-5 py-4 text-sm leading-7 text-[var(--ink)] outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
          />
        </label>

        <div className="rounded-[30px] border border-dashed border-[rgba(59,76,107,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(239,244,252,0.84))] p-5">
          <div className="rounded-[26px] border border-[rgba(59,76,107,0.08)] bg-white/92 p-6 shadow-[0_16px_36px_rgba(67,84,120,0.05)]">
            <p className="text-sm font-semibold text-[var(--navy)]">上传文件</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              支持格式：{ACCEPTED_UPLOAD_LABEL}。最大文件大小：{MAX_UPLOAD_SIZE_LABEL}。如果同时提供粘贴文本和上传文件，系统会优先使用粘贴文本。
            </p>

            <label className="mt-6 flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-[26px] border border-[rgba(59,76,107,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,247,253,0.94))] px-5 text-center transition hover:border-[rgba(141,139,198,0.24)]">
              <span className="text-sm font-semibold text-[var(--navy)]">选择文件并上传</span>
              <span className="mt-2 max-w-xs text-sm leading-7 text-[var(--muted)]">
                适合较长文本、已经排版的文档，或不方便直接粘贴的老师要求文件。
              </span>
              <span className="mt-5 rounded-full border border-[rgba(59,76,107,0.08)] bg-[linear-gradient(180deg,var(--navy-soft),var(--navy))] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(67,84,120,0.12)]">
                选择文件
              </span>
              <input
                type="file"
                name={fileInputName}
                accept=".pdf,.docx,.txt"
                onChange={(event) => {
                  onFileChange(event);
                  event.currentTarget.value = "";
                }}
                className="sr-only"
              />
            </label>

            <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,247,252,0.92))] px-4 py-4 text-sm text-[var(--muted)]">
              {fileName ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>已选择：{fileName}</span>
                  <button
                    type="button"
                    onClick={onClearFile}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--navy)] transition hover:border-[rgba(141,139,198,0.22)] hover:text-[var(--navy)]"
                  >
                    移除
                  </button>
                </div>
              ) : (
                "尚未选择文件。"
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
