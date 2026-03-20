import { cookies } from "next/headers";

import { BRAND, FAQS, FEATURES, HOW_IT_WORKS, MARKETING_METRICS, NAV_ITEMS, PRICING_TIERS, TESTIMONIALS } from "@/config/site";
import type { Locale, LocalizedText } from "@/types/scholardesk";

const LOCALE_COOKIE = "scholardesk-locale";

export function pickText(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "zh";
}

export function getDictionary(locale: Locale) {
  return {
    locale,
    brand: {
      name: BRAND.name,
      tagline: pickText(BRAND.tagline, locale),
      description: pickText(BRAND.description, locale)
    },
    nav: NAV_ITEMS.map((item) => ({
      href: item.href,
      label: pickText(item.label, locale)
    })),
    metrics: MARKETING_METRICS.map((item) => ({
      value: item.value,
      label: pickText(item.label, locale)
    })),
    features: FEATURES.map((item) => ({
      ...item,
      title: pickText(item.title, locale),
      description: pickText(item.description, locale)
    })),
    steps: HOW_IT_WORKS.map((item) => ({
      step: item.step,
      title: pickText(item.title, locale),
      description: pickText(item.description, locale)
    })),
    faqs: FAQS.map((item) => ({
      question: pickText(item.question, locale),
      answer: pickText(item.answer, locale)
    })),
    testimonials: TESTIMONIALS.map((item) => ({
      ...item,
      role: pickText(item.role, locale),
      quote: pickText(item.quote, locale)
    })),
    pricing: PRICING_TIERS.map((item) => ({
      key: item.key,
      name: pickText(item.name, locale),
      price: pickText(item.price, locale),
      description: pickText(item.description, locale),
      features: item.features.map((feature) => pickText(feature, locale)),
      highlighted: item.highlighted ?? false
    })),
    ui: {
      startFreeEvaluation: locale === "en" ? "Start Free Evaluation" : "开始免费评估",
      viewDemo: locale === "en" ? "View Demo" : "查看演示",
      login: locale === "en" ? "Log in" : "登录",
      signup: locale === "en" ? "Sign up" : "注册",
      dashboard: locale === "en" ? "Dashboard" : "工作台",
      tools: locale === "en" ? "Tools" : "工具中心",
      faqTitle: locale === "en" ? "Frequently asked questions" : "常见问题",
      pricingTitle: locale === "en" ? "Simple pricing for academic support teams" : "为学术支持场景准备的简洁价格方案",
      finalCtaTitle:
        locale === "en"
          ? "Build a calmer, clearer academic workflow."
          : "把你的学术工作流整理得更清楚、更高效。",
      finalCtaBody:
        locale === "en"
          ? "Use ScholarDesk AI to evaluate papers, organize evidence, and work against your own knowledge base."
          : "用 ScholarDesk AI 评估论文、整理材料，并围绕你自己的知识库展开工作。",
      privacyTitle: locale === "en" ? "Privacy-first workspace" : "以隐私为先的工作台",
      privacyPoints:
        locale === "en"
          ? [
              "Your content is user-owned.",
              "Files are transmitted over encrypted connections.",
              "Delete files any time.",
              "No public sharing by default."
            ]
          : ["内容归用户所有。", "文件通过加密链路传输。", "文件可随时删除。", "默认不公开分享。"]
    }
  };
}

export const localeCookieName = LOCALE_COOKIE;
