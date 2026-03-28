"use client";

interface SummaryViewProps {
  title: string;
  summary: string;
  videoUrl?: string;
}

export default function SummaryView({
  title,
  summary,
  videoUrl,
}: SummaryViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Ver video
          </a>
        )}
      </div>
      <div className="prose prose-invert max-w-none">
        {summary.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h3 key={i} className="text-lg font-semibold text-blue-400 mt-6 mb-2">
                {line.replace("## ", "")}
              </h3>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <li key={i} className="text-gray-300 ml-4 list-disc">
                {line.replace("- ", "")}
              </li>
            );
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={i} className="font-semibold text-gray-200 mt-3">
                {line.replace(/\*\*/g, "")}
              </p>
            );
          }
          if (line.trim() === "") {
            return <br key={i} />;
          }
          return (
            <p key={i} className="text-gray-300">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}
