"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import SplashScreen from "./SplashScreen";
import OnboardingName from "./OnboardingName";
import OnboardingPin from "./OnboardingPin";
import LockScreen from "./LockScreen";
import BottomNav from "./BottomNav";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { stage } = useAppData();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || stage === "loading") {
    return <SplashScreen />;
  }

  if (stage === "onboarding-name") {
    return <OnboardingName />;
  }

  if (stage === "onboarding-pin") {
    return <OnboardingPin />;
  }

  if (stage === "locked") {
    return <LockScreen />;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1 pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
