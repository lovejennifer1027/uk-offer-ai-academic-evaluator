import { redirect } from "next/navigation";

export default function LegacyHistoryRedirectPage() {
  redirect("/dashboard/projects");
}
