import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { BRAND_NAME, FORMATIVE_DISCLAIMER, ORGANISATION_NAME } from "@/lib/constants";

const heroMetrics = [
  {
    value: "100 分",
    label: "固定总分制，始终由五个维度精确相加。"
  },
  {
    value: "5 项",
    label: "结构、批判性思维、文献使用、引用规范、语言表达。"
  },
  {
    value: "UK 标准",
    label: "优先遵循老师要求，必要时回退到英国高校学术写作标准。"
  }
];

const heroAnalysisSignals = [
  {
    title: "论文结构识别",
    status: "已完成"
  },
  {
    title: "老师要求匹配",
    status: "进行中"
  },
  {
    title: "五维评分生成",
    status: "等待输出"
  }
];

const credibilityPoints = [
  {
    title: "更像顾问工作台",
    description:
      "首页与评估页都围绕“快速进入正式评估”设计，而不是展示型学生页面。"
  },
  {
    title: "更适合家长与高价值客户",
    description:
      "措辞、结构和视觉节奏都偏成熟克制，更适合教育咨询和正式演示场景。"
  },
  {
    title: "服务端安全执行",
    description:
      "文件在服务端解析与校验，OpenAI 密钥不会出现在前端，输出再经过严格 Schema 验证。"
  }
];

const processSteps = [
  {
    step: "01",
    title: "放入论文内容",
    description: "支持直接粘贴，也支持上传 PDF、DOCX、TXT 文件。"
  },
  {
    step: "02",
    title: "补充老师要求",
    description: "把作业说明、评分标准或评分量表一起提交。"
  },
  {
    step: "03",
    title: "收到正式报告",
    description: "返回总分、五维分数、总体反馈、优点、不足和修改建议。"
  }
];

const scoringDimensions = [
  {
    label: "结构",
    score: "20",
    detail: "文章组织、逻辑连贯性与段落推进是否清楚。"
  },
  {
    label: "批判性思维",
    score: "20",
    detail: "分析、比较、评价与论证深度是否到位。"
  },
  {
    label: "文献使用",
    score: "20",
    detail: "文献选择、整合方式和证据支撑是否充分。"
  },
  {
    label: "引用规范",
    score: "20",
    detail: "引用格式、准确性与一致性是否符合要求。"
  },
  {
    label: "语言表达",
    score: "20",
    detail: "学术语言是否准确、清晰并维持正式语气。"
  }
];

