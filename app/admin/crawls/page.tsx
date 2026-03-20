import { redirect } from "next/navigation";

export default function LegacyAdminCrawlsRedirectPage() {
  redirect("/admin");
}
