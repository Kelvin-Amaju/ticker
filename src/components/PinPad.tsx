"use client";

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  shake?: boolean;
}

export default function PinPad({
  value,
  onChange,
  length = 6,
  shake = false,
}: PinPadProps) {
  function handleKey(digit: string) {
    if (value.length >= length) return;
    onChange(value + digit);
  }

  function handleDelete() {
    onChange(value.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        className={`flex justify-center gap-3 mb-10 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border transition-colors ${
              i < value.length
                ? "bg-[var(--accent)] border-[var(--accent)]"
                : "border-[var(--border-hair)]"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key, i) => {
          if (key === "") return <div key={i} />;
          if (key === "del") {
            return (
              <button
                key={i}
                type="button"
                onClick={handleDelete}
                className="h-16 rounded-2xl flex items-center justify-center text-[var(--text-muted)] active:bg-[var(--bg-surface)] transition"
                aria-label="Delete"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6L4 12L9 18H19a1 1 0 001-1V7a1 1 0 00-1-1H9z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 10L17 14M17 10L13 14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleKey(key)}
              className="h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hair)] text-xl font-semibold text-[var(--text-primary)] active:bg-[var(--bg-surface-raised)] active:scale-95 transition"
            >
              {key}
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
