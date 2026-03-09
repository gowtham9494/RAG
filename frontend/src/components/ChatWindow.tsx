"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/app/chat/page";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  userInitial?: string;
}

const SUGGESTED_QUESTIONS = [
  "What are the company's core values?",
  "Tell me about the PTO policy.",
  "What benefits does Rock Insurance offer?",
  "How do I contact the IT Help Desk?",
  "What are the current business group results?",
  "Who is the CEO of Rock Insurance?",
];

export default function ChatWindow({
  messages,
  loading,
  userInitial = "U",
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex h-full w-full max-w-5xl items-center">
          <div className="w-full rounded-[32px] border border-slate-200/80 bg-white/75 p-6 shadow-[0_30px_90px_-56px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="animate-fade-up">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-950 text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.8)]">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>

                <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  AI assistant
                </p>
                <h2 className="font-display mt-3 text-4xl font-semibold leading-tight text-slate-950">
                  Ask one focused question and get to the right policy faster.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  Use the assistant for benefits, employee resources, company
                  information, and internal documentation. Answers stay tied to
                  Rock Insurance source content when available.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Summaries that are easier to scan.",
                    "Grounded answers with source references.",
                    "Faster onboarding for common employee questions.",
                    "A calmer layout that keeps the text aligned and readable.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-fade-up [animation-delay:120ms]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Suggested prompts
                </p>
                <div className="mt-4 grid gap-3">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <button
                      key={question}
                      className="group flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rock-300 hover:shadow-[0_20px_50px_-34px_rgba(30,58,95,0.45)]"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("suggestedQuestion", {
                            detail: question,
                          })
                        );
                      }}
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                        0{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-6 text-slate-900">
                          {question}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Tap to send this question immediately.
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            )}

            <div
              className={`max-w-[min(100%,46rem)] rounded-[28px] px-5 py-4 shadow-sm ${
                msg.role === "user"
                  ? "rounded-tr-lg bg-slate-950 text-white"
                  : "rounded-tl-lg border border-slate-200 bg-white text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <p
                  className={`text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                    msg.role === "user" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {msg.role === "user" ? "You" : "Rock Insurance AI"}
                </p>
                <span
                  className={`h-1 w-1 rounded-full ${
                    msg.role === "user" ? "bg-slate-500" : "bg-slate-300"
                  }`}
                />
                <p
                  className={`text-[0.68rem] ${
                    msg.role === "user" ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {msg.role === "assistant" ? (
                <div className="markdown-content mt-3 text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                  {msg.content}
                </p>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Sources
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.sources.map((src) => (
                      <span
                        key={src}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                      >
                        {src.split("/").pop() || src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-accent-400 text-sm font-semibold text-slate-950 shadow-sm">
                {userInitial}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>

            <div className="rounded-[28px] rounded-tl-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Rock Insurance AI
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-rock-400" />
                <div
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-rock-400"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-rock-400"
                  style={{ animationDelay: "0.3s" }}
                />
                <span className="ml-2 text-sm text-slate-500">
                  Thinking through the answer...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
