"use client";

import { AI_LIBRARY_HISTORY_LIMIT, AI_LIBRARY_LOCAL_HISTORY_KEY } from "@/lib/ai-library/constants";
import type { GeneratedExamplePack } from "@/lib/ai-library/types";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getGeneratedExampleHistory() {
  if (!canUseStorage()) {
    return [] as GeneratedExamplePack[];
  }

  try {
    const raw = window.localStorage.getItem(AI_LIBRARY_LOCAL_HISTORY_KEY);

    if (!raw) {
      return [] as GeneratedExamplePack[];
    }

    return JSON.parse(raw) as GeneratedExamplePack[];
  } catch {
    return [] as GeneratedExamplePack[];
  }
}

export function saveGeneratedExampleToHistory(example: GeneratedExamplePack) {
  if (!canUseStorage()) {
    return;
  }

  const current = getGeneratedExampleHistory();
  const next = [example, ...current.filter((item) => item.id !== example.id)].slice(0, AI_LIBRARY_HISTORY_LIMIT);
  window.localStorage.setItem(AI_LIBRARY_LOCAL_HISTORY_KEY, JSON.stringify(next));
}

export function clearGeneratedExampleHistory() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AI_LIBRARY_LOCAL_HISTORY_KEY);
}
