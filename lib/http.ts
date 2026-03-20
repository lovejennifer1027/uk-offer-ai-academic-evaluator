import { NextResponse } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";

import { logServerError } from "@/lib/logger";

export class HttpError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      ...(details !== undefined ? { details } : {})
    },
    { status }
  );
}

export async function parseJsonBody<Schema extends ZodTypeAny>(request: Request, schema: Schema): Promise<z.infer<Schema>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    throw new HttpError("请求体不是有效的 JSON。", 400, error instanceof Error ? error.message : undefined);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new HttpError("请求参数无效。", 400, parsed.error.flatten());
  }

  return parsed.data;
}

export function parseSearchParams<Schema extends ZodTypeAny>(request: Request | string, schema: Schema): z.infer<Schema> {
  const url = typeof request === "string" ? request : request.url;
  const searchParams = new URL(url).searchParams;
  const record: Record<string, string | string[]> = {};

  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key);
    record[key] = values.length > 1 ? values : (values[0] ?? "");
  }

  const parsed = schema.safeParse(record);

  if (!parsed.success) {
    throw new HttpError("查询参数无效。", 400, parsed.error.flatten());
  }

  return parsed.data;
}

export function handleApiError(stage: string, error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return jsonError(error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return jsonError("请求参数无效。", 400, error.flatten());
  }

  logServerError(stage, error);
  return jsonError(fallbackMessage, 500);
}
