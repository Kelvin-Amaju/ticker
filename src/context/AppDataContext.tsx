"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppData, EMPTY_APP_DATA } from "@/lib/types";
import { loadAppData, saveAppData } from "@/lib/storage";

type AuthStage = "loading" | "onboarding-name" | "onboarding-pin" | "locked" | "unlocked";

interface AppDataContextValue {
  appData: AppData;
  stage: AuthStage;
  pendingName: string;
  setPendingName: (name: string) => void;
  advanceToOnboardingPin: () => void;
  completeOnboarding: (pinHash: string) => Promise<void>;
  unlock: () => void;
  lock: () => void;
  refreshAppData: () => Promise<void>;
  setAppData: (data: AppData) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppDataState] = useState<AppData>(EMPTY_APP_DATA);
  const [stage, setStage] = useState<AuthStage>("loading");
  const [pendingName, setPendingName] = useState("");

  useEffect(() => {
    loadAppData().then((data) => {
      setAppDataState(data);
      if (!data.user_profile.setup_completed) {
        setStage("onboarding-name");
      } else {
        setStage("locked");
      }
    });
  }, []);

  const refreshAppData = useCallback(async () => {
    const data = await loadAppData();
    setAppDataState(data);
  }, []);

  const advanceToOnboardingPin = useCallback(() => {
    setStage("onboarding-pin");
  }, []);

  const completeOnboarding = useCallback(
    async (pinHash: string) => {
      const next: AppData = {
        ...appData,
        user_profile: {
          display_name: pendingName,
          pin_hash: pinHash,
          setup_completed: true,
        },
      };
      await saveAppData(next);
      setAppDataState(next);
      setStage("unlocked");
    },
    [appData, pendingName]
  );

  const unlock = useCallback(() => setStage("unlocked"), []);
  const lock = useCallback(() => setStage("locked"), []);

  const setAppData = useCallback((data: AppData) => {
    setAppDataState(data);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        appData,
        stage,
        pendingName,
        setPendingName,
        advanceToOnboardingPin,
        completeOnboarding,
        unlock,
        lock,
        refreshAppData,
        setAppData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
