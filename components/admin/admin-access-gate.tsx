"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface AdminAccessGateProps {
  message: string;
}

export function AdminAccessGate({ message }: AdminAccessGateProps) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ secret })
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "后台登录失败，请检查密钥后重试。");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="page-container py-16 md:py-20">
      <div className="mx-auto max-w-xl card-surface rounded-[38px] p-8 md:p-10">
        <span className="eyebrow-pill text-sm font-semibold">后台访问</span>
        <h1 className="mt-5 text-3xl text-[var(--navy)] md:text-4xl">输入后台密钥后继续。</h1>
        <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{message}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--navy)]">后台密钥</span>
            <input
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[rgba(141,139,198,0.28)] focus:ring-2 focus:ring-[rgba(141,139,198,0.12)]"
              placeholder="请输入 UK Offer 后台密钥"
            />
          </label>

          {error ? (
            <div className="rounded-[24px] border border-[rgba(160,38,38,0.14)] bg-[rgba(160,38,38,0.05)] px-4 py-3 text-sm text-[#8b1e1e]">
              {error}
            </div>
          ) : null}

          <button type="submit" className="luxury-button w-full text-sm" disabled={isPending || !secret.trim()}>
            {isPending ? "正在验证..." : "进入后台"}
          </button>
        </form>
      </div>
    </section>
  );
}
