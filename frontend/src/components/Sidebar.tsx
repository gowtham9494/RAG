"use client";

import BrandMark from "@/components/BrandMark";

interface SidebarProps {
  isOpen: boolean;
  username: string;
  fullName: string;
  onNewChat: () => void;
  onLogout: () => void;
  onToggle: () => void;
}

const QUICK_TOPICS = [
  "Benefits & Insurance",
  "PTO & Leave",
  "Employee Handbook",
  "Remote Work Policy",
  "Business Results",
  "Staff Directory",
  "IT Help & Policies",
  "Training & Development",
];

export default function Sidebar({
  isOpen,
  username,
  fullName,
  onNewChat,
  onLogout,
  onToggle,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-20 bg-slate-950/45 backdrop-blur-sm md:hidden"
        onClick={onToggle}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-30 flex w-[19rem] flex-col border-r border-white/10 bg-slate-950/94 text-white shadow-[0_24px_72px_-36px_rgba(15,23,42,1)] backdrop-blur-xl md:relative md:z-auto md:shadow-none">
        <div className="border-b border-white/10 px-5 pb-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <BrandMark
              title="AI Workspace"
              subtitle="Internal employee assistant"
              theme="dark"
              compact
            />
            <button
              onClick={onToggle}
              className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close sidebar"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
              Assistant status
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.6)]" />
              <p className="text-sm leading-6 text-slate-200">
                Ready to answer questions about internal policies, benefits,
                and employee resources.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <a
              href="/portal"
              className="rounded-xl px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Portal
            </a>
            <span className="rounded-xl bg-white px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-sm">
              AI Chat
            </span>
          </div>

          <button
            onClick={onNewChat}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Start new chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex items-center justify-between px-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/40">
              Quick topics
            </p>
            <p className="text-xs text-white/35">{QUICK_TOPICS.length} topics</p>
          </div>

          <div className="mt-4 space-y-2">
            {QUICK_TOPICS.map((label) => (
              <button
                key={label}
                className="group flex w-full items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left transition hover:border-white/15 hover:bg-white/10"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("suggestedQuestion", {
                      detail: `Tell me about ${label.toLowerCase()}.`,
                    })
                  );
                }}
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-400 transition group-hover:scale-125" />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Ask the assistant for a concise summary and next steps.
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
                {(fullName || username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {fullName || username}
                </p>
                <p className="truncate text-xs text-white/45">@{username}</p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                title="Sign out"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
