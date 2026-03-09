"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";

export default function PortalPage() {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setUsername(localStorage.getItem("username") || "");
    setFullName(localStorage.getItem("fullName") || "");

    api
      .portal()
      .then((md) => {
        setContent(md);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  // Extract section headings for the sidebar nav
  const sections = content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const title = line.replace(/^##\s+/, "");
      const id = title
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
      return { title, id };
    });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rock-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <p className="text-red-600 text-lg mb-4">Failed to load portal</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rock-600 text-white rounded-lg hover:bg-rock-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col h-screen sticky top-0 flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏢</span>
            <span className="font-semibold text-sm">Rock Insurance</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/portal")}
              className="flex-1 px-3 py-1.5 bg-rock-600 text-white text-xs rounded-lg font-medium"
            >
              📄 Portal
            </button>
            <button
              onClick={() => router.push("/chat")}
              className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg font-medium transition-colors"
            >
              💬 AI Chat
            </button>
          </div>
        </div>

        {/* Section Links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">
            Sections
          </p>
          <div className="space-y-0.5">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                  activeSection === section.id
                    ? "bg-rock-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                title={section.title}
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

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
              onClick={handleLogout}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            🏢 Rock Insurance — Employee Portal
          </h1>
        </header>

        {/* Markdown Content */}
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="markdown-content bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <ReactMarkdown
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .replace(/[^\w\s-]/g, "")
                    .trim()
                    .replace(/\s+/g, "-")
                    .toLowerCase();
                  return (
                    <h2
                      id={id}
                      className="text-2xl font-bold text-rock-800 mt-10 mb-4 pb-2 border-b border-gray-200 scroll-mt-20"
                      {...props}
                    >
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => (
                  <h3
                    className="text-xl font-semibold text-gray-800 mt-6 mb-3"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                h4: ({ children, ...props }) => (
                  <h4
                    className="text-lg font-semibold text-gray-700 mt-4 mb-2"
                    {...props}
                  >
                    {children}
                  </h4>
                ),
                p: ({ children, ...props }) => (
                  <p className="text-gray-700 leading-relaxed mb-4" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul
                    className="list-disc list-inside space-y-1 mb-4 text-gray-700"
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol
                    className="list-decimal list-inside space-y-1 mb-4 text-gray-700"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto mb-4">
                    <table
                      className="min-w-full border border-gray-200 rounded-lg overflow-hidden"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className="bg-rock-50 text-rock-800 px-4 py-2 text-left text-sm font-semibold border-b border-gray-200"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className="px-4 py-2 text-sm border-b border-gray-100"
                    {...props}
                  >
                    {children}
                  </td>
                ),
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    className="text-rock-600 hover:text-rock-800 underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-4 border-rock-400 bg-rock-50 pl-4 py-2 my-4 italic text-gray-600 rounded-r"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ children, className, ...props }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <code
                        className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-4"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="bg-gray-100 text-rock-700 px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                hr: () => <hr className="my-8 border-gray-200" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}
