import "server-only";

import { ModelEvaluationError } from "@/lib/errors";
import { logServerError, logServerInfo } from "@/lib/logger";

const OPENAI_BASE_URL = "https://api.openai.com/v1";

interface ResponsesApiContentItem {
  type?: string;
  text?: string;
}

interface ResponsesApiOutputItem {
  content?: ResponsesApiContentItem[];
}

interface ResponsesApiResponse {
  id?: string;
  output_text?: string;
  output?: ResponsesApiOutputItem[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface StructuredJsonRequestOptions {
  model: string;
  schemaName: string;
  schemaDescription: string;
  schema: object;
  input: string;
  maxOutputTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new ModelEvaluationError("服务器尚未配置 OpenAI 服务。");
  }

  return apiKey;
}

function shouldRetry(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function extractStructuredOutputText(payload: ResponsesApiResponse) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) {
        return content.text;
      }
    }
  }

  return "";
}

async function openAiFetch(path: string, body: object, retryKey: string) {
  const apiKey = getApiKey();
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${OPENAI_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return response;
      }

      const message = await response.text();
      lastError = new Error(`OpenAI ${path} failed with ${response.status}: ${message}`);

      if (!shouldRetry(response.status) || attempt === 3) {
        throw lastError;
      }

      await sleep(attempt * 800);
    } catch (error) {
      lastError = error;

      if (attempt === 3) {
        logServerError(`openai-${retryKey}`, error);
        throw new ModelEvaluationError("OpenAI 请求失败。");
      }

      await sleep(attempt * 800);
    }
  }

  logServerError(`openai-${retryKey}`, lastError);
  throw new ModelEvaluationError("OpenAI 请求失败。");
}

export async function requestStructuredJson<T>({
  model,
  schemaName,
  schemaDescription,
  schema,
  input,
  maxOutputTokens = 1800,
  reasoningEffort = "medium"
}: StructuredJsonRequestOptions): Promise<{
  data: T;
  response_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  raw_text: string;
  raw_response: unknown;
}> {
  const response = await openAiFetch(
    "/responses",
    {
      model,
      input,
      max_output_tokens: maxOutputTokens,
      reasoning: {
        effort: reasoningEffort
      },
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          description: schemaDescription,
          strict: true,
          schema
        }
      }
    },
    "structured-json"
  );

  const payload = (await response.json()) as ResponsesApiResponse;
  const outputText = extractStructuredOutputText(payload);

  if (!outputText) {
    throw new ModelEvaluationError("OpenAI 返回了空的结构化结果。");
  }

  logServerInfo("openai-response-id", "Captured OpenAI response id.", {
    responseId: payload.id ?? null,
    model
  });

  try {
    return {
      data: JSON.parse(outputText) as T,
      response_id: payload.id ?? null,
      input_tokens: payload.usage?.input_tokens ?? null,
      output_tokens: payload.usage?.output_tokens ?? null,
      raw_text: outputText,
      raw_response: payload
    };
  } catch (error) {
    logServerError("openai-json-parse", error, {
      responseId: payload.id ?? null,
      outputPreview: outputText.slice(0, 600)
    });
    throw new ModelEvaluationError("OpenAI 返回的 JSON 无法解析。");
  }
}

export async function createEmbedding(text: string, model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small") {
  const response = await openAiFetch(
    "/embeddings",
    {
      model,
      input: text
    },
    "embeddings"
  );
  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };

  const embedding = payload.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new ModelEvaluationError("Embedding 接口返回了无效结果。");
  }

  return embedding;
}
