type ErrorLike = Error | string | unknown;

function normaliseError(error: ErrorLike) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error"
  };
}

export function logServerError(stage: string, error: ErrorLike, meta?: Record<string, unknown>) {
  console.error(`[academic-evaluator:${stage}]`, {
    ...normaliseError(error),
    ...(meta ?? {})
  });
}

export function logServerWarning(stage: string, message: string, meta?: Record<string, unknown>) {
  console.warn(`[academic-evaluator:${stage}]`, {
    message,
    ...(meta ?? {})
  });
}

export function logServerInfo(stage: string, message: string, meta?: Record<string, unknown>) {
  console.info(`[academic-evaluator:${stage}]`, {
    message,
    ...(meta ?? {})
  });
}
