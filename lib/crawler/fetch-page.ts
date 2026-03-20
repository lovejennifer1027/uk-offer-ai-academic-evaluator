import "server-only";

import type { LibraryAccessLevel, LibraryParserType } from "@/lib/library/types";

export interface FetchedPage {
  url: string;
  final_url: string;
  http_status: number;
  content_type: string;
  parser_type: LibraryParserType;
  access_level: LibraryAccessLevel;
  buffer: Buffer;
  raw_html: string | null;
}

function inferParserType(url: string, contentType: string, preferredParserType?: LibraryParserType): LibraryParserType {
  const loweredUrl = url.toLowerCase();
  const loweredContentType = contentType.toLowerCase();

  if (loweredContentType.includes("pdf") || loweredUrl.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    loweredContentType.includes("officedocument.wordprocessingml.document") ||
    loweredUrl.endsWith(".docx")
  ) {
    return "docx";
  }

  if (loweredContentType.includes("html")) {
    return "html";
  }

  if (preferredParserType && preferredParserType !== "mixed") {
    return preferredParserType;
  }

  return "mixed";
}

function inferAccessLevel(status: number, content: string) {
  if (status === 401 || status === 403) {
    return "restricted" as const;
  }

  const lowered = content.toLowerCase();
  const restrictedSignals = [
    "sign in",
    "log in",
    "institution login",
    "restricted access",
    "access denied",
    "members only",
    "subscription required"
  ];

  if (restrictedSignals.some((signal) => lowered.includes(signal))) {
    return "restricted" as const;
  }

  if (status >= 200 && status < 400) {
    return "public" as const;
  }

  return "unknown" as const;
}

export async function fetchPage(url: string, preferredParserType?: LibraryParserType): Promise<FetchedPage> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "UKOfferLibraryBot/1.0 (+https://ukoffer.example/library)"
    },
    cache: "no-store"
  });
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());
  const isHtml = contentType.toLowerCase().includes("html");
  const rawHtml = isHtml ? buffer.toString("utf8") : null;
  const accessLevel = inferAccessLevel(response.status, rawHtml ?? "");

  return {
    url,
    final_url: response.url,
    http_status: response.status,
    content_type: contentType,
    parser_type: inferParserType(response.url, contentType, preferredParserType),
    access_level: accessLevel,
    buffer,
    raw_html: rawHtml
  };
}
