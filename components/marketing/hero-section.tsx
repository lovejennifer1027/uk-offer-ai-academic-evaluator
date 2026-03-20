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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_22%)]" />
      <div className="relative grid gap-10 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
        <div>
          <Badge>ScholarDesk AI</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 md:text-6xl xl:text-7xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-6 max-w-3xl text-lg leading-9 text-slate-600"
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <Card className="rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,247,255,0.9))] p-5 md:p-6">
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
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
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: Bot,
                    title: locale === "en" ? "AI Evaluation" : "AI 评估",
                    body: locale === "en" ? "Structured reports with revision checkpoints." : "输出结构化报告与修改优先级。"
                  },
                  {
                    icon: Database,
                    title: locale === "en" ? "RAG Context" : "检索上下文",
                    body: locale === "en" ? "Retrieved snippets from uploaded materials." : "从上传材料中提取相关片段。"
                  },
                  {
                    icon: ShieldCheck,
                    title: locale === "en" ? "Compliant Use" : "合规使用",
                    body: locale === "en" ? "Supportive guidance, not assignment ghostwriting." : "提供支持性辅助，而不是代写作业。"
                  }
                ].map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <item.icon className="h-5 w-5 text-indigo-600" />
                    <div className="mt-3 text-sm font-semibold text-slate-900">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {locale === "en" ? "Evaluation pipeline" : "评估流程"}
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    locale === "en" ? "Upload files" : "上传文件",
                    locale === "en" ? "Retrieve context" : "检索上下文",
                    locale === "en" ? "Generate report" : "生成报告"
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
