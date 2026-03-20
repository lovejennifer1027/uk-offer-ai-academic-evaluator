import { redirect } from "next/navigation";

export default function LegacyLibraryInsightsRedirectPage() {
  redirect("/dashboard/search");
}
