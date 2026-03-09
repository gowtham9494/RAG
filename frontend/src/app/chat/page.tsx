"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pendingQuestionRef = useRef<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setUsername(localStorage.getItem("username") || "");
    setFullName(localStorage.getItem("fullName") || "");

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [router]);

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = overrideInput ?? input;
      if (!text.trim() || loading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await api.chat(userMessage.content, token, sessionId);
        setSessionId(data.session_id);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        if (err.message?.includes("401") || err.message?.includes("token")) {
          localStorage.clear();
          router.push("/login");
          return;
        }

        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your question. Please try again or contact the IT Help Desk at ext. 5000.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, router, sessionId]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const question = (e as CustomEvent).detail;
      if (!question) return;

      pendingQuestionRef.current = question;
      setInput(question);

      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("suggestedQuestion", handler);
    return () => window.removeEventListener("suggestedQuestion", handler);
  }, []);

  useEffect(() => {
    if (pendingQuestionRef.current && input === pendingQuestionRef.current) {
      pendingQuestionRef.current = null;
      handleSend(input);
    }
  }, [handleSend, input]);

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setInput("");

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(30,58,95,0.2),_transparent_28%),linear-gradient(165deg,_#020617_0%,_#0f172a_58%,_#111827_100%)]" />

      <div className="relative flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          username={username}
          fullName={fullName}
          onNewChat={handleNewChat}
          onLogout={handleLogout}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
          <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-1 overflow-hidden rounded-[32px] border border-white/15 bg-white/78 shadow-[0_40px_140px_-60px_rgba(15,23,42,0.95)] backdrop-blur-xl">
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="border-b border-slate-200/80 bg-white/65 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-3">
                    {!sidebarOpen && (
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:border-rock-300 hover:text-rock-900"
                        aria-label="Open sidebar"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </button>
                    )}

                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-sm">
                      <svg
                        className="h-5 w-5"
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

                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Employee assistant
                      </p>
                      <h1 className="font-display mt-1 text-3xl font-semibold text-slate-950">
                        Ask about policies, benefits, and company information.
                      </h1>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Answers are generated from Rock Insurance internal
                        materials. Keep questions focused to get cleaner,
                        better-aligned responses.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                      Secure internal knowledge
                    </span>
                    <button
                      onClick={handleNewChat}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      New chat
                    </button>
                  </div>
                </div>
              </header>

              <ChatWindow
                messages={messages}
                loading={loading}
                userInitial={(fullName || username || "U").charAt(0).toUpperCase()}
              />

              <div className="border-t border-slate-200/80 bg-white/70 px-4 py-4 sm:px-6">
                <div className="mx-auto w-full max-w-4xl rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.7)]">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about benefits, policies, company information, or internal contacts..."
                      rows={1}
                      className="min-h-[78px] flex-1 resize-none rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition focus:border-rock-300 focus:bg-white focus:ring-4 focus:ring-rock-100"
                      style={{
                        height: "auto",
                        maxHeight: "176px",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 176) + "px";
                      }}
                    />

                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                    >
                      {loading ? (
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 px-2 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Verify critical information with the relevant department
                      before acting on it.
                    </p>
                    <p>Press Enter to send. Use Shift+Enter for a new line.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
