import { createHash } from "node:crypto";

export function hashContent(parts: Array<string | null | undefined>) {
  const normalized = parts.filter(Boolean).join("\n---\n");
  return createHash("sha256").update(normalized).digest("hex");
}
