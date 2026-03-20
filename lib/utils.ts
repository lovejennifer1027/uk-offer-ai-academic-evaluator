import { type RubricScores } from "@/lib/types";
import type { Locale } from "@/types/scholardesk";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function cleanText(value: string) {
  return value.replace(/\u0000/g, "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return { text: value, wasTruncated: false };
  }

  return {
    text: `${value.slice(0, maxChars).trimEnd()}\n\n[Text truncated for evaluation stability.]`,
    wasTruncated: true
  };
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export function formatDateByLocale(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export function sumRubricScores(scores: RubricScores) {
  return (
    scores.Structure.score +
    scores["Critical Thinking"].score +
    scores["Use of Literature"].score +
    scores.Referencing.score +
    scores.Language.score
  );
}

export function previewText(value: string, maxLength = 180) {
  if (!value) {
    return "Not provided.";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}...` : value;
}

export function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function stripMarkdown(value: string) {
  return cleanText(
    value
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
  );
}
