import { getSubtitles } from "youtube-captions-scraper";

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchTranscript(videoId: string): Promise<string> {
  const languages = ["en", "es", "pt", "fr", "de"];

  for (const lang of languages) {
    try {
      const captions = await getSubtitles({ videoID: videoId, lang });
      if (captions.length > 0) {
        return captions.map((c) => c.text).join(" ");
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    "Este video no tiene subtítulos disponibles. Probá con otro video que tenga subtítulos o subtítulos auto-generados activados."
  );
}

export async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    const data = await res.json();
    return data.title || `Video ${videoId}`;
  } catch {
    return `Video ${videoId}`;
  }
}
