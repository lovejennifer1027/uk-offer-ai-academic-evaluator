import { NextResponse } from "next/server";

import { handleApiError, parseJsonBody } from "@/lib/http";
import { libraryInsightQuerySchema } from "@/lib/library/schemas";
import { buildInsightEvidence, filterPublicLibrarySearchItems, lexicalSearchLibrary, matchLibraryEmbeddings } from "@/lib/library/repository";
import { synthesizeLibraryInsights } from "@/lib/openai/normalize-page";
import { createEmbedding } from "@/lib/openai/client";

export const runtime = "nodejs";

function buildFallbackInsightAnswer(query: string, evidence: Awaited<ReturnType<typeof buildInsightEvidence>>) {
  const topItems = evidence.slice(0, 3);

  return {
    answer:
      topItems.length > 0
        ? `当前结果基于已检索到的公开资料。围绕“${query}”，最明显的共同点是：高分写作通常更强调明确结构、分析深度，以及证据与论点之间的解释关系。`
        : `当前还没有足够的公开资料来回答“${query}”。请先补充更多 library 数据后再查询。`,
    key_points:
      topItems.length > 0
        ? topItems.map((item) => `${item.university_name} / ${item.title} 提示了与该问题直接相关的公开线索。`)
        : ["当前没有足够证据可供总结。"],
    caveats: [
      "该回答基于当前检索到的公开资料，不代表所有英国高校的一般结论。",
      "如果数据覆盖范围较窄，应避免把局部样本外推为普遍规则。"
    ],
    evidence: topItems
  };
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, libraryInsightQuerySchema);
    const baseFilters = {
      page: 1,
      page_size: 8,
      query: body.query,
      university_id: body.university_id ?? undefined,
      programme_level: body.programme_level ?? undefined,
      assignment_type: body.assignment_type ?? undefined,
      entity_type: "all" as const
    };
    const canUseSemanticSearch = Boolean(process.env.OPENAI_API_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const searchResult = canUseSemanticSearch
      ? await matchLibraryEmbeddings(await createEmbedding(body.query), {
          ...baseFilters,
          access_level: "public"
        })
      : await lexicalSearchLibrary({
          ...baseFilters,
          access_level: "public"
        });
    const publicItems = await filterPublicLibrarySearchItems(searchResult.items);
    const evidence = await buildInsightEvidence(publicItems);

    if (evidence.length === 0) {
      return NextResponse.json({
        result: buildFallbackInsightAnswer(body.query, evidence),
        prompt_version: "no-evidence-fallback"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        result: buildFallbackInsightAnswer(body.query, evidence),
        prompt_version: "local-fallback"
      });
    }

    const result = await synthesizeLibraryInsights(body.query, evidence);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError("library-insights-query", error, "暂时无法生成 insights 回答。");
  }
}
