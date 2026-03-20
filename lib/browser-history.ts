"use client";

import { LOCAL_HISTORY_KEY } from "@/lib/constants";
import type { SubmissionRecord } from "@/lib/types";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getLocalSubmissionHistory() {
  if (!canUseStorage()) {
    return [] as SubmissionRecord[];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) {
      return [] as SubmissionRecord[];
    }

    return JSON.parse(raw) as SubmissionRecord[];
  } catch {
    return [] as SubmissionRecord[];
  }
}

export function saveSubmissionToLocalHistory(submission: SubmissionRecord) {
  if (!canUseStorage()) {
    return;
  }

  const current = getLocalSubmissionHistory();
  const next = [submission, ...current.filter((item) => item.id !== submission.id)].slice(0, 20);
  window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(next));
}

export function getLocalSubmissionById(id: string) {
  return getLocalSubmissionHistory().find((submission) => submission.id === id) ?? null;
}

export function mergeSubmissions(primary: SubmissionRecord[], local: SubmissionRecord[]) {
  const map = new Map<string, SubmissionRecord>();

  [...primary, ...local].forEach((submission) => {
    map.set(submission.id, submission);
  });

  return Array.from(map.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
