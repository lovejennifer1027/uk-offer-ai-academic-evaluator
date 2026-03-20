import { getLocale } from "@/lib/i18n";
import { CredentialsForm } from "@/components/auth/credentials-form";

export default async function SignupPage() {
  const locale = await getLocale();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f5f7ff_0%,#fafbff_100%)] px-5 py-12">
      <CredentialsForm mode="signup" locale={locale} />
    </div>
  );
}
