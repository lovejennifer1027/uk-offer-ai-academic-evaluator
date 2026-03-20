import { getRubricPreset } from "@/config/rubrics";
import { EvaluationReportSchema, evaluationJsonSchema, normaliseEvaluationReport } from "@/lib/evaluation-schema";
import { MAX_BRIEF_CHARS, MAX_ESSAY_CHARS } from "@/lib/constants";
import { generateDemoEvaluation } from "@/lib/demo-evaluator";
import { ModelEvaluationError } from "@/lib/errors";
import { logServerError, logServerWarning } from "@/lib/logger";
import { buildEvaluationPrompt } from "@/lib/prompt";
import { cleanText, truncateText } from "@/lib/utils";
import type { EvaluationReport } from "@/lib/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

interface ResponsesApiContentItem {
  type?: string;
  text?: string;
}

interface ResponsesApiOutputItem {
  content?: ResponsesApiContentItem[];
}

interface ResponsesApiPayload {
  id?: string;
  output_text?: string;
  output?: ResponsesApiOutputItem[];
}

interface GenerateEvaluationInput {
  essayText: string;
  briefText: string;
  rubricKey: string;
}

function extractStructuredOutputText(payload: ResponsesApiPayload) {
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

export async function generateEvaluation({
  essayText,
  briefText,
  rubricKey
}: GenerateEvaluationInput): Promise<EvaluationReport> {
  const rubric = getRubricPreset(rubricKey);
  const cleanedEssay = cleanText(essayText);
  const cleanedBrief = cleanText(briefText);

  const trimmedEssay = truncateText(cleanedEssay, MAX_ESSAY_CHARS);
  const trimmedBrief = truncateText(cleanedBrief, MAX_BRIEF_CHARS);

  if (!process.env.OPENAI_API_KEY) {
    if (process.env.ENABLE_DEMO_EVALUATION === "true") {
      return generateDemoEvaluation({
        essayText: trimmedEssay.text,
        briefText: trimmedBrief.text,
        rubricKey: rubric.key
      });
    }

    throw new ModelEvaluationError("服务器尚未配置评估服务。");
  }

  const prompt = buildEvaluationPrompt({
    essayText: trimmedEssay.text,
    briefText: trimmedBrief.text,
    rubric,
    essayWasTruncated: trimmedEssay.wasTruncated,
    briefWasTruncated: trimmedBrief.wasTruncated
  });

  const response = await (async () => {
    try {
      return await fetch(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-5.4",
          input: prompt,
          reasoning: {
            effort: "medium"
          },
          max_output_tokens: 1800,
          store: false,
          text: {
            format: {
              type: "json_schema",
              name: "academic_evaluation_report",
              description:
                "AI-generated formative academic evaluation with exact integer scores and the specified essay scoring JSON contract.",
              strict: true,
              schema: evaluationJsonSchema
            }
          }
        })
      });
    } catch (error) {
      logServerError("openai-request", error, {
        rubricKey: rubric.key
      });
      throw new ModelEvaluationError("模型请求在返回响应前失败。");
    }
  })();

  if (!response.ok) {
    const message = await response.text();
    logServerError("openai-response", message, {
      status: response.status,
      rubricKey: rubric.key
    });
    throw new ModelEvaluationError("评分引擎暂时无法完成本次评估。");
  }

  const payload = (await response.json()) as ResponsesApiPayload;
  const outputText = extractStructuredOutputText(payload);

  if (!outputText) {
    logServerError("openai-empty-output", "No structured output text returned.", {
      rubricKey: rubric.key,
      responseId: payload.id
    });
    throw new ModelEvaluationError("评分引擎返回了空的结构化结果。");
  }

  try {
    const parsedJson = JSON.parse(outputText) as unknown;
    const validated = EvaluationReportSchema.parse(parsedJson);
    const normalised = normaliseEvaluationReport(validated);

    if (normalised.overall_score !== validated.overall_score) {
      logServerWarning("score-normalised", "Adjusted overall score to match rubric dimension totals.", {
        modelOverallScore: validated.overall_score,
        serverOverallScore: normalised.overall_score
      });
    }

    return normalised;
  } catch (error) {
    logServerError("openai-structured-output", error, {
      rubricKey: rubric.key,
      responseId: payload.id,
      outputPreview: outputText.slice(0, 600)
    });
    throw new ModelEvaluationError("评分引擎返回了无效的结构化结果。");
  }
}
