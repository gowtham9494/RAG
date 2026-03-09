"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/portal");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(30,58,95,0.22),_transparent_30%),linear-gradient(160deg,_#020617,_#0f172a_55%,_#111827)]" />
      <div className="relative z-10 w-full max-w-lg rounded-[32px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.95)] backdrop-blur-xl">
        <BrandMark
          title="Employee Workspace"
          subtitle="Preparing your Rock Insurance portal"
          theme="dark"
        />
        <div className="mt-8 flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/35 px-5 py-4">
          <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
              Redirecting
            </p>
            <p className="mt-1 text-base text-slate-200">
              Checking your session and opening the right page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
