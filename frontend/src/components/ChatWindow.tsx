"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/app/chat/page";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  userInitial?: string;
}

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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          {/* Navy gradient logo */}
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-rock-700 to-rock-900 rounded-2xl flex items-center justify-center shadow-card">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Welcome to Rock Insurance AI
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            I can help you find information about company policies, benefits,
            employee resources, and more.
          </p>

          {/* Suggested Questions */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Suggested Questions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              "What are the company's core values?",
              "Tell me about the PTO policy",
              "What benefits does Rock Insurance offer?",
              "How do I contact the IT Help Desk?",
              "What are the business group results?",
              "Who is the CEO of Rock Insurance?",
            ].map((q) => (
              <button
                key={q}
                className="group text-left px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-card-hover hover:border-rock-300 transition-all text-sm text-slate-700"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("suggestedQuestion", { detail: q })
                  );
                }}
              >
                <span className="text-accent-500 mr-2 group-hover:translate-x-0.5 inline-block transition-transform">
                  &rarr;
                </span>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rock-700 to-rock-900 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            )}

            <div
              className={`max-w-[85%] ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-rock-700 to-rock-900 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-card"
                  : "bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-card"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="markdown-content text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {src.split("/").pop() || src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p
                className={`text-[10px] mt-1 ${
                  msg.role === "user" ? "text-rock-300" : "text-slate-400"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rock-700 to-rock-900 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {userInitial}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rock-700 to-rock-900 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-card">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-rock-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-rock-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="w-2 h-2 bg-rock-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
