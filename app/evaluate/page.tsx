import { redirect } from "next/navigation";

export default function LegacyEvaluateRedirectPage() {
  redirect("/dashboard/evaluate");
}