const reasons = [
  {
    title: "先看到真实问题，再决定是否继续辅导",
    description:
      "报告更适合作为第一轮筛查，帮助学生和家长判断论文真正的问题集中在哪里。"
  },
  {
    title: "适合演示给客户，而不是只适合学生自己用",
    description:
      "从文案到界面都保持正式可信，更符合教育机构、顾问和高端家长沟通场景。"
  },
  {
    title: "可以自然衔接 UK Offer 后续服务",
    description:
      "评估结果能直接过渡到学术辅导、修改规划与国际教育咨询服务。"
  }
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="hero-shell relative overflow-hidden pb-24 pt-14 md:pb-28 md:pt-20">
        <div className="page-container grid gap-10 xl:grid-cols-[1.04fr_0.96fr] xl:items-center">
          <div className="relative z-10">
            <span className="eyebrow-pill text-sm font-semibold">{ORGANISATION_NAME}</span>
            <h1 className="mt-7 max-w-5xl text-5xl leading-[1.02] text-[var(--navy)] md:text-6xl xl:text-7xl">
              先别急着改论文，先让 AI 告诉你最可能丢分的地方。
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-9 text-[var(--muted)]">
              {BRAND_NAME} 把论文初评、老师要求和正式报告整合成一条更像真实教育产品的工作流。你上传论文和评分标准后，系统会在几秒内返回更正式、更稳定、也更适合咨询场景展示的形成性评估结果。
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/evaluate" className="luxury-button text-sm">
                立即开始评估
              </Link>
              <Link href="/history" className="luxury-button-muted text-sm">
                查看历史报告
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="quiet-badge">优先参考老师要求</span>
              <span className="quiet-badge">支持 PDF / DOCX / TXT</span>
              <span className="quiet-badge">AI 几秒内返回结果</span>
            </div>

            <div className="mt-11 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((item) => (
                <div key={item.value} className="story-metric">
                  <div className="story-metric-value">{item.value}</div>
                  <div className="story-metric-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="story-shell relative z-10 overflow-hidden rounded-[44px] p-7 md:p-10">
            <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(160,189,229,0.2),transparent)]" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">实时评估预览</p>
                  <h2 className="mt-4 text-2xl text-[var(--navy)] md:text-3xl">
                    像真实 AI 工作台，而不是普通展示型首页。
                  </h2>
                </div>
                <span className="signal-status">
                  <span className="signal-dot is-live" />
                  AI 正在评估
                </span>
              </div>

              <div className="mt-7 space-y-5">
                <article className="rounded-[32px] border border-[rgba(59,76,107,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,245,252,0.96))] p-6 text-[var(--navy)] shadow-[0_18px_42px_rgba(67,84,120,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Essay draft uploaded</p>
                    <span className="rounded-full border border-[rgba(59,76,107,0.08)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                      2 min ago
                    </span>
                  </div>
                  <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                    论文正文与老师要求被放进同一个流程里，系统正在先识别结构、要求匹配和维度风险，再生成最终报告。
                  </p>
                </article>

                <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                  <article className="surface-inset rounded-[32px] p-6">
                    <p className="text-sm font-semibold text-[var(--navy)]">分析进度</p>
                    <div className="signal-bar mt-5">
                      {heroAnalysisSignals.map((item) => (
                        <div key={item.title} className="signal-row">
                          <div>
                            <strong>{item.title}</strong>
                            <span className="mt-1 block">系统正在生成正式评估报告</span>
                          </div>
                          <span className="signal-status">
                            <span className={`signal-dot ${item.status === "进行中" ? "is-live" : ""}`} />
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-[32px] border border-[var(--line)] bg-white/92 p-6 shadow-[0_16px_36px_rgba(67,84,120,0.06)]">
                    <p className="text-sm font-semibold text-[var(--gold)]">预览评分</p>
                    <p className="mt-4 text-5xl font-semibold text-[var(--navy)]">
                      74
                      <span className="ml-2 text-lg font-medium text-[var(--muted)]">/100</span>
                    </p>
                    <div className="soft-divider my-5" />
                    <div className="space-y-3 text-sm text-[var(--muted)]">
                      <div className="flex items-center justify-between gap-3">
                        <span>结构</span>
                        <strong className="text-[var(--navy)]">15 / 20</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>批判性思维</span>
                        <strong className="text-[var(--navy)]">14 / 20</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>引用规范</span>
                        <strong className="text-[var(--navy)]">13 / 20</strong>
                      </div>
                    </div>
                  </article>
                </div>

                <article className="rounded-[32px] border border-[rgba(141,139,198,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(244,246,252,0.92))] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--navy)]">最终输出</p>
                    <span className="text-xs font-semibold text-[var(--gold)]">严格 JSON Schema</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["总分 + 五维分数", "总体反馈 + 优点 / 不足", "修改建议 + 免责声明"].map((item) => (
                      <div
                        key={item}
                        className="rounded-[24px] border border-[rgba(59,76,107,0.06)] bg-white px-4 py-4 text-sm text-[var(--muted)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-6 md:py-10">
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="story-shell rounded-[38px] p-8 md:p-10">
            <span className="eyebrow-pill text-sm font-semibold">为什么这套体验更像商业产品</span>
            <h2 className="mt-5 text-3xl text-[var(--navy)] md:text-4xl">
              不是一堆卡片拼起来，而是先让客户立刻理解“现在发生了什么”。
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              参考你给的页面方向，这一版首页会更强调“AI 正在帮你处理问题”的感觉。对家长、学生和咨询客户来说，这种结构比平铺介绍更容易信任，也更容易理解产品价值。
            </p>
          </article>

          <div className="grid gap-5 lg:grid-cols-3">
            {credibilityPoints.map((item) => (
              <article key={item.title} className="card-surface rounded-[36px] p-7">
                <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">可信特征</p>
                <h2 className="mt-4 text-2xl text-[var(--navy)]">{item.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-18 md:py-24">
        <div className="process-band rounded-[42px] p-8 md:p-10">
          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">使用流程</span>
              <h2 className="mt-5 text-3xl text-[var(--navy)] md:text-4xl">
                把输入、标准和反馈放进一条清楚的工作流。
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
                这一版把“马上开始使用”和“系统怎么一步步处理”都放到了更前面。用户不需要先读很久，先理解三步，然后直接进入评估。
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {processSteps.map((step) => (
                <article key={step.step} className="process-step-card">
                  <span className="process-step-number">{step.step}</span>
                  <h3 className="mt-4 text-2xl text-[var(--navy)]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-8 md:py-12">
        <div className="grid gap-9 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="story-shell rounded-[40px] p-8 md:p-10">
            <p className="section-eyebrow text-sm font-semibold text-[var(--gold)]">评分维度</p>
            <h2 className="mt-4 text-3xl text-[var(--navy)] md:text-4xl">分数结构要清楚，报告也要一眼能读懂。</h2>
            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              我们保留正式、克制的学术语气，但页面本身更接近成熟产品界面：信息层次更简单，重点更靠前，报告逻辑也更像真实商业服务。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scoringDimensions.map((item) => (
              <article key={item.label} className="card-surface rounded-[34px] p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                    <p className="mt-3 text-4xl font-semibold text-[var(--navy)]">
                      {item.score}
                      <span className="ml-1 text-base font-medium text-[var(--muted)]">/20</span>
                    </p>
                  </div>
                  <span className="rounded-full bg-[rgba(141,139,198,0.1)] px-3 py-2 text-xs font-semibold text-[var(--navy)]">
                    评分项
                  </span>
                </div>
                <p className="mt-5 text-sm leading-8 text-[var(--muted)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="advisory-services" className="page-container py-18 md:py-24">
        <div className="dark-panel rounded-[42px] p-9 text-white md:p-11">
          <div className="grid gap-9 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <div>
              <p className="section-eyebrow text-sm font-semibold text-[var(--gold-soft)]">
                为什么用 UK Offer AI 评估
              </p>
              <h2 className="mt-4 text-3xl md:text-4xl">
                这不是学生练手页，而是面向正式咨询场景的商业化产品界面。
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
                首页、评估页和结果页都会继续沿着“更像真实商业 SaaS、更少展示感、更强任务引导”的方向优化，同时保留 UK Offer 更正式、更可信的学术服务定位。
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {reasons.map((reason) => (
                <article
                  key={reason.title}
                  className="rounded-[30px] border border-white/14 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <h3 className="text-2xl text-white">{reason.title}</h3>
                  <p className="mt-4 text-sm leading-8 text-white/70">{reason.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container pb-24">
        <div className="story-shell rounded-[42px] p-9 md:p-11">
          <div className="grid gap-9 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div>
              <span className="eyebrow-pill text-sm font-semibold">免责声明与行动入口</span>
              <h2 className="mt-5 text-3xl text-[var(--navy)] md:text-4xl">
                明确定位为形成性反馈，但足够正式、足够好看，也足够可信。
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-8 text-[var(--muted)]">{FORMATIVE_DISCLAIMER}</p>
            </div>

            <div className="rounded-[34px] border border-[rgba(59,76,107,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,247,253,0.94))] p-7">
              <p className="text-sm font-semibold text-[var(--navy)]">现在就可以进入评估工作台</p>
              <p className="mt-3 text-sm leading-8 text-[var(--muted)]">
                直接粘贴论文，或上传文件后开始。评估完成后，报告会同步进入历史记录页面，便于继续查看和演示。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/evaluate" className="luxury-button text-sm">
                  进入评估页
                </Link>
                <Link href="/history" className="luxury-button-muted text-sm">
                  查看报告记录
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
