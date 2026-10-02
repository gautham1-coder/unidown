import { MediaFormat, MediaItem, MediaType } from '../types';
import { sanitizeFilename } from '../utils';

interface FxTwitterMedia {
  url: string;
  type: 'video' | 'photo' | 'gif';
  thumbnail_url?: string;
  variants?: Array<{
    bitrate?: number;
    content_type?: string;
    url: string;
  }>;
}

interface FxTwitterResponse {
  code: number;
  message: string;
  tweet?: {
    id: string;
    text: string;
    author?: {
      name: string;
      screen_name: string;
      avatar_url: string;
    };
    media?: {
      all?: FxTwitterMedia[];
      videos?: FxTwitterMedia[];
      photos?: FxTwitterMedia[];
    };
  };
}

export async function extractTwitter(urlStr: string): Promise<MediaItem | null> {
  try {
    const parsed = new URL(urlStr);
    if (!parsed.hostname.includes('twitter.com') && !parsed.hostname.includes('x.com')) {
      return null;
    }

    // Extract status ID
    const match = parsed.pathname.match(/status\/(\d+)/);
    if (!match || !match[1]) return null;

    const tweetId = match[1];
    const apiUrl = `https://api.fxtwitter.com/status/${tweetId}`;

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'UniDown/1.0',
      },
    });

    if (!res.ok) return null;

    const data: FxTwitterResponse = await res.json();
    if (!data.tweet) return null;

    const tweet = data.tweet;
    const author = tweet.author
      ? {
          name: `${tweet.author.name} (@${tweet.author.screen_name})`,
          url: `https://x.com/${tweet.author.screen_name}`,
          avatar: tweet.author.avatar_url,
        }
      : undefined;

    const allMedia = tweet.media?.all || [];
    if (allMedia.length === 0) return null;

    // Check for video first
    const videoMedia = allMedia.find((m) => m.type === 'video' || m.type === 'gif');
    if (videoMedia) {
      const formats: MediaFormat[] = [];

      // Sort variants by bitrate if available
      if (videoMedia.variants && videoMedia.variants.length > 0) {
        const sortedVariants = [...videoMedia.variants]
          .filter((v) => v.content_type?.includes('mp4'))
          .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

        sortedVariants.forEach((v, idx) => {
          const bitrateLabel = v.bitrate ? `${Math.round(v.bitrate / 1000)} kbps` : `Quality ${idx + 1}`;
          formats.push({
            id: `tw-video-${idx}`,
            label: `MP4 Video (${bitrateLabel})`,
            ext: 'mp4',
            url: v.url,
            quality: bitrateLabel,
            hasAudio: true,
            hasVideo: true,
            isDirect: true,
          });
        });
      }

      if (formats.length === 0 && videoMedia.url) {
        formats.push({
          id: 'tw-video-direct',
          label: 'MP4 Video (Direct)',
          ext: 'mp4',
          url: videoMedia.url,
          quality: 'Standard',
          hasAudio: true,
          hasVideo: true,
          isDirect: true,
        });
      }

      return {
        id: tweet.id,
        title: sanitizeFilename(tweet.text.slice(0, 60) || 'Twitter Video'),
        description: tweet.text,
        url: urlStr,
        type: 'video',
        thumbnail: videoMedia.thumbnail_url,
        author,
        formats,
        sourceDomain: 'x.com',
        sourceType: 'social',
      };
    }

    // Photo media
    const photoMedia = allMedia.filter((m) => m.type === 'photo');
    if (photoMedia.length > 0) {
      const formats: MediaFormat[] = photoMedia.map((p, idx) => ({
        id: `tw-photo-${idx}`,
        label: `Photo #${idx + 1}`,
        ext: 'jpg',
        url: p.url,
        quality: 'Original High-Res',
        isDirect: true,
      }));

      return {
        id: tweet.id,
        title: sanitizeFilename(tweet.text.slice(0, 60) || 'Twitter Photos'),
        description: tweet.text,
        url: urlStr,
        type: 'image',
        thumbnail: photoMedia[0].url,
        author,
        formats,
        sourceDomain: 'x.com',
        sourceType: 'social',
      };
    }

    return null;
  } catch {
    return null;
  }
}
