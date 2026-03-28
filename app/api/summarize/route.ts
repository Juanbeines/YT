import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, fetchTranscript, fetchVideoTitle } from "@/lib/youtube";
import { generateAdSummary } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "URL de YouTube inválida" },
        { status: 400 }
      );
    }

    const [transcript, title] = await Promise.all([
      fetchTranscript(videoId),
      fetchVideoTitle(videoId),
    ]);

    if (!transcript) {
      return NextResponse.json(
        { error: "No se pudo obtener el transcript del video" },
        { status: 400 }
      );
    }

    const summary = await generateAdSummary(transcript);

    return NextResponse.json({ title, summary });
  } catch (error) {
    console.error("Summarize error:", error);
    const message =
      error instanceof Error ? error.message : "Error procesando el video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
