"use client";

interface SidebarProps {
  isOpen: boolean;
  username: string;
  fullName: string;
  onNewChat: () => void;
  onLogout: () => void;
  onToggle: () => void;
}

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
    <div className="w-72 bg-gradient-to-b from-rock-900 to-rock-800 text-white flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v5c0 4.52-3.15 8.72-7 9.93-3.85-1.21-7-5.41-7-9.93V8l7-3.82z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">Rock Insurance AI</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <svg
            className="w-4 h-4"
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

      {/* Navigation Toggle */}
      <div className="px-3 pt-3 flex gap-2">
        <a
          href="/portal"
          className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg font-medium transition-colors text-center"
        >
          Portal
        </a>
        <span className="flex-1 px-3 py-1.5 bg-rock-600 text-white text-xs rounded-lg font-medium text-center">
          AI Chat
        </span>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all text-sm"
        >
          <svg
            className="w-4 h-4"
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
          New Chat
        </button>
      </div>

      {/* Quick Topics */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3 px-1">
          Quick Topics
        </p>
        <div className="space-y-0.5">
          {[
            "Benefits & Insurance",
            "PTO & Leave",
            "Employee Handbook",
            "Remote Work Policy",
            "Business Results",
            "Staff Directory",
            "IT Help & Policies",
            "Training & Development",
            "Insurance Products",
            "Claims Process",
          ].map((label) => (
            <button
              key={label}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-white/70 hover:text-white text-left"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("suggestedQuestion", {
                    detail: `Tell me about ${label.toLowerCase()}`,
                  })
                );
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
            {(fullName || username || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {fullName || username}
            </p>
            <p className="text-xs text-white/40 truncate">@{username}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Sign out"
          >
            <svg
              className="w-4 h-4 text-white/40"
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
  );
}
