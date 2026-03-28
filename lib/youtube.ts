import { YoutubeTranscript } from "youtube-transcript";

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
  const languages = ["es", "en", "pt", "fr"];

  for (const lang of languages) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang,
      });
      if (transcript.length > 0) {
        return transcript.map((item) => item.text).join(" ");
      }
    } catch {
      continue;
    }
  }

  // Last attempt without language preference
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((item) => item.text).join(" ");
  } catch {
    throw new Error(
      "Este video no tiene subtítulos disponibles. Probá con otro video que tenga subtítulos o subtítulos auto-generados activados."
    );
  }
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
