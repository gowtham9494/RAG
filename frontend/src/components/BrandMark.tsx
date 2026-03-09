interface BrandMarkProps {
  title: string;
  subtitle: string;
  theme?: "light" | "dark";
  compact?: boolean;
}

export default function BrandMark({
  title,
  subtitle,
  theme = "light",
  compact = false,
}: BrandMarkProps) {
  const dark = theme === "dark";

  return (
    <div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl border ${
          compact ? "h-11 w-11" : "h-14 w-14"
        } ${
          dark
            ? "border-white/15 bg-white/10 text-white"
            : "border-slate-200/80 bg-slate-950 text-white shadow-[0_16px_32px_-20px_rgba(15,23,42,0.8)]"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.65),_transparent_60%)]" />
        <svg
          className={`relative z-10 ${compact ? "h-5 w-5" : "h-6 w-6"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v5c0 4.52-3.15 8.72-7 9.93-3.85-1.21-7-5.41-7-9.93V8l7-3.82z" />
        </svg>
      </div>

      <div className="min-w-0">
        <p
          className={`font-display font-semibold tracking-[0.18em] uppercase ${
            compact ? "text-[0.625rem]" : "text-[0.7rem]"
          } ${dark ? "text-white/55" : "text-slate-500"}`}
        >
          Rock Insurance
        </p>
        <h1
          className={`font-display font-semibold ${
            compact ? "text-base" : "text-2xl"
          } ${dark ? "text-white" : "text-slate-950"}`}
        >
          {title}
        </h1>
        <p
          className={`truncate ${
            compact ? "text-xs" : "text-sm"
          } ${dark ? "text-slate-300" : "text-slate-500"}`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
