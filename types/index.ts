export interface SummaryEntry {
  id: string;
  videoTitle: string;
  videoUrl: string;
  summary: string;
  createdAt: string;
}

export interface SummarizeRequest {
  url: string;
}

export interface SummarizeResponse {
  title: string;
  summary: string;
  error?: string;
}
