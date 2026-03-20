import { redirect } from "next/navigation";

export default function LegacyResultsRedirectPage() {
  redirect("/dashboard");
}
