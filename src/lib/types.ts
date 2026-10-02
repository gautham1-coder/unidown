export type MediaType = 'video' | 'audio' | 'image' | 'file' | 'picker';

export interface MediaFormat {
  id: string;
  label: string;
  ext: string;
  url: string;
  quality?: string;
  filesize?: number;
  filesizeFormatted?: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
  isDirect?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: MediaType;
  thumbnail?: string;
  duration?: number;
  durationFormatted?: string;
  author?: {
    name?: string;
    url?: string;
    avatar?: string;
  };
  formats: MediaFormat[];
  sourceDomain: string;
  sourceType: 'social' | 'direct' | 'scraped';
}

export interface ExtractionResponse {
  success: boolean;
  item?: MediaItem;
  picker?: MediaItem[];
  error?: string;
  statusText?: string;
  engineUsed?: string;
}

export interface ExtractionRequest {
  url: string;
  videoQuality?: 'max' | '2160' | '1440' | '1080' | '720' | '480' | '360';
  audioFormat?: 'mp3' | 'ogg' | 'wav' | 'opus';
  audioOnly?: boolean;
  customBackendUrl?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  url: string;
  downloadUrl: string;
  type: MediaType;
  thumbnail?: string;
  timestamp: number;
  sourceDomain: string;
  formatLabel: string;
}
