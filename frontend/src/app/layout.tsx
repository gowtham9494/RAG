import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rock Insurance - Employee Portal AI",
  description:
    "Ask questions about Rock Insurance policies, benefits, and company information.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
