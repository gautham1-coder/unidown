import { MediaItem, MediaFormat, MediaType } from '../types';
import { formatBytes, getDomain, sanitizeFilename } from '../utils';

const KNOWN_EXTENSIONS: Record<string, { type: MediaType; label: string }> = {
  // Video
  mp4: { type: 'video', label: 'MP4 Video' },
  webm: { type: 'video', label: 'WebM Video' },
  mkv: { type: 'video', label: 'MKV Video' },
  mov: { type: 'video', label: 'QuickTime Video' },
  avi: { type: 'video', label: 'AVI Video' },
  m4v: { type: 'video', label: 'M4V Video' },
  flv: { type: 'video', label: 'FLV Video' },

  // Audio
  mp3: { type: 'audio', label: 'MP3 Audio' },
  wav: { type: 'audio', label: 'WAV Audio' },
  ogg: { type: 'audio', label: 'OGG Audio' },
  m4a: { type: 'audio', label: 'M4A Audio' },
  flac: { type: 'audio', label: 'FLAC Audio' },
  opus: { type: 'audio', label: 'Opus Audio' },
  aac: { type: 'audio', label: 'AAC Audio' },

  // Images
  jpg: { type: 'image', label: 'JPEG Image' },
  jpeg: { type: 'image', label: 'JPEG Image' },
  png: { type: 'image', label: 'PNG Image' },
  gif: { type: 'image', label: 'GIF Image' },
  webp: { type: 'image', label: 'WebP Image' },
  svg: { type: 'image', label: 'SVG Vector' },

  // Documents and archives
  pdf: { type: 'file', label: 'PDF Document' },
  zip: { type: 'file', label: 'ZIP Archive' },
  rar: { type: 'file', label: 'RAR Archive' },
  '7z': { type: 'file', label: '7-Zip Archive' },
  tar: { type: 'file', label: 'TAR Archive' },
  gz: { type: 'file', label: 'GZIP Archive' },
  apk: { type: 'file', label: 'Android APK' },
  dmg: { type: 'file', label: 'macOS Disk Image' },
  exe: { type: 'file', label: 'Windows Executable' },
  iso: { type: 'file', label: 'ISO Disk Image' },
};

export async function extractDirectFile(urlStr: string): Promise<MediaItem | null> {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname;
    const cleanPath = pathname.split(/[?#]/)[0];
    const extension = cleanPath.split('.').pop()?.toLowerCase();

    // If extension is recognized or we need to test HEAD
    const knownInfo = extension ? KNOWN_EXTENSIONS[extension] : null;

    // Perform a lightweight HEAD request to inspect headers and verify size
    let contentLength: number | undefined;
    let contentType = '';
    let serverFilename = '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(urlStr, {
        method: 'HEAD',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const lengthHeader = res.headers.get('content-length');
        if (lengthHeader) contentLength = parseInt(lengthHeader, 10);
        contentType = res.headers.get('content-type') || '';
        const disposition = res.headers.get('content-disposition');
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
          if (match && match[1]) {
            serverFilename = match[1].trim();
          }
        }
      }
    } catch {
      // HEAD may fail if server doesn't support HEAD; continue with URL path
    }

    if (!knownInfo && !contentType.startsWith('video/') && !contentType.startsWith('audio/') && !contentType.startsWith('image/')) {
      return null;
    }

    // Determine type
    let mediaType: MediaType = knownInfo?.type || 'file';
    let typeLabel = knownInfo?.label || 'Direct Download';

    if (contentType.startsWith('video/')) {
      mediaType = 'video';
      typeLabel = 'Direct Video';
    } else if (contentType.startsWith('audio/')) {
      mediaType = 'audio';
      typeLabel = 'Direct Audio';
    } else if (contentType.startsWith('image/')) {
      mediaType = 'image';
      typeLabel = 'Direct Image';
    }

    const rawFilename = serverFilename || cleanPath.split('/').pop() || 'downloaded-file';
    const filename = sanitizeFilename(rawFilename);

    const format: MediaFormat = {
      id: 'direct-original',
      label: typeLabel,
      ext: extension || 'bin',
      url: urlStr,
      quality: 'Original',
      filesize: contentLength,
      filesizeFormatted: contentLength ? formatBytes(contentLength) : undefined,
      isDirect: true,
    };

    return {
      id: Buffer.from(urlStr).toString('base64').slice(0, 16),
      title: filename,
      url: urlStr,
      type: mediaType,
      thumbnail: mediaType === 'image' ? urlStr : undefined,
      formats: [format],
      sourceDomain: getDomain(urlStr),
      sourceType: 'direct',
    };
  } catch {
    return null;
  }
}
