"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Portfolio",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 18L9 11L13 15L20 6M15 6H20V11"
          stroke={active ? "var(--accent)" : "currentColor"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/stocks",
    label: "Stocks",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke={active ? "var(--accent)" : "currentColor"} strokeWidth="1.8" />
        <path d="M20 20L16 16" stroke={active ? "var(--accent)" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "var(--accent)" : "none"}>
        <path
          d="M12 19l-1.1-1C6 13.9 3 11.2 3 7.9 3 5.7 4.8 4 7 4c1.3 0 2.6.6 3.5 1.7l1.5 1.6 1.5-1.6C14.4 4.6 15.7 4 17 4c2.2 0 4 1.7 4 3.9 0 3.3-3 6-7.9 10.1L12 19z"
          stroke={active ? "var(--accent)" : "currentColor"}
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    href: "/whale-watch",
    label: "Whales",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 13c2-4 6-6 10-6 4.5 0 8 3 8 3s-1 4-4.5 5.5C13 17 8 17 5 15"
          stroke={active ? "var(--accent)" : "currentColor"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="16" cy="9.5" r="0.9" fill={active ? "var(--accent)" : "currentColor"} />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? "var(--accent)" : "currentColor"} strokeWidth="1.8" />
        <path
          d="M19.4 13.5c.04-.5.04-1 0-1.5l1.9-1.5-2-3.4-2.2.9c-.4-.3-.8-.6-1.3-.8L15.4 5h-4l-.4 2.2c-.5.2-.9.5-1.3.8l-2.2-.9-2 3.4L7.4 12c-.04.5-.04 1 0 1.5l-1.9 1.5 2 3.4 2.2-.9c.4.3.8.6 1.3.8l.4 2.2h4l.4-2.2c.5-.2.9-.5 1.3-.8l2.2.9 2-3.4-1.9-1.5z"
          stroke={active ? "var(--accent)" : "currentColor"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-lg border-t border-[var(--border-hair)] safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-[var(--text-faint)] transition-colors"
            >
              {tab.icon(active)}
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-[var(--accent)]" : "text-[var(--text-faint)]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
