"use client";

interface LiveStatsButtonProps {
  mobile?: boolean;
}

export function LiveStatsButton({ mobile = false }: LiveStatsButtonProps) {
  return (
    <a
      href="https://getsleek.io/kanba-co"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        mobile ? "h-7 text-xs" : "h-9 text-sm"
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Live Stats
    </a>
  );
}
