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

const liveSignals = [
  "接收论文正文与文件",
  "读取老师要求与评分标准",
  "输出正式评估报告"
];

export default function EvaluatePage() {
  return (
    <PageShell>
      <section className="hero-shell relative overflow-hidden py-14 md:py-18">
        <div className="page-container grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
          <div className="reading-column">
            <span className="eyebrow-pill text-sm font-semibold">论文评估工作台</span>
            <h1 className="mt-6 text-4xl text-[var(--navy)] md:text-5xl xl:text-6xl">
              把论文和老师要求放进同一个工作台，一次生成正式报告。
            </h1>
            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              这一页会更像任务型产品，而不是单纯的上传表单。你先放入论文和老师要求，系统再按一条清晰流程完成结构识别、标准匹配和五维评分生成。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="quiet-badge">形成性学术反馈</span>
              <span className="quiet-badge">服务端安全处理</span>
              <span className="quiet-badge">更适合正式展示</span>
            </div>
          </div>

          <div className="story-shell rounded-[40px] p-7 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">实时流程预览</p>
                <h2 className="mt-4 text-2xl text-[var(--navy)] md:text-3xl">用户提交后，系统会按这条顺序处理。</h2>
              </div>
              <span className="signal-status">
                <span className="signal-dot is-live" />
                准备开始
              </span>
            </div>

            <div className="signal-bar mt-6">
              {liveSignals.map((item, index) => (
                <div key={item} className="signal-row">
                  <div>
                    <strong>{item}</strong>
                    <span className="mt-1 block">第 {index + 1} 步</span>
                  </div>
                  <span className="signal-status">
                    <span className={`signal-dot ${index === 1 ? "is-live" : ""}`} />
                    {index === 0 ? "待输入" : index === 1 ? "处理中" : "待输出"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {workspaceSignals.map((item) => (
                <article key={item.label} className="stat-tile">
                  <div className="stat-tile-label">{item.label}</div>
                  <div className="stat-tile-value">{item.value}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container pb-18 md:pb-24">
        <SubmissionForm />
      </section>
    </PageShell>
  );
}
