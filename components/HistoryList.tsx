"use client";

import { SummaryEntry } from "@/types";

interface HistoryListProps {
  entries: SummaryEntry[];
  activeId: string | null;
  onSelect: (entry: SummaryEntry) => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({
  entries,
  activeId,
  onSelect,
  onDelete,
}: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm px-2">No hay resúmenes guardados</p>
    );
  }

  return (
    <ul className="space-y-1">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
            activeId === entry.id
              ? "bg-blue-600/20 text-blue-400"
              : "hover:bg-gray-800 text-gray-400"
          }`}
        >
          <button
            onClick={() => onSelect(entry)}
            className="flex-1 text-left truncate text-sm"
            title={entry.videoTitle}
          >
            {entry.videoTitle}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 ml-2 text-xs transition-opacity"
            title="Eliminar"
          >
            x
          </button>
        </li>
      ))}
    </ul>
  );
}
