import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Card } from "@/components/ui/card";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function PrivacyPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fbfcff_100%)]">
      <MarketingHeader locale={locale} nav={dict.nav} loginLabel={dict.ui.login} ctaLabel={dict.ui.startFreeEvaluation} />
      <main className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <Card className="rounded-[34px]">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
            {locale === "en" ? "Privacy overview" : "隐私说明"}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-8 text-slate-600">
            <p>
              {locale === "en"
                ? "ScholarDesk AI is designed around user-owned content, encrypted transmission, and private-by-default workspaces."
                : "ScholarDesk AI 以用户内容归属、加密传输和默认私密工作区为基础设计。"}
            </p>
            <p>
              {locale === "en"
                ? "Files are used to support evaluation, summarization, retrieval, and project organization workflows inside the user's workspace."
                : "上传文件用于支持评估、总结、检索和项目整理等工作流，仅在用户工作区内使用。"}
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
