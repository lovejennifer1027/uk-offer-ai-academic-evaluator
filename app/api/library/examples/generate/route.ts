import { NextResponse } from "next/server";
import { z } from "zod";

import { generatedExampleRequestSchema } from "@/lib/ai-library/schemas";
import type { GeneratedExamplePack, GeneratedExamplePackCore } from "@/lib/ai-library/types";
import { generateDemoHighScoringExample } from "@/lib/demo-ai-library";
import { handleApiError, parseJsonBody } from "@/lib/http";
import { generateAiHighScoringExample } from "@/lib/openai/generated-library";

export const runtime = "nodejs";

type GeneratedExampleInput = z.infer<typeof generatedExampleRequestSchema>;

function buildStoredPack(
  input: GeneratedExampleInput,
  pack: GeneratedExamplePackCore,
  source: GeneratedExamplePack["source"]
): GeneratedExamplePack {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    subject: input.subject,
    programme_level: input.programme_level,
    assignment_type: input.assignment_type,
    score_band: input.score_band,
    focus: input.focus,
    source,
    accumulation_mode: "local",
    ...pack
  };
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, generatedExampleRequestSchema);

    if (!process.env.OPENAI_API_KEY) {
      if (process.env.ENABLE_DEMO_EVALUATION === "true") {
        return NextResponse.json({
          result: buildStoredPack(body, generateDemoHighScoringExample(body), "demo"),
          prompt_version: "ai-library-demo-fallback",
          storageMode: "local"
        });
      }

      return NextResponse.json({ error: "服务器尚未配置 OpenAI 服务。" }, { status: 503 });
    }

    const generated = await generateAiHighScoringExample(body);

    return NextResponse.json({
      result: buildStoredPack(body, generated.pack, "openai"),
      prompt_version: generated.prompt_version,
      storageMode: "local"
    });
  } catch (error) {
    return handleApiError("library-examples-generate", error, "暂时无法生成高分写作示例。");
  }
}
