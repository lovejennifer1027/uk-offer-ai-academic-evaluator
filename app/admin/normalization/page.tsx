import { redirect } from "next/navigation";

export default function LegacyAdminNormalizationRedirectPage() {
  redirect("/admin");
}
