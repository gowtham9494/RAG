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
    <div className="w-72 bg-gray-900 text-white flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <span className="font-semibold text-sm">Rock Insurance AI</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
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
          className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg font-medium transition-colors text-center"
        >
          📄 Portal
        </a>
        <span className="flex-1 px-3 py-1.5 bg-rock-600 text-white text-xs rounded-lg font-medium text-center">
          💬 AI Chat
        </span>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm"
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
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">
          Quick Topics
        </p>
        <div className="space-y-1">
          {[
            { icon: "🏥", label: "Benefits & Insurance" },
            { icon: "🏖️", label: "PTO & Leave" },
            { icon: "📖", label: "Employee Handbook" },
            { icon: "🏠", label: "Remote Work Policy" },
            { icon: "💼", label: "Business Results" },
            { icon: "📁", label: "Staff Directory" },
            { icon: "🖥️", label: "IT Help & Policies" },
            { icon: "🎓", label: "Training & Development" },
            { icon: "🛡️", label: "Insurance Products" },
            { icon: "📝", label: "Claims Process" },
          ].map((topic) => (
            <button
              key={topic.label}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm text-gray-300 hover:text-white text-left"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("suggestedQuestion", {
                    detail: `Tell me about ${topic.label.toLowerCase()}`,
                  })
                );
              }}
            >
              <span>{topic.icon}</span>
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rock-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {(fullName || username || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {fullName || username}
            </p>
            <p className="text-xs text-gray-400 truncate">@{username}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Sign out"
          >
            <svg
              className="w-4 h-4 text-gray-400"
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
