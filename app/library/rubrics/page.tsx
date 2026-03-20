import { redirect } from "next/navigation";

export default function LegacyLibraryRubricsRedirectPage() {
  redirect("/dashboard/analyze-brief");
}
