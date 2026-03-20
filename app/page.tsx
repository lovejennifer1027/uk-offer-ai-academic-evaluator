import Link from "next/link";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { FeatureCard } from "@/components/marketing/feature-card";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PricingCard } from "@/components/marketing/pricing-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { StatsStrip } from "@/components/marketing/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fafbff_35%,#f7f9fd_100%)]">
      <MarketingHeader locale={locale} nav={dict.nav} loginLabel={dict.ui.login} ctaLabel={dict.ui.startFreeEvaluation} />

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 md:px-8 md:pb-24">
          <HeroSection
            locale={locale}
            title={dict.brand.tagline}
            description={dict.brand.description}
            primaryCta={dict.ui.startFreeEvaluation}
            secondaryCta={dict.ui.viewDemo}
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-10">
          <StatsStrip items={dict.metrics} />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHeading
            badge={locale === "en" ? "Core workflows" : "核心工作流"}
            title={locale === "en" ? "Six focused tools inside one calmer academic workspace." : "把六类核心能力放进同一个更清晰的学术工作台。"}
            description={
              locale === "en"
                ? "ScholarDesk AI is designed for evaluation, review, and organization workflows that remain compatible with academic integrity expectations."
                : "ScholarDesk AI 面向评估、复盘与整理场景设计，保持与学术诚信要求兼容。"
            }
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dict.features.map((feature) => (
              <FeatureCard key={feature.key} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHeading
            badge={locale === "en" ? "How it works" : "工作方式"}
            title={locale === "en" ? "Create a project, upload context, then run the workflow you need." : "先创建项目，再上传材料，最后运行需要的 AI 工作流。"}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {dict.steps.map((step) => (
              <Card key={step.step} className="rounded-[30px]">
                <Badge>{step.step}</Badge>
                <h3 className="mt-5 text-2xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-[34px] bg-slate-950 p-8 text-white">
              <Badge className="border-white/20 bg-white/10 text-white">{dict.ui.privacyTitle}</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{locale === "en" ? "Designed for trust, not academic shortcuts." : "以可信赖为前提设计，而不是提供学术捷径。"}</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-white/75">
                {dict.ui.privacyPoints.map((item: string) => (
                  <div key={item} className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: LockKeyhole,
                  title: locale === "en" ? "User-owned content" : "内容归用户所有",
                  body:
                    locale === "en"
                      ? "Files and outputs are handled as user-owned workspace content, not public training material."
                      : "文件和输出被视作用户自己的工作区内容，而不是公开训练材料。"
                },
                {
                  icon: Sparkles,
                  title: locale === "en" ? "Grounded assistance" : "基于上下文的辅助",
                  body:
                    locale === "en"
                      ? "Retrieval over uploaded documents helps the assistant stay grounded in project context."
                      : "围绕上传材料进行检索，帮助 AI 回答更贴近项目上下文。"
                }
              ].map((item) => (
                <Card key={item.title} className="rounded-[30px]">
                  <item.icon className="h-5 w-5 text-indigo-600" />
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHeading badge={locale === "en" ? "Testimonials" : "示例反馈"} title={locale === "en" ? "Mock client-style reactions for the first version." : "面向第一版产品的示例型用户反馈。"} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {dict.testimonials.map((item) => (
              <Card key={item.name} className="rounded-[30px]">
                <div className="text-base font-semibold text-slate-950">{item.name}</div>
                <div className="mt-2 text-sm text-slate-500">{item.role}</div>
                <p className="mt-5 text-sm leading-7 text-slate-600">{item.quote}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHeading badge={locale === "en" ? "FAQ" : "FAQ"} title={dict.ui.faqTitle} />
          <div className="mt-10">
            <FAQAccordion items={dict.faqs} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHeading badge={locale === "en" ? "Pricing" : "价格方案"} title={dict.ui.pricingTitle} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {dict.pricing.map((tier) => (
              <PricingCard key={tier.key} tier={tier} ctaLabel={locale === "en" ? "Choose plan" : "选择方案"} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <Card className="rounded-[36px] bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(55,65,81,0.96))] px-8 py-10 text-white">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
              <div>
                <h2 className="text-4xl font-semibold tracking-[-0.05em]">{dict.ui.finalCtaTitle}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-white/70">{dict.ui.finalCtaBody}</p>
              </div>
              <div className="flex flex-wrap gap-3 xl:justify-end">
                <Link href="/signup">
                  <Button>{dict.ui.startFreeEvaluation}</Button>
                </Link>
                <Link href="/tools">
                  <Button variant="secondary">{dict.ui.tools}</Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <MarketingFooter locale={locale} nav={dict.nav} />
    </div>
  );
}
