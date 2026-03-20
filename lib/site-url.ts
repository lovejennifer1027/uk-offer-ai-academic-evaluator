function normaliseUrl(value: string) {
  if (!value) {
    return "";
  }

  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const previewUrl = process.env.VERCEL_URL?.trim();
  const runningOnVercel = Boolean(productionUrl || previewUrl || process.env.VERCEL);
  const configuredIsLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredUrl ?? "");

  return (
    normaliseUrl(productionUrl ?? "") ||
    normaliseUrl(previewUrl ?? "") ||
    normaliseUrl(runningOnVercel && configuredIsLocalhost ? "" : configuredUrl ?? "") ||
    "http://localhost:3000"
  );
}
