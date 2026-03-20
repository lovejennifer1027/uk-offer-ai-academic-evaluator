import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Card } from "@/components/ui/card";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function TermsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fbfcff_100%)]">
      <MarketingHeader locale={locale} nav={dict.nav} loginLabel={dict.ui.login} ctaLabel={dict.ui.startFreeEvaluation} />
      <main className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <Card className="rounded-[34px]">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
            {locale === "en" ? "Terms overview" : "使用条款说明"}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-8 text-slate-600">
            <p>
              {locale === "en"
                ? "ScholarDesk AI is positioned for compliant academic support, not ghostwriting, plagiarism evasion, or academic misconduct workflows."
                : "ScholarDesk AI 的定位是合规学术支持，不用于代写、规避查重或其他学术不端场景。"}
            </p>
            <p>
              {locale === "en"
                ? "Users remain responsible for reviewing outputs, checking references, and ensuring any submitted work complies with institutional rules."
                : "用户仍需自行复核输出内容、检查引用，并确保任何提交内容符合所在机构的规则。"}
            </p>
            <p>
              {locale === "en"
                ? "This page is a product placeholder for the first version and should be replaced with your final legal copy before launch."
                : "这一页是第一版产品的占位 legal 页面，正式上线前应替换成你的最终法务文案。"}
            </p>
          </div>
        </Card>
      </main>
      <MarketingFooter locale={locale} nav={dict.nav} />
    </div>
  );
}
