from http.server import BaseHTTPRequestHandler
import json
from youtube_transcript_api import YouTubeTranscriptApi


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)

        video_id = data.get("videoId", "")
        if not video_id:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "videoId is required"}).encode())
            return

        try:
            ytt = YouTubeTranscriptApi()
            transcript = ytt.fetch(video_id)
            text = " ".join([t.text for t in transcript])

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"transcript": text}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "error": "No se pudieron obtener los subtítulos de este video.",
                        "details": str(e),
                    }
                ).encode()
            )
