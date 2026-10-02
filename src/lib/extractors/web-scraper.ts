import * as cheerio from 'cheerio';
import { MediaFormat, MediaItem, MediaType } from '../types';
import { getDomain, sanitizeFilename } from '../utils';

export async function scrapeWebpageMedia(urlStr: string): Promise<MediaItem | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(urlStr, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);
    const domain = getDomain(urlStr);

    // Page metadata
    const rawTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('title').first().text() ||
      domain;
    const title = sanitizeFilename(rawTitle.trim());

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content');

    const ogImage =
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    const foundFormats: MediaFormat[] = [];
    const seenUrls = new Set<string>();

    const getCleanExt = (u: string, defaultExt = 'bin'): string => {
      try {
        const cleanPath = new URL(u).pathname;
        const lastPart = cleanPath.split('/').pop() || '';
        const dotIdx = lastPart.lastIndexOf('.');
        if (dotIdx !== -1) {
          const ext = lastPart.slice(dotIdx + 1).toLowerCase();
          if (ext && ext.length <= 5 && /^[a-z0-9]+$/i.test(ext)) {
            return ext;
          }
        }
        return defaultExt;
      } catch {
        return defaultExt;
      }
    };

    const resolveUrl = (relative?: string): string | null => {
      if (!relative) return null;
      try {
        const u = new URL(relative, urlStr).href;
        if (u.startsWith('data:')) return null;
        return u;
      } catch {
        return null;
      }
    };

    // 1. OpenGraph Video & Twitter Stream
    const ogVideo =
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video:url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content') ||
      $('meta[name="twitter:player:stream"]').attr('content');

    if (ogVideo) {
      const resolved = resolveUrl(ogVideo);
      if (resolved && !seenUrls.has(resolved)) {
        seenUrls.add(resolved);
        foundFormats.push({
          id: `og-video-${foundFormats.length}`,
          label: 'Embedded Video (OpenGraph)',
          ext: 'mp4',
          url: resolved,
          quality: 'Original',
          hasVideo: true,
          hasAudio: true,
          isDirect: true,
        });
      }
    }

    // 2. HTML5 <video> and <source> elements
    $('video').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        const resolved = resolveUrl(src);
        if (resolved && !seenUrls.has(resolved)) {
          seenUrls.add(resolved);
          foundFormats.push({
            id: `video-elem-${i}`,
            label: `HTML5 Video #${i + 1}`,
            ext: getCleanExt(resolved, 'mp4'),
            url: resolved,
            quality: 'Original',
            hasVideo: true,
            hasAudio: true,
            isDirect: true,
          });
        }
      }

      $(el)
        .find('source')
        .each((j, sEl) => {
          const sSrc = $(sEl).attr('src');
          if (sSrc) {
            const resolved = resolveUrl(sSrc);
            if (resolved && !seenUrls.has(resolved)) {
              seenUrls.add(resolved);
              const type = $(sEl).attr('type') || '';
              foundFormats.push({
                id: `video-src-${i}-${j}`,
                label: `Video Stream (${type || 'MP4'})`,
                ext: getCleanExt(resolved, 'mp4'),
                url: resolved,
                quality: 'Stream',
                hasVideo: true,
                hasAudio: true,
                isDirect: true,
              });
            }
          }
        });
    });

    // 3. HTML5 <audio> and <source> elements
    $('audio').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        const resolved = resolveUrl(src);
        if (resolved && !seenUrls.has(resolved)) {
          seenUrls.add(resolved);
          foundFormats.push({
            id: `audio-elem-${i}`,
            label: `Audio Track #${i + 1}`,
            ext: getCleanExt(resolved, 'mp3'),
            url: resolved,
            quality: 'Audio',
            hasAudio: true,
            hasVideo: false,
            isDirect: true,
          });
        }
      }

      $(el)
        .find('source')
        .each((j, sEl) => {
          const sSrc = $(sEl).attr('src');
          if (sSrc) {
            const resolved = resolveUrl(sSrc);
            if (resolved && !seenUrls.has(resolved)) {
              seenUrls.add(resolved);
              foundFormats.push({
                id: `audio-src-${i}-${j}`,
                label: `Audio Source #${j + 1}`,
                ext: getCleanExt(resolved, 'mp3'),
                url: resolved,
                quality: 'Audio',
                hasAudio: true,
                hasVideo: false,
                isDirect: true,
              });
            }
          }
        });
    });

    // 4. JSON-LD structured data inspection
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const content = $(el).html();
        if (!content) return;
        const json = JSON.parse(content);
        const scanObj = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj['@type'] === 'VideoObject' && obj.contentUrl) {
            const resolved = resolveUrl(obj.contentUrl);
            if (resolved && !seenUrls.has(resolved)) {
              seenUrls.add(resolved);
              foundFormats.push({
                id: `jsonld-video-${foundFormats.length}`,
                label: `Structured Video (${obj.name || 'HD'})`,
                ext: 'mp4',
                url: resolved,
                quality: 'HD',
                hasVideo: true,
                hasAudio: true,
                isDirect: true,
              });
            }
          }
          if (obj['@type'] === 'AudioObject' && obj.contentUrl) {
            const resolved = resolveUrl(obj.contentUrl);
            if (resolved && !seenUrls.has(resolved)) {
              seenUrls.add(resolved);
              foundFormats.push({
                id: `jsonld-audio-${foundFormats.length}`,
                label: `Structured Audio (${obj.name || 'Audio'})`,
                ext: 'mp3',
                url: resolved,
                quality: 'Audio',
                hasAudio: true,
                isDirect: true,
              });
            }
          }
          if (Array.isArray(obj)) {
            obj.forEach(scanObj);
          } else {
            Object.values(obj).forEach(scanObj);
          }
        };
        scanObj(json);
      } catch {
        // Ignore invalid json
      }
    });

    // 5. Downloadable file links on the page (zip, pdf, mp4, mp3, etc.)
    const downloadableExts = ['.pdf', '.zip', '.rar', '.7z', '.mp4', '.mp3', '.apk', '.dmg', '.iso', '.csv', '.xlsx'];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        const cleanHref = href.split(/[?#]/)[0].toLowerCase();
        const matchedExt = downloadableExts.find((ext) => cleanHref.endsWith(ext));
        if (matchedExt && foundFormats.length < 25) {
          const resolved = resolveUrl(href);
          if (resolved && !seenUrls.has(resolved)) {
            seenUrls.add(resolved);
            const linkText = $(el).text().trim() || `Downloadable File ${matchedExt.toUpperCase()}`;
            foundFormats.push({
              id: `link-file-${i}`,
              label: `${linkText.slice(0, 35)} (${matchedExt.replace('.', '').toUpperCase()})`,
              ext: matchedExt.replace('.', ''),
              url: resolved,
              quality: 'File',
              isDirect: true,
            });
          }
        }
      }
    });

    // 6. High-res images on page
    if (ogImage) {
      const resolved = resolveUrl(ogImage);
      if (resolved && !seenUrls.has(resolved)) {
        seenUrls.add(resolved);
        foundFormats.push({
          id: 'og-image-cover',
          label: 'High-Res Page Cover Image',
          ext: getCleanExt(resolved, 'jpg'),
          url: resolved,
          quality: 'Original',
          isDirect: true,
        });
      }
    }

    $('img').each((i, el) => {
      if (foundFormats.length >= 30) return;
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('avatar') && !src.includes('icon') && !src.includes('logo') && !src.includes('1x1')) {
        const resolved = resolveUrl(src);
        if (resolved && !seenUrls.has(resolved)) {
          seenUrls.add(resolved);
          const alt = $(el).attr('alt')?.trim() || `Image #${i + 1}`;
          foundFormats.push({
            id: `img-elem-${i}`,
            label: `${alt.slice(0, 30)}`,
            ext: getCleanExt(resolved, 'jpg'),
            url: resolved,
            quality: 'Image',
            isDirect: true,
          });
        }
      }
    });

    if (foundFormats.length === 0) {
      return null;
    }

    // Determine primary type
    const hasVideo = foundFormats.some((f) => f.hasVideo);
    const hasAudio = foundFormats.some((f) => f.hasAudio && !f.hasVideo);
    let primaryType: MediaType = 'file';
    if (hasVideo) primaryType = 'video';
    else if (hasAudio) primaryType = 'audio';
    else if (foundFormats.some((f) => ['jpg', 'png', 'webp', 'gif'].includes(f.ext))) primaryType = 'image';

    const thumbnail = ogImage ? resolveUrl(ogImage) || undefined : undefined;

    return {
      id: Buffer.from(urlStr).toString('base64').slice(0, 16),
      title: title || `${domain} Extracted Media`,
      description,
      url: urlStr,
      type: primaryType,
      thumbnail,
      formats: foundFormats,
      sourceDomain: domain,
      sourceType: 'scraped',
    };
  } catch {
    return null;
  }
}
