"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(username, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("fullName", data.full_name || data.username);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Employee access"
      headline="Get to the answers without hunting through documents."
      description="Sign in to open the company portal, search benefits and policies, and use the internal AI assistant from the same workspace."
      points={[
        "A cleaner dashboard for portal reading and policy lookup.",
        "Fast answers grounded in internal Rock Insurance content.",
        "Responsive layouts that stay readable on laptops and smaller screens.",
      ]}
      cardTitle="Sign in"
      cardDescription="Use your Rock Insurance account to continue into the employee workspace."
      cardFooter={
        <p>
          Need an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-rock-700 underline decoration-rock-300 underline-offset-4 hover:text-rock-900"
          >
            Create one here
          </Link>
          .
        </p>
      }
    >
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-slate-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-rock-300 focus:bg-white focus:ring-4 focus:ring-rock-100"
            placeholder="Enter your username"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-rock-300 focus:bg-white focus:ring-4 focus:ring-rock-100"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div>
            <p className="font-semibold text-slate-700">Workspace access</p>
            <p className="text-slate-500">Portal, AI chat, and internal docs</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            Internal
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
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
              Signing in
            </>
          ) : (
            "Open workspace"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
