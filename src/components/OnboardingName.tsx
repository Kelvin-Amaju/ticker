"use client";

import { useState } from "react";
import { useAppData } from "@/context/AppDataContext";

export default function OnboardingName() {
  const { setPendingName, advanceToOnboardingPin } = useAppData();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setPendingName(trimmed);
    advanceToOnboardingPin();
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 bg-[var(--bg-base)]">
      <div className="max-w-sm mx-auto w-full">
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-2">
          Step 1 of 2
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Who&apos;s tracking?
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          This appears on your dashboard. Nothing here ever leaves your device.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Full name or business name"
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full rounded-xl bg-[var(--accent)] text-[#04140d] font-semibold py-3.5 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
