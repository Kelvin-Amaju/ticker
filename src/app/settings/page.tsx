"use client";

import { useRef, useState } from "react";
import { compressToBase64, decompressFromBase64 } from "lz-string";
import { useAppData } from "@/context/AppDataContext";
import { saveAppData } from "@/lib/storage";
import { AppData } from "@/lib/types";

type Status = { type: "success" | "error"; message: string } | null;

function isValidAppData(value: unknown): value is AppData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.user_profile !== "object" || v.user_profile === null) return false;
  if (typeof v.portfolio !== "object" || v.portfolio === null) return false;
  if (!Array.isArray((v.portfolio as Record<string, unknown>).holdings)) return false;
  if (!Array.isArray(v.favorites)) return false;
  return true;
}

export default function SettingsPage() {
  const { appData, refreshAppData, lock } = useAppData();
  const [status, setStatus] = useState<Status>(null);
  const [pasteValue, setPasteValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showStatus(next: Status) {
    setStatus(next);
    setTimeout(() => setStatus(null), 3500);
  }

  async function handleCopyBase64() {
    const json = JSON.stringify(appData);
    const compressed = compressToBase64(json);
    try {
      await navigator.clipboard.writeText(compressed);
      showStatus({ type: "success", message: "Copied compressed backup to clipboard" });
    } catch {
      showStatus({ type: "error", message: "Clipboard access failed" });
    }
  }

  function handleDownloadFile() {
    const json = JSON.stringify(appData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ngx-portfolio-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus({ type: "success", message: "Backup file downloaded" });
  }

  async function importData(data: unknown) {
    if (!isValidAppData(data)) {
      showStatus({ type: "error", message: "That file doesn't look like a valid backup" });
      return;
    }
    await saveAppData(data);
    await refreshAppData();
    showStatus({ type: "success", message: "Data restored successfully" });
  }

  async function handlePasteImport() {
    if (!pasteValue.trim()) return;
    try {
      const json = decompressFromBase64(pasteValue.trim());
      if (!json) throw new Error("empty");
      const parsed = JSON.parse(json);
      await importData(parsed);
      setPasteValue("");
    } catch {
      showStatus({ type: "error", message: "Couldn't decode that backup string" });
    }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await importData(parsed);
    } catch {
      showStatus({ type: "error", message: "Couldn't read that file" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 safe-top">
      <header className="pt-6 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight">Settings</h1>
      </header>

      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hair)] p-4 mb-4">
        <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">Account</p>
        <p className="font-semibold">{appData.user_profile.display_name}</p>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          {appData.portfolio.holdings.length} holding{appData.portfolio.holdings.length !== 1 ? "s" : ""} · {appData.favorites.length} favorite{appData.favorites.length !== 1 ? "s" : ""}
        </p>
      </section>

      {status && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            status.type === "success"
              ? "bg-[var(--gain)]/10 text-[var(--gain)]"
              : "bg-[var(--loss)]/10 text-[var(--loss)]"
          }`}
        >
          {status.message}
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Export data</h2>
        <div className="space-y-2">
          <button
            onClick={handleCopyBase64}
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5 text-left text-sm font-medium active:scale-[0.99] transition"
          >
            Copy compressed backup to clipboard
          </button>
          <button
            onClick={handleDownloadFile}
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5 text-left text-sm font-medium active:scale-[0.99] transition"
          >
            Download backup file (.json)
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Import data</h2>
        <div className="space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hair)] px-4 py-3.5 text-left text-sm font-medium active:scale-[0.99] transition"
          >
            Upload backup file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileImport}
            className="hidden"
          />
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="Or paste a compressed backup string"
            rows={3}
            className="w-full rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-hair)] px-4 py-3 text-xs font-mono-tabular outline-none focus:border-[var(--accent)] transition resize-none"
          />
          <button
            onClick={handlePasteImport}
            disabled={!pasteValue.trim()}
            className="w-full rounded-xl bg-[var(--accent)] text-[#04140d] font-semibold py-3 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition"
          >
            Restore from pasted backup
          </button>
        </div>
      </section>

      <button
        onClick={lock}
        className="w-full rounded-xl border border-[var(--border-hair)] text-[var(--text-muted)] font-semibold py-3.5 mb-8 active:scale-[0.99] transition"
      >
        Lock app
      </button>
    </div>
  );
}
