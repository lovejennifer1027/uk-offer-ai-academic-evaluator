import { SubmissionForm } from "@/components/submission-form";
import { PageShell } from "@/components/page-shell";

const workspaceSignals = [
  {
    label: "输入方式",
    value: "粘贴或上传",
    detail: "支持直接粘贴文本，也支持 PDF、DOCX、TXT 文件。"
  },
  {
    label: "评估逻辑",
    value: "老师要求优先",
    detail: "当老师提供评分标准或作业说明时，会优先按要求评分。"
  },
  {
    label: "输出形式",
    value: "稳定结构化",
    detail: "固定返回总分、五维评分与简洁的导师式反馈。"
  }
];

export default function EvaluatePage() {
  return (
    <PageShell>
      <section className="page-container py-14 md:py-18">
        <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
          <div className="max-w-4xl">
            <span className="eyebrow-pill text-sm font-semibold">论文评估工作台</span>
            <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl">
              把论文和老师要求放进同一个工作台，一次生成正式报告。
            </h1>
            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              这一页按更成熟的产品体验重构过，重点是“立即开始输入”和“清楚知道会输出什么”，而不是堆叠很多展示性文案。
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <span className="quiet-badge">形成性学术反馈</span>
              <span className="quiet-badge">服务端安全处理</span>
              <span className="quiet-badge">结构化结果更适合产品化</span>
            </div>
          </div>

          <div className="card-surface rounded-[38px] p-7 md:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {workspaceSignals.map((item) => (
                <article key={item.label} className="surface-inset rounded-[28px] p-5">
                  <p className="text-sm font-semibold text-[var(--gold)]">{item.label}</p>
                  <h2 className="mt-3 text-xl text-[var(--navy)]">{item.value}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <SubmissionForm />
        </div>
      </section>
    </PageShell>
  );
}
