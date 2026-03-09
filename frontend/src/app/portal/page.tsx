"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import BrandMark from "@/components/BrandMark";
import { api } from "@/lib/api";

function slugify(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function extractText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement(child) && "children" in child.props) {
        return extractText(child.props.children);
      }

      return "";
    })
    .join("");
}

export default function PortalPage() {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setUsername(localStorage.getItem("username") || "");
    setFullName(localStorage.getItem("fullName") || "");

    if (window.innerWidth < 1280) {
      setNavOpen(false);
    }

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

  const sections = content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const title = line.replace(/^##\s+/, "");
      return { title, id: slugify(title) };
    });

  useEffect(() => {
    if (!activeSection && sections.length > 0) {
      setActiveSection(sections[0].id);
    }
  }, [activeSection, sections]);

  useEffect(() => {
    if (sections.length === 0) return;

    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -64% 0px",
        threshold: [0.1, 0.3, 0.6],
      }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(30,58,95,0.2),_transparent_30%),linear-gradient(165deg,_#020617,_#0f172a_58%,_#111827)]" />
        <div className="relative z-10 w-full max-w-xl rounded-[32px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.95)] backdrop-blur-xl">
          <BrandMark
            title="Employee Portal"
            subtitle="Loading company information"
            theme="dark"
          />
          <div className="mt-8 flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/35 px-5 py-4">
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
                Loading
              </p>
              <p className="mt-1 text-base text-slate-200">
                Preparing the portal sections and document content.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(30,58,95,0.18),_transparent_30%),linear-gradient(165deg,_#020617,_#0f172a_58%,_#111827)]" />
        <div className="relative z-10 w-full max-w-xl rounded-[32px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.95)] backdrop-blur-xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-red-200">
            Portal unavailable
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold">
            The company portal could not be loaded.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-200">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(30,58,95,0.2),_transparent_28%),linear-gradient(165deg,_#020617_0%,_#0f172a_58%,_#111827_100%)]" />

      <div className="relative flex min-h-screen">
        {navOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-950/45 backdrop-blur-sm xl:hidden"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-[20rem] flex-col border-r border-white/10 bg-slate-950/94 text-white shadow-[0_24px_72px_-36px_rgba(15,23,42,1)] backdrop-blur-xl transition xl:sticky xl:top-0 xl:z-auto xl:translate-x-0 xl:shadow-none ${
            navOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-white/10 px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <BrandMark
                title="Employee Portal"
                subtitle="Internal handbook and company information"
                theme="dark"
                compact
              />
              <button
                onClick={() => setNavOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white xl:hidden"
                aria-label="Close navigation"
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

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
              <span className="rounded-xl bg-white px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-sm">
                Portal
              </span>
              <button
                onClick={() => router.push("/chat")}
                className="rounded-xl px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                AI Chat
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                Portal snapshot
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/40">
                    Sections
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {sections.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/40">
                    Access
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Internal employees only
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <div className="flex items-center justify-between px-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/40">
                Sections
              </p>
              <p className="text-xs text-white/35">Jump links</p>
            </div>

            <div className="mt-4 space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => {
                    setActiveSection(section.id);
                    if (window.innerWidth < 1280) {
                      setNavOpen(false);
                    }
                  }}
                  className={`block rounded-2xl border px-4 py-3 text-sm leading-6 transition ${
                    activeSection === section.id
                      ? "border-white/20 bg-white text-slate-950 shadow-sm"
                      : "border-white/8 bg-white/5 text-slate-200 hover:border-white/15 hover:bg-white/10"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

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
                  onClick={handleLogout}
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

        <main className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
          <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-[32px] border border-white/15 bg-white/78 shadow-[0_40px_140px_-60px_rgba(15,23,42,0.95)] backdrop-blur-xl">
            <header className="border-b border-slate-200/80 bg-white/65 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  {!navOpen && (
                    <button
                      onClick={() => setNavOpen(true)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:border-rock-300 hover:text-rock-900"
                      aria-label="Open navigation"
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Company portal
                    </p>
                    <h1 className="font-display mt-1 text-3xl font-semibold text-slate-950">
                      Internal information in a cleaner reading layout.
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      Browse company content with section navigation on the left
                      and switch into AI chat whenever you want a summary or a
                      direct answer.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                    {sections.length} linked sections
                  </span>
                  <button
                    onClick={() => router.push("/chat")}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open AI chat
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <section className="grid gap-4 rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.75)] lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Reading mode
                    </p>
                    <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950">
                      Better spacing, clearer alignment, and easier scanning.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      The portal content now sits inside a wider reading surface
                      with calmer typography, smoother section jumps, and a
                      consistent page structure shared with the AI assistant.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Sections
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-950">
                        {sections.length}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Signed in
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {fullName || username}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 sm:col-span-2">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Recommended workflow
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        Read the portal for detail, then open AI chat when you
                        want a summary, comparison, or next-step answer.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.8)] sm:p-8 lg:p-10">
                  <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Portal content
                      </p>
                      <h2 className="font-display mt-2 text-3xl font-semibold text-slate-950">
                        Rock Insurance employee information
                      </h2>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                      Use the section links to jump through the document. Each
                      heading is anchored for faster navigation.
                    </p>
                  </div>

                  <div className="markdown-content">
                    <ReactMarkdown
                      components={{
                        h2: ({ children, ...props }) => {
                          const id = slugify(extractText(children));
                          return (
                            <h2
                              id={id}
                              className="font-display scroll-mt-24 border-b border-slate-200 pb-3"
                              {...props}
                            >
                              {children}
                            </h2>
                          );
                        },
                        h3: ({ children, ...props }) => (
                          <h3 className="scroll-mt-24" {...props}>
                            {children}
                          </h3>
                        ),
                        table: ({ children, ...props }) => (
                          <div className="mb-4 overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full" {...props}>
                              {children}
                            </table>
                          </div>
                        ),
                        a: ({ children, href, ...props }) => (
                          <a href={href} {...props}>
                            {children}
                          </a>
                        ),
                        code: ({ children, className, ...props }) => {
                          const isBlock = className?.includes("language-");

                          if (isBlock) {
                            return (
                              <pre>
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          }

                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
