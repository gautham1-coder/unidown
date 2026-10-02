import { MediaFormat, MediaItem, MediaType } from '../types';
import { formatDuration, sanitizeFilename } from '../utils';

export async function extractReddit(urlStr: string): Promise<MediaItem | null> {
  try {
    const parsed = new URL(urlStr);
    if (!parsed.hostname.includes('reddit.com') && !parsed.hostname.includes('redd.it')) {
      return null;
    }

    // Prepare JSON endpoint
    let cleanUrl = urlStr.split('?')[0];
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    const jsonUrl = `${cleanUrl}.json?raw_json=1`;

    const res = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 UniDown/1.0',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const post = Array.isArray(data) ? data[0]?.data?.children?.[0]?.data : data?.data?.children?.[0]?.data;
    if (!post) return null;

    const title = sanitizeFilename(post.title || 'Reddit Post');
    const author = post.author ? { name: `u/${post.author}`, url: `https://reddit.com/u/${post.author}` } : undefined;
    const thumbnail = post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : undefined;

    // Check for Reddit Video
    const videoData = post.secure_media?.reddit_video || post.media?.reddit_video || post.preview?.reddit_video_preview;

    if (videoData?.fallback_url) {
      const fallbackUrl: string = videoData.fallback_url;
      const duration = videoData.duration;
      const formats: MediaFormat[] = [];

      // Determine available resolutions (1080, 720, 480, 360)
      const heights = [1080, 720, 480, 360, 240];
      const baseUrl = fallbackUrl.replace(/DASH_\d+\.mp4.*/, '');

      // Add main fallback
      formats.push({
        id: 'reddit-video-default',
        label: `Reddit Video (${videoData.height || 'HD'}p)`,
        ext: 'mp4',
        url: fallbackUrl,
        quality: `${videoData.height || 720}p`,
        hasAudio: false, // Reddit video streams DASH separately
        hasVideo: true,
        isDirect: true,
      });

      // Also provide audio stream if available
      const audioUrl = `${baseUrl}DASH_AUDIO_128.mp4`;
      formats.push({
        id: 'reddit-audio',
        label: 'Reddit Audio Track (128kbps)',
        ext: 'mp4',
        url: audioUrl,
        quality: 'Audio',
        hasAudio: true,
        hasVideo: false,
        isDirect: true,
      });

      return {
        id: post.id || Buffer.from(urlStr).toString('base64').slice(0, 16),
        title,
        url: urlStr,
        type: 'video',
        thumbnail,
        duration,
        durationFormatted: formatDuration(duration),
        author,
        formats,
        sourceDomain: 'reddit.com',
        sourceType: 'social',
      };
    }

    // Check for direct image or gallery
    if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.png') || post.url.endsWith('.gif') || post.url.endsWith('.webp'))) {
      const ext = post.url.split('.').pop() || 'jpg';
      return {
        id: post.id || 'reddit-img',
        title,
        url: urlStr,
        type: 'image',
        thumbnail: post.url,
        author,
        formats: [
          {
            id: 'reddit-img-original',
            label: 'Original High-Res Image',
            ext,
            url: post.url,
            quality: 'Original',
            isDirect: true,
          },
        ],
        sourceDomain: 'reddit.com',
        sourceType: 'social',
      };
    }

    return null;
  } catch {
    return null;
  }
}
