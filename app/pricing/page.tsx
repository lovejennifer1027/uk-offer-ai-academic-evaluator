import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PricingCard } from "@/components/marketing/pricing-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function PricingPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fbfcff_100%)]">
      <MarketingHeader locale={locale} nav={dict.nav} loginLabel={dict.ui.login} ctaLabel={dict.ui.startFreeEvaluation} />
      <main className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <SectionHeading badge={locale === "en" ? "Pricing" : "价格方案"} title={dict.ui.pricingTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {dict.pricing.map((tier) => (
            <PricingCard key={tier.key} tier={tier} ctaLabel={locale === "en" ? "Choose plan" : "选择方案"} />
          ))}
        </div>
      </main>
      <MarketingFooter locale={locale} nav={dict.nav} />
    </div>
  );
}
