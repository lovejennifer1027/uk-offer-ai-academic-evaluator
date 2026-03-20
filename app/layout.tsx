import type { ReactNode } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";
import { BRAND_NAME, ORGANISATION_NAME } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`
  },
  description:
    "面向中文用户的高端 AI 学术评估网站，支持论文、作业要求与评分标准的形成性反馈。",
  applicationName: BRAND_NAME,
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: BRAND_NAME,
    description:
      "由 UK Offer 国际教育提供的高端 AI 学术评估体验，适用于论文与课程作业形成性反馈。",
    siteName: ORGANISATION_NAME
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
