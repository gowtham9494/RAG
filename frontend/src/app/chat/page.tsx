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
    [input, loading, sessionId, router]
  );

  // Bug fix: Listen for suggestedQuestion custom events and auto-send
  useEffect(() => {
    const handler = (e: Event) => {
      const question = (e as CustomEvent).detail;
      if (question) {
        pendingQuestionRef.current = question;
        setInput(question);
      }
    };
    window.addEventListener("suggestedQuestion", handler);
    return () => window.removeEventListener("suggestedQuestion", handler);
  }, []);

  // When input changes from a suggested question, auto-send it
  useEffect(() => {
    if (pendingQuestionRef.current && input === pendingQuestionRef.current) {
      pendingQuestionRef.current = null;
      handleSend(input);
    }
  }, [input, handleSend]);

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        username={username}
        fullName={fullName}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <svg
                className="w-5 h-5 text-slate-600"
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-rock-700 to-rock-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800">
                Rock Insurance AI Assistant
              </h1>
              <p className="text-xs text-slate-500">
                Ask me anything about company policies, benefits, and more
              </p>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <ChatWindow
          messages={messages}
          loading={loading}
          userInitial={(fullName || username || "U").charAt(0).toUpperCase()}
        />

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about benefits, policies, company info..."
                rows={1}
                className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rock-400 focus:border-transparent focus:bg-white outline-none transition-all max-h-32"
                style={{
                  height: "auto",
                  minHeight: "48px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 128) + "px";
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-br from-rock-700 to-rock-900 hover:shadow-card-hover text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                    className="w-5 h-5"
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
            <p className="text-xs text-slate-400 mt-2 text-center">
              Answers are generated from Rock Insurance internal documents.
              Always verify critical information with the relevant department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
