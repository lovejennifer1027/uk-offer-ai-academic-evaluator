import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { ACCEPTED_UPLOAD_EXTENSIONS, MAX_UPLOAD_BYTES, MAX_UPLOAD_SIZE_LABEL } from "@/lib/constants";
import { FileParsingError, SubmissionValidationError } from "@/lib/errors";
import { logServerError } from "@/lib/logger";
import { cleanText } from "@/lib/utils";

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function validateUpload(file: File | null) {
  if (!file) {
    return;
  }

  const extension = getExtension(file.name);

  if (!ACCEPTED_UPLOAD_EXTENSIONS.includes(extension as (typeof ACCEPTED_UPLOAD_EXTENSIONS)[number])) {
    throw new SubmissionValidationError(
      `不支持的文件类型：“${file.name}”。请仅上传 PDF、DOCX 或 TXT 文件。`
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new SubmissionValidationError(
      `“${file.name}” 超过 ${MAX_UPLOAD_SIZE_LABEL}，请上传更小的文件。`
    );
  }
}

export async function extractTextFromFile(file: File) {
  validateUpload(file);

  const extension = getExtension(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "txt") {
    return cleanText(buffer.toString("utf8"));
  }

  try {
    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return cleanText(result.value);
    }

    if (extension === "pdf") {
      const result = await pdfParse(buffer);
      return cleanText(result.text);
    }
  } catch (error) {
    logServerError("file-parse", error, {
      fileName: file.name,
      extension
    });
    throw new FileParsingError(`无法从“${file.name}”中提取可读文本。`);
  }

  throw new FileParsingError(`无法处理文件“${file.name}”。`);
}
