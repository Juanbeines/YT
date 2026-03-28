import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

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

export async function fetchTranscript(videoId: string): Promise<string> {
  const tmpFile = join(tmpdir(), `yt-transcript-${videoId}`);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Run yt-dlp - it may exit with error code even if some subs downloaded
    await execFileAsync("/usr/local/bin/python3.12", [
      "-m",
      "yt_dlp",
      "--write-auto-sub",
      "--sub-lang",
      "en",
      "--skip-download",
      "--sub-format",
      "srv1",
      "-o",
      tmpFile,
      videoUrl,
    ], { timeout: 30000 }).catch(() => {});

    // Check if subtitle file was downloaded
    let xml = "";
    for (const lang of ["en", "es"]) {
      const filePath = `${tmpFile}.${lang}.srv1`;
      try {
        xml = await readFile(filePath, "utf-8");
        await unlink(filePath).catch(() => {});
        if (xml.length > 0) break;
      } catch {
        continue;
      }
    }

    if (!xml) {
      throw new Error(
        "No se encontraron subtítulos para este video."
      );
    }

    // Parse XML and extract text
    const textMatches = [...xml.matchAll(/<text[^>]*>(.*?)<\/text>/gs)];
    const transcript = textMatches
      .map((m) =>
        m[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\n/g, " ")
      )
      .join(" ");

    if (!transcript) {
      throw new Error("No se pudo extraer el texto de los subtítulos.");
    }

    return transcript;
  } catch (error) {
    if (error instanceof Error && error.message.includes("No se")) {
      throw error;
    }
    throw new Error(
      "No se pudieron obtener los subtítulos de este video."
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
