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
      className={`group relative flex items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-400 shadow transition-all duration-300 ease-out hover:bg-emerald-900/50 hover:ring-2 hover:ring-emerald-500/50 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-950/40 dark:border-emerald-500/30 ${
        mobile
          ? "h-7 max-w-36 text-xs px-2 py-1"
          : "h-9 max-w-52 md:flex"
      }`}
    >
      <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-emerald-400 opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"></span>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className={`font-medium ${mobile ? "text-xs" : "text-sm"}`}>
        Live Stats
      </span>
    </a>
  );
}
