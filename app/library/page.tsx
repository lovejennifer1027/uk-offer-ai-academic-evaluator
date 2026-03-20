import Link from "next/link";

import { PageShell } from "@/components/page-shell";

const workflowCards = [
  {
    label: "模块 1",
    title: "实时高分案例生成",
    detail: "按学科、层级、作业类型和目标分数段，几秒内生成高分示句、段落模板、表达框架和写法说明。"
  },
  {
    label: "模块 2",
    title: "积累层",
    detail: "每次生成的示例都会保存在当前浏览器里，方便你稍后继续回看、比较和整理自己的训练素材。"
  },
  {
    label: "模块 3",
    title: "AI 洞察分析",
    detail: "把已积累的示例重新交给模型，总结哪些句式、结构和论证动作反复出现。"
  }
];

export default function LibraryHomePage() {
  return (
    <PageShell>
      <section className="hero-shell pb-18 pt-14 md:pb-24 md:pt-18">
        <div className="page-container">
          <div className="card-surface rounded-[42px] p-8 md:p-12">
            <span className="eyebrow-pill text-sm font-semibold">UK Offer AI High-Scoring Writing Library</span>
            <h1 className="mt-6 max-w-4xl text-4xl text-[var(--navy)] md:text-6xl">
              面向学习与训练的 AI 高分写作示例库。
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)]">
              这里不是公开来源全文库，而是一个 AI-only 工作流：先实时生成高分示句、段落模板和表达框架，再把这些结果积累起来，继续做模式分析和写作训练。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/library/examples" className="luxury-button text-sm">
                进入高分案例生成
              </Link>
              <Link href="/library/insights" className="luxury-button-muted text-sm">
                分析已积累示例
              </Link>
              <Link href="/library/rubrics" className="luxury-button-muted text-sm">
                查看评分标准参考
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {workflowCards.map((card) => (
            <article key={card.title} className="card-surface rounded-[30px] p-6">
              <p className="text-sm font-semibold text-[var(--gold)]">{card.label}</p>
              <h2 className="mt-3 text-2xl text-[var(--navy)]">{card.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-container py-10 md:py-14">
        <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <article className="card-surface rounded-[34px] p-7 md:p-8">
            <span className="eyebrow-pill text-sm font-semibold">这条路线适合什么</span>
            <h2 className="mt-5 text-3xl text-[var(--navy)]">适合先做 AI-only 产品，而不是先被数据库绑住。</h2>
            <ul className="mt-5 space-y-3 text-sm leading-8 text-[var(--muted)]">
              <li>适合先做“上传 essay 评分 + 高分写作训练”这两个核心模块。</li>
              <li>适合让学生、家长和顾问先看到一个直接可用、几秒有反馈的产品。</li>
              <li>适合先验证哪些学科、分数段和写作任务最值得继续扩展。</li>
            </ul>
          </article>

          <article className="card-surface rounded-[34px] p-7 md:p-8">
            <span className="eyebrow-pill text-sm font-semibold">使用边界</span>
            <h2 className="mt-5 text-3xl text-[var(--navy)]">所有案例都必须被明确标记为 AI-generated。</h2>
            <ul className="mt-5 space-y-3 text-sm leading-8 text-[var(--muted)]">
              <li>这些内容用于训练和理解高分写法，不是任何大学官方样本。</li>
              <li>系统不会暗示大学 endorsement，也不会伪装成真实学生原文。</li>
              <li>如果后续接入数据库，可以把“积累层”升级成可跨设备持久保存的正式案例池。</li>
            </ul>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
