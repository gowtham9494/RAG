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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rock-600 to-rock-900">
      <div className="text-center text-white">
        <div className="animate-pulse text-4xl mb-4">🏢</div>
        <p className="text-lg">Loading Rock Insurance Portal...</p>
      </div>
    </div>
  );
}
