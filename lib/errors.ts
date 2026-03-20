export class SubmissionValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "SubmissionValidationError";
  }
}

export class FileParsingError extends Error {
  readonly statusCode = 422;

  constructor(message: string) {
    super(message);
    this.name = "FileParsingError";
  }
}

export class ModelEvaluationError extends Error {
  readonly statusCode = 502;

  constructor(message: string) {
    super(message);
    this.name = "ModelEvaluationError";
  }
}
