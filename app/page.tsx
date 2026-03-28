"use client";

import { useState, useEffect, useCallback } from "react";
import VideoInput from "@/components/VideoInput";
import SummaryView from "@/components/SummaryView";
import HistoryList from "@/components/HistoryList";
import { SummaryEntry } from "@/types";
import { getSummaries, saveSummary, deleteSummary } from "@/lib/storage";

export default function Home() {
  const [entries, setEntries] = useState<SummaryEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<SummaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getSummaries());
  }, []);

  const handleSubmit = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error procesando el video");
      }

      const entry: SummaryEntry = {
        id: crypto.randomUUID(),
        videoTitle: data.title,
        videoUrl: url,
        summary: data.summary,
        createdAt: new Date().toISOString(),
      };

      saveSummary(entry);
      setEntries(getSummaries());
      setActiveEntry(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteSummary(id);
    setEntries(getSummaries());
    setActiveEntry((prev) => (prev?.id === id ? null : prev));
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-gray-100">YT Ad Summarizer</h1>
          <p className="text-xs text-gray-500 mt-1">
            Resúmenes de videos enfocados en ADs
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <HistoryList
            entries={entries}
            activeId={activeEntry?.id ?? null}
            onSelect={setActiveEntry}
            onDelete={handleDelete}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <VideoInput onSubmit={handleSubmit} isLoading={isLoading} />
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mx-auto"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-gray-500">
                  Analizando video con Claude Opus 4.6...
                </p>
              </div>
            </div>
          ) : activeEntry ? (
            <SummaryView
              title={activeEntry.videoTitle}
              summary={activeEntry.summary}
              videoUrl={activeEntry.videoUrl}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">
                Pegá un link de YouTube para comenzar
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
