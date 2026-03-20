import { NextResponse } from "next/server";

import { handleApiError, parseSearchParams } from "@/lib/http";
import { librarySearchSchema } from "@/lib/library/schemas";
import { filterPublicLibrarySearchItems, lexicalSearchLibrary, matchLibraryEmbeddings } from "@/lib/library/repository";
import { createEmbedding } from "@/lib/openai/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const query = parseSearchParams(request, librarySearchSchema);
    const canUseSemanticSearch = Boolean(process.env.OPENAI_API_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const result = canUseSemanticSearch
      ? await matchLibraryEmbeddings(await createEmbedding(query.query), {
          ...query,
          access_level: "public"
        })
      : await lexicalSearchLibrary({
          ...query,
          access_level: "public"
        });
    const items = await filterPublicLibrarySearchItems(result.items);

    return NextResponse.json({
      ...result,
      items,
      total: items.length,
      page_count: Math.max(1, Math.ceil(items.length / result.page_size))
    });
  } catch (error) {
    return handleApiError("library-search", error, "暂时无法执行 library 搜索。");
  }
}
