"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { verifyPasscode } from "@/lib/crypto";
import PinPad from "./PinPad";

export default function LockScreen() {
  const { appData, unlock } = useAppData();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length !== 6) return;
    const timer = setTimeout(async () => {
      const isValid = await verifyPasscode(pin, appData.user_profile.pin_hash);
      if (isValid) {
        unlock();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 450);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [pin, appData.user_profile.pin_hash, unlock]);

  const firstName = appData.user_profile.display_name.split(" ")[0];

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 bg-[var(--bg-base)]">
      <div className="max-w-sm mx-auto w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/30 flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="var(--accent)" strokeWidth="1.8" />
            <path d="M8 11V8a4 4 0 018 0v3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight mb-1">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          Enter your passcode to continue
        </p>
        <PinPad value={pin} onChange={setPin} shake={error} />
        {error && (
          <p className="mt-6 text-sm text-[var(--loss)]">Incorrect passcode</p>
        )}
      </div>
    </div>
  );
}
