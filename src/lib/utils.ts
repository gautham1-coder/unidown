import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes?: number, decimals = 2): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim()
    .slice(0, 200);
}

export function detectPlatform(urlStr: string): {
  platform: string;
  category: 'social' | 'direct' | 'generic';
  iconName: string;
} {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return { platform: 'YouTube', category: 'social', iconName: 'Youtube' };
    }
    if (host.includes('tiktok.com')) {
      return { platform: 'TikTok', category: 'social', iconName: 'Video' };
    }
    if (host.includes('instagram.com')) {
      return { platform: 'Instagram', category: 'social', iconName: 'Instagram' };
    }
    if (host.includes('twitter.com') || host.includes('x.com')) {
      return { platform: 'Twitter / X', category: 'social', iconName: 'Twitter' };
    }
    if (host.includes('reddit.com') || host.includes('redd.it')) {
      return { platform: 'Reddit', category: 'social', iconName: 'MessageSquare' };
    }
    if (host.includes('facebook.com') || host.includes('fb.watch') || host.includes('fb.gg') || host.includes('facebook.net')) {
      return { platform: 'Facebook', category: 'social', iconName: 'Facebook' };
    }
    if (host.includes('pinterest.com') || host.includes('pin.it')) {
      return { platform: 'Pinterest', category: 'social', iconName: 'Image' };
    }
    if (host.includes('soundcloud.com')) {
      return { platform: 'SoundCloud', category: 'social', iconName: 'Music' };
    }
    if (host.includes('vimeo.com')) {
      return { platform: 'Vimeo', category: 'social', iconName: 'PlayCircle' };
    }
    if (host.includes('dailymotion.com')) {
      return { platform: 'Dailymotion', category: 'social', iconName: 'Video' };
    }
    if (host.includes('twitch.tv')) {
      return { platform: 'Twitch Clip', category: 'social', iconName: 'Tv' };
    }

    // Direct media file detection
    const directExtensions = [
      '.mp4', '.mkv', '.webm', '.mov', '.avi',
      '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.opus',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      '.pdf', '.zip', '.rar', '.7z', '.tar', '.gz', '.apk', '.dmg', '.iso'
    ];
    if (directExtensions.some((ext) => pathname.endsWith(ext))) {
      return { platform: 'Direct File / Stream', category: 'direct', iconName: 'FileDown' };
    }

    return { platform: host.replace(/^www\./, ''), category: 'generic', iconName: 'Globe' };
  } catch {
    return { platform: 'Web', category: 'generic', iconName: 'Globe' };
  }
}
