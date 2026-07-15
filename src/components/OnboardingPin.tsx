"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { hashPasscode } from "@/lib/crypto";
import PinPad from "./PinPad";

export default function OnboardingPin() {
  const { completeOnboarding } = useAppData();
  const [stage, setStage] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length !== 6) return;

    if (stage === "create") {
      const timer = setTimeout(() => {
        setFirstPin(pin);
        setPin("");
        setStage("confirm");
      }, 150);
      return () => clearTimeout(timer);
    }

    // confirm stage
    const timer = setTimeout(async () => {
      if (pin === firstPin) {
        const hash = await hashPasscode(pin);
        await completeOnboarding(hash);
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin("");
          setStage("create");
          setFirstPin("");
        }, 500);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [pin, stage, firstPin, completeOnboarding]);

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 bg-[var(--bg-base)]">
      <div className="max-w-sm mx-auto w-full text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--accent)] mb-2">
          Step 2 of 2
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          {stage === "create" ? "Create your passcode" : "Confirm your passcode"}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          {stage === "create"
            ? "6 digits. You'll use this every time you open the app."
            : "Enter it once more to confirm."}
        </p>
        <PinPad value={pin} onChange={setPin} shake={error} />
        {error && (
          <p className="mt-6 text-sm text-[var(--loss)]">
            Codes didn&apos;t match — try again
          </p>
        )}
      </div>
    </div>
  );
}
