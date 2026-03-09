import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";

interface AuthShellProps {
  badge: string;
  headline: string;
  description: string;
  points: string[];
  cardTitle: string;
  cardDescription: string;
  cardFooter: ReactNode;
  children: ReactNode;
}

export default function AuthShell({
  badge,
  headline,
  description,
  points,
  cardTitle,
  cardDescription,
  cardFooter,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_50%,_#111827_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:88px_88px] opacity-20" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/8 shadow-[0_40px_120px_-48px_rgba(15,23,42,0.95)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative flex flex-col justify-between border-b border-white/10 p-8 text-white sm:p-10 lg:border-b-0 lg:border-r">
            <div className="space-y-8">
              <BrandMark
                title="Employee Workspace"
                subtitle="Policy search, portal access, and company knowledge in one place"
                theme="dark"
              />

              <div className="space-y-5">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                  {badge}
                </span>
                <div className="max-w-xl space-y-4">
                  <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                    {headline}
                  </h2>
                  <p className="max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                    {description}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {points.map((point, index) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4"
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                      0{index + 1}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-slate-950/35 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                Built for internal teams
              </p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
                Find employee information faster, reduce context switching,
                and keep answers grounded in the company portal and internal
                documents.
              </p>
            </div>
          </section>

          <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-xl rounded-[30px] border border-white/70 bg-white/96 p-7 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.6)] sm:p-8">
              <div className="mb-8 space-y-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Secure access
                </p>
                <h3 className="font-display text-3xl font-semibold text-slate-950">
                  {cardTitle}
                </h3>
                <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-[0.95rem]">
                  {cardDescription}
                </p>
              </div>

              {children}

              <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
                {cardFooter}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
