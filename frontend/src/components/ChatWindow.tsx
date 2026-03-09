"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/app/chat/page";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">🏢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Welcome to Rock Insurance AI
          </h2>
          <p className="text-gray-500 mb-8">
            I can help you find information about company policies, benefits,
            employee resources, and more. Try asking me a question!
          </p>

          {/* Example questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "What are the company's core values?",
              "Tell me about the PTO policy",
              "What are the business group results?",
              "How do I contact the IT Help Desk?",
              "What benefits does Rock Insurance offer?",
              "Who is the CEO of Rock Insurance?",
            ].map((q) => (
              <button
                key={q}
                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-rock-400 hover:bg-rock-50 transition-all text-sm text-gray-700"
                onClick={() => {
                  // Trigger the question in parent - we'll use a custom event
                  window.dispatchEvent(
                    new CustomEvent("suggestedQuestion", { detail: q })
                  );
                }}
              >
                <span className="text-rock-500 mr-2">→</span>
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
              <div className="flex-shrink-0 w-8 h-8 bg-rock-100 rounded-full flex items-center justify-center text-sm">
                🤖
              </div>
            )}

            <div
              className={`max-w-[85%] ${
                msg.role === "user"
                  ? "bg-rock-600 text-white rounded-2xl rounded-tr-md px-4 py-3"
                  : "bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm"
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
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    📄 Sources:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {src.split("/").pop() || src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p
                className={`text-[10px] mt-1 ${
                  msg.role === "user" ? "text-rock-200" : "text-gray-400"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 bg-rock-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                👤
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-rock-100 rounded-full flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
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
