"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/types/scholardesk";

export function CredentialsForm({ mode, locale }: { mode: "login" | "signup"; locale: Locale }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = {
    title:
      mode === "login"
        ? locale === "en"
          ? "Log in to ScholarDesk AI"
          : "登录 ScholarDesk AI"
        : locale === "en"
          ? "Create your ScholarDesk AI account"
          : "创建你的 ScholarDesk AI 账户",
    name: locale === "en" ? "Name" : "姓名",
    email: locale === "en" ? "Email" : "邮箱",
    password: locale === "en" ? "Password" : "密码",
    wait: locale === "en" ? "Please wait..." : "请稍候...",
    submit:
      mode === "login"
        ? locale === "en"
          ? "Log in"
          : "登录"
        : locale === "en"
          ? "Create account"
          : "创建账户",
    fallbackError: locale === "en" ? "Authentication failed." : "认证失败。"
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Authentication failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.fallbackError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-[32px] p-8">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">{copy.title}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {mode === "signup" ? (
          <div>
            <label className="text-sm font-semibold text-slate-800">{copy.name}</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} className="mt-2" required />
          </div>
        ) : null}
        <div>
          <label className="text-sm font-semibold text-slate-800">{copy.email}</label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" type="email" required />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">{copy.password}</label>
          <Input value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" type="password" required />
        </div>
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? copy.wait : copy.submit}
        </Button>
      </form>
    </Card>
  );
}
