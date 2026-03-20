"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/types/scholardesk";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function switchLanguage(nextLocale: Locale) {
    setLoading(true);

    try {
      await fetch("/api/preferences/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale })
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 p-1 shadow-sm">
      <Button variant={locale === "zh" ? "primary" : "ghost"} className="px-3 py-2 text-xs" disabled={loading} onClick={() => switchLanguage("zh")}>
        中文
      </Button>
      <Button variant={locale === "en" ? "primary" : "ghost"} className="px-3 py-2 text-xs" disabled={loading} onClick={() => switchLanguage("en")}>
        EN
      </Button>
    </div>
  );
}
