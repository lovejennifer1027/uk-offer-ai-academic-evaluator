"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessageRecord, EvidenceSnippet, ProjectLanguage } from "@/types/scholardesk";

export function ChatInterface({
  projectId,
  initialMessages,
  language
}: {
  projectId: string;
  initialMessages: ChatMessageRecord[];
  language: ProjectLanguage;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [citations, setCitations] = useState<EvidenceSnippet[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          language,
          question
        })
      });

      const payload = (await response.json()) as {
        answer: string;
        sourcesUsed: EvidenceSnippet[];
      };

      setMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          threadId: "workspace",
          role: "user",
          content: question,
          citationsJson: [],
          createdAt: new Date().toISOString()
        },
        {
          id: `assistant-${Date.now()}`,
          threadId: "workspace",
          role: "assistant",
          content: payload.answer,
          citationsJson: payload.sourcesUsed,
          createdAt: new Date().toISOString()
        }
      ]);
      setCitations(payload.sourcesUsed);
      setQuestion("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[30px]">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-[22px] px-4 py-4 text-sm leading-7 ${
                message.role === "assistant" ? "bg-slate-50 text-slate-700" : "bg-indigo-50 text-slate-900"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your uploaded materials..." />
          <div className="mt-3 flex justify-end">
            <Button onClick={handleAsk} disabled={loading}>
              {loading ? "Thinking..." : "Ask"} <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <Card className="rounded-[30px]">
        <h3 className="text-lg font-semibold text-slate-950">Retrieved context</h3>
        <div className="mt-4 space-y-3">
          {citations.length === 0 ? (
            <div className="text-sm text-slate-500">Relevant snippets will appear here once the assistant answers.</div>
          ) : (
            citations.map((item) => (
              <div key={`${item.fileId}-${item.snippet}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-900">{item.filename}</div>
                <div className="mt-2 leading-7">{item.snippet}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
