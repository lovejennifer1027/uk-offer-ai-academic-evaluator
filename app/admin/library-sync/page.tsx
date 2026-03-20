import { redirect } from "next/navigation";

export default function LegacyAdminLibrarySyncRedirectPage() {
  redirect("/admin");
}
