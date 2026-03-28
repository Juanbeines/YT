import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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

async function fetchTranscriptLocal(videoId: string): Promise<string> {
  const script = `
from youtube_transcript_api import YouTubeTranscriptApi
import json
ytt = YouTubeTranscriptApi()
transcript = ytt.fetch("${videoId}")
print(json.dumps({"transcript": " ".join([t.text for t in transcript])}))
`;
  const { stdout } = await execFileAsync("python3", ["-c", script], {
    timeout: 30000,
  });
  const data = JSON.parse(stdout.trim());
  return data.transcript;
}

async function fetchTranscriptVercel(videoId: string): Promise<string> {
  const baseUrl = `https://${process.env.VERCEL_URL}`;
  const res = await fetch(`${baseUrl}/api/py_transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Error obteniendo subtítulos");
  }
  return data.transcript;
}

export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    if (process.env.VERCEL_URL) {
      return await fetchTranscriptVercel(videoId);
    }
    return await fetchTranscriptLocal(videoId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(
      msg.includes("No se") || msg.includes("subtítulos")
        ? msg
        : "No se pudieron obtener los subtítulos de este video."
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
