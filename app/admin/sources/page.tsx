import { redirect } from "next/navigation";

export default function LegacyAdminSourcesRedirectPage() {
  redirect("/admin");
}
