import "server-only";

import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import type { FetchedPage } from "@/lib/crawler/fetch-page";
import type { LibraryPageType } from "@/lib/library/types";
import { cleanText } from "@/lib/utils";

function stripHtml(value: string) {
  return cleanText(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
  );
}

function guessPageType(url: string, title: string | null, text: string) {
  const lowered = `${url} ${title ?? ""} ${text}`.toLowerCase();

  if (lowered.includes("rubric") || lowered.includes("marking criteria") || lowered.includes("descriptor")) {
    return "rubric" as LibraryPageType;
  }

  if (lowered.includes("feedback")) {
    return "feedback" as LibraryPageType;
  }

  if (lowered.includes("sample essay") || lowered.includes("essay example") || lowered.includes("high-scoring")) {
    return "example" as LibraryPageType;
  }

  if (lowered.includes("dissertation example") || lowered.includes("annotated writing")) {
    return "example" as LibraryPageType;
  }

  if (lowered.endsWith(".pdf")) {
    return "pdf" as LibraryPageType;
  }

  if (lowered.endsWith(".docx")) {
    return "doc" as LibraryPageType;
  }

  return "unknown" as LibraryPageType;
}

function getTitleFromHtml(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? cleanText(match[1]) : null;
}

export async function extractTextFromFetchedPage(page: FetchedPage) {
  if (page.access_level === "restricted") {
    return {
      page_title: getTitleFromHtml(page.raw_html ?? "") ?? null,
      raw_text: "",
      raw_html: null,
      content_length: 0,
      page_type: guessPageType(page.final_url, null, "")
    };
  }

  let rawText = "";
  let pageTitle: string | null = null;
  let rawHtmlToStore: string | null = null;

  if (page.parser_type === "html") {
    const html = page.raw_html ?? page.buffer.toString("utf8");
    pageTitle = getTitleFromHtml(html);
    rawText = stripHtml(html);
    rawHtmlToStore = html;
  } else if (page.parser_type === "pdf") {
    const result = await pdfParse(page.buffer);
    rawText = cleanText(result.text);
  } else if (page.parser_type === "docx") {
    const result = await mammoth.extractRawText({ buffer: page.buffer });
    rawText = cleanText(result.value);
  } else {
    rawText = cleanText(page.buffer.toString("utf8"));
  }

  const pageType = guessPageType(page.final_url, pageTitle, rawText);

  return {
    page_title: pageTitle,
    raw_text: rawText,
    raw_html: rawHtmlToStore,
    content_length: rawText.length,
    page_type: pageType
  };
}

export function discoverLinksFromHtml(html: string, baseUrl: string) {
  const matches = [...html.matchAll(/href=["']([^"'#]+)["']/gi)];
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const match of matches) {
    const href = match[1];

    try {
      const absolute = new URL(href, baseUrl);

      if (!["http:", "https:"].includes(absolute.protocol)) {
        continue;
      }

      const candidate = absolute.toString();

      if (seen.has(candidate)) {
        continue;
      }

      seen.add(candidate);
      urls.push(candidate);
    } catch {
      continue;
    }
  }

  return urls;
}
