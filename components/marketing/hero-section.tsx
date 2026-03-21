"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Database, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/types/scholardesk";

export function HeroSection({
  locale,
  title,
  description,
  primaryCta,
  secondaryCta
}: {
  locale: Locale;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}) {
  return (
    <section className="hero-shell relative overflow-hidden rounded-[40px] px-6 py-8 md:px-8 md:py-10 xl:px-10">
      <div className="relative grid gap-10 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
        <div className="py-2">
          <div className="eyebrow-pill">
            <Badge>ScholarDesk AI</Badge>
            <span className="text-xs font-medium text-slate-500">
              {locale === "en" ? "Compliant academic workspace" : "合规学术工作台"}
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.065em] text-slate-950 md:text-6xl xl:text-[5.2rem] xl:leading-[0.96]"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-6 max-w-3xl text-lg leading-9 text-slate-600 md:text-[1.1rem]"
          >
            {description}
          </motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button>{primaryCta}</Button>
            </Link>
            <Link href="/tools">
              <Button variant="secondary">{secondaryCta}</Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              locale === "en" ? "Evaluation reports in minutes" : "分钟级生成评估报告",
              locale === "en" ? "Knowledge-base grounded responses" : "基于知识库的回答",
              locale === "en" ? "Chinese + English workflows" : "中英双语工作流"
            ].map((item) => (
              <span key={item} className="quiet-badge text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="story-shell rounded-[34px] p-4 md:p-5">
            <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,248,255,0.82))] p-5 shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {locale === "en" ? "Knowledge-base assisted evaluation" : "知识库增强评估"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {locale === "en" ? "Project-aware academic workflows" : "围绕项目上下文的学术工作流"}
                  </div>
                </div>
                <Badge>{locale === "en" ? "Live" : "实时"}</Badge>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="signal-bar">
                  {[
                    {
                      icon: Bot,
                      title: locale === "en" ? "AI Evaluation" : "AI 评估",
                      body: locale === "en" ? "Structured reports with revision checkpoints." : "输出结构化报告与修改优先级。",
                      status: locale === "en" ? "Ready to run" : "可立即运行"
                    },
                    {
                      icon: Database,
                      title: locale === "en" ? "RAG Context" : "检索上下文",
                      body: locale === "en" ? "Retrieved snippets from uploaded materials." : "从上传材料中提取相关片段。",
                      status: locale === "en" ? "Context indexed" : "上下文已索引"
                    },
                    {
                      icon: ShieldCheck,
                      title: locale === "en" ? "Compliant Use" : "合规使用",
                      body: locale === "en" ? "Supportive guidance, not assignment ghostwriting." : "提供支持性辅助，而不是代写作业。",
                      status: locale === "en" ? "Policy aligned" : "策略已对齐"
                    }
                  ].map((item) => (
                    <div key={item.title} className="signal-row">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(107,116,214,0.14),rgba(121,188,255,0.14))] text-indigo-600">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <strong>{item.title}</strong>
                          <span className="mt-1 block">{item.body}</span>
                        </div>
                      </div>
                      <div className="signal-status">
                        <span className="signal-dot is-live" />
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4">
                  <div className="story-metric">
                    <div className="story-metric-value">92%</div>
                    <div className="story-metric-label">
                      {locale === "en" ? "Users start with evaluation or brief analysis first." : "用户通常先从评估或要求分析开始。"}
                    </div>
                  </div>
                  <div className="story-metric">
                    <div className="story-metric-value">Top‑k 6</div>
                    <div className="story-metric-label">
                      {locale === "en" ? "Retrieved evidence snippets can be surfaced alongside outputs." : "输出可同步展示检索到的证据片段。"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="process-band mt-5 rounded-[28px] p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    {locale === "en" ? "Evaluation pipeline" : "评估流程"}
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    locale === "en" ? "Upload files" : "上传文件",
                    locale === "en" ? "Retrieve context" : "检索上下文",
                    locale === "en" ? "Generate report" : "生成报告"
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] border border-white/70 bg-white/86 px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
