export default function SplashScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--bg-base)]">
      <div className="flex items-center gap-3 animate-[fadeIn_0.6s_ease-out]">
        <div className="w-11 h-11 rounded-xl bg-[var(--accent-dim)] border border-[var(--accent)]/30 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 18L9 11L13 15L20 6"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 6H20V11"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Ticker
        </span>
      </div>
      <p className="mt-3 text-xs tracking-[0.2em] uppercase text-[var(--text-faint)]">
        NGX Portfolio
      </p>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
