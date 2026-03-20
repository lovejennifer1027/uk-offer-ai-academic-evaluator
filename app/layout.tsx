import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { BRAND } from "@/config/site";
import { getLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`
  },
  description: BRAND.description.en,
  applicationName: BRAND.name,
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: BRAND.name,
    description: BRAND.description.en,
    siteName: BRAND.name
  }
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale === "en" ? "en" : "zh-CN"}>
      <body className="text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
