export const AI_LIBRARY_SCORE_BANDS = ["60-69", "70-79", "80+"] as const;

export const AI_LIBRARY_SCORE_BAND_LABELS: Record<(typeof AI_LIBRARY_SCORE_BANDS)[number], string> = {
  "60-69": "60-69 / Competent",
  "70-79": "70-79 / Distinction-ready",
  "80+": "80+ / Exceptional"
};

export const AI_LIBRARY_LOCAL_HISTORY_KEY = "uk-offer-ai-generated-library-history";
export const AI_LIBRARY_HISTORY_LIMIT = 18;
export const AI_LIBRARY_MAX_CONTEXT_ITEMS = 8;
