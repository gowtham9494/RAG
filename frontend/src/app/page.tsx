"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rock-800 via-rock-700 to-rock-900">
      <div className="text-center text-white">
        <div className="w-10 h-10 mx-auto mb-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-lg">Loading Rock Insurance Portal...</p>
      </div>
    </div>
  );
}
