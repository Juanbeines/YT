import { SummaryEntry } from "@/types";

const STORAGE_KEY = "yt-ad-summaries";

export function getSummaries(): SummaryEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data) as SummaryEntry[];
}

export function saveSummary(entry: SummaryEntry): void {
  const summaries = getSummaries();
  summaries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}

export function deleteSummary(id: string): void {
  const summaries = getSummaries().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}
