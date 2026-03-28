declare module "youtube-captions-scraper" {
  interface Caption {
    start: number;
    dur: number;
    text: string;
  }

  interface GetSubtitlesOptions {
    videoID: string;
    lang?: string;
  }

  export function getSubtitles(options: GetSubtitlesOptions): Promise<Caption[]>;
}
