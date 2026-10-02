import * as cheerio from 'cheerio';
import { MediaFormat, MediaItem, MediaType } from '../types';
import { sanitizeFilename } from '../utils';

function cleanUrl(raw?: string): string {
  if (!raw) return '';
  return raw
    .replaceAll('\\u0026', '&')
    .replaceAll('\\u002F', '/')
    .replaceAll('\\/', '/')
    .replaceAll('&amp;', '&')
    .trim();
}

function normalizeFacebookUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // Remove Facebook tracking parameters that clutter URLs
    const trackingParams = ['mibextid', 'rdid', 'ref', '__cft__', '__tn__', 'fbclid', 'source'];
    trackingParams.forEach((param) => u.searchParams.delete(param));
    return u.toString();
  } catch {
    return rawUrl;
  }
}

// SnapSave Decoder algorithm
function decodeSnapApp(args: string[]): string {
  const [encodedContent, , charMap, subtractValue, base] = args;

  const decodeNumber = (value: string, fromBase: number, toBase: number): string => {
    const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
    const fromCharset = charset.slice(0, fromBase);
    const toCharset = charset.slice(0, toBase);

    const decimal = String(value)
      .split('')
      .reverse()
      .reduce((sum: number, char: string, index: number) => {
        if (fromCharset.indexOf(char) !== -1) {
          return sum + fromCharset.indexOf(char) * Math.pow(fromBase, index);
        }
        return sum;
      }, 0);

    let result = '';
    let curr = decimal;
    while (curr > 0) {
      result = toCharset[curr % toBase] + result;
      curr = Math.floor(curr / toBase);
    }
    return result || '0';
  };

  let decodedResult = '';
  for (let i = 0, len = encodedContent.length; i < len; i++) {
    let segment = '';
    while (i < len && encodedContent[i] !== charMap[Number(base)]) {
      segment += encodedContent[i];
      i++;
    }

    for (let j = 0; j < charMap.length; j++) {
      segment = segment.replace(new RegExp(charMap[j], 'g'), j.toString());
    }

    const num = Number(decodeNumber(segment, Number(base), 10));
    decodedResult += String.fromCharCode(num - Number(subtractValue));
  }

  try {
    return decodeURIComponent(escape(decodedResult));
  } catch {
    return decodedResult;
  }
}

function extractSnapArgs(text: string): string[] | null {
  const match = text.match(/decodeURIComponent\(escape\(r\)\)}\s*\((.*?)\)\s*\)/s);
  if (!match) return null;
  const rawArgs = match[1];
  try {
    // Safely evaluate array literal containing only strings and numbers
    return Function(`"use strict"; return [${rawArgs}];`)();
  } catch {
    return null;
  }
}

// Strategy 1: SnapSave High-Speed Facebook Resolver
async function extractWithSnapSave(targetUrl: string): Promise<MediaItem | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);

    const res = await fetch('https://snapsave.app/action.php?lang=en', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://snapsave.app',
        referer: 'https://snapsave.app/',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      body: `url=${encodeURIComponent(targetUrl)}`,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const text = await res.text();
    const args = extractSnapArgs(text);
    if (!args) return null;

    const decoded = decodeSnapApp(args);
    const $ = cheerio.load(decoded);
    const formats: MediaFormat[] = [];
    const seenUrls = new Set<string>();

    // 1. Table items
    $('tbody tr').each((i, el) => {
      const quality =
        $(el).find('.video-quality').text().trim() ||
        $(el).find('td').first().text().trim() ||
        'HD';
      const rawHref =
        $(el).find('a[href]').attr('href') ||
        $(el).find('button[onclick]').attr('onclick');

      let downloadUrl = rawHref;
      if (rawHref && /get_progressApi\('(.*?)'\)/.test(rawHref)) {
        const matched = /get_progressApi\('(.*?)'\)/.exec(rawHref);
        if (matched?.[1]) {
          downloadUrl = `https://snapsave.app${matched[1]}`;
        }
      }

      if (downloadUrl && downloadUrl.startsWith('http') && !seenUrls.has(downloadUrl)) {
        seenUrls.add(downloadUrl);
        formats.push({
          id: `snapsave-${i}`,
          label: `Video (${quality})`,
          ext: 'mp4',
          url: downloadUrl,
          quality,
          hasVideo: true,
          hasAudio: true,
          isDirect: true,
        });
      }
    });

    // 2. Simple download links fallback
    if (formats.length === 0) {
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        const textLabel = $(el).text().trim();
        if (
          href &&
          href.startsWith('http') &&
          !seenUrls.has(href) &&
          (textLabel.includes('Download') || href.includes('.mp4') || href.includes('fbcdn'))
        ) {
          seenUrls.add(href);
          formats.push({
            id: `snapsave-link-${i}`,
            label: textLabel || `Video Stream #${i + 1}`,
            ext: 'mp4',
            url: href,
            quality: 'HD',
            hasVideo: true,
            hasAudio: true,
            isDirect: true,
          });
        }
      });
    }

    if (formats.length === 0) return null;

    const rawDesc = $('span.video-des').text().trim() || $('article.media p').text().trim();
    const title = rawDesc ? sanitizeFilename(rawDesc.slice(0, 60)) : 'Facebook Video';
    const thumbnail =
      $('article.media img').attr('src') ||
      $('div.download-items__thumb img').attr('src') ||
      undefined;

    return {
      id: Buffer.from(targetUrl).toString('base64').slice(0, 16),
      title,
      description: rawDesc || undefined,
      url: targetUrl,
      type: 'video',
      thumbnail,
      formats,
      sourceDomain: 'facebook.com',
      sourceType: 'social',
    };
  } catch {
    return null;
  }
}

const isValidVideoUrl = (u: string): boolean => {
  return (
    Boolean(u) &&
    u.startsWith('http') &&
    !u.includes('lookaside.fbsbx.com/lookaside/crawler') &&
    !u.includes('static.xx.fbcdn.net') &&
    !u.includes('rsrc.php')
  );
};

// Strategy 2: Native Direct Facebook Page Inspector
async function extractFacebookDirect(targetUrl: string): Promise<MediaItem | null> {
  const cleanTarget = normalizeFacebookUrl(targetUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9500);

  // Use Chrome desktop User-Agent to retrieve direct CDN mp4 video streams
  const res = await fetch(cleanTarget, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
    },
    redirect: 'follow',
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) return null;

  const html = await res.text();
  const formats: MediaFormat[] = [];
  const seenUrls = new Set<string>();

  // 1. HD Native Stream
  const hdMatch =
    html.match(/browser_native_hd_url["']?:["']([^"']+)["']/i) ||
    html.match(/playable_url_quality_hd["']?:["']([^"']+)["']/i) ||
    html.match(/hd_src["']?:["']([^"']+)["']/i) ||
    html.match(/hd_src_no_ratelimit["']?:["']([^"']+)["']/i);

  if (hdMatch) {
    const cleanHd = cleanUrl(hdMatch[1]);
    if (isValidVideoUrl(cleanHd) && !seenUrls.has(cleanHd)) {
      seenUrls.add(cleanHd);
      formats.push({
        id: 'fb-hd',
        label: 'Video (HD 1080p / 720p)',
        ext: 'mp4',
        url: cleanHd,
        quality: '1080p / HD',
        hasVideo: true,
        hasAudio: true,
        isDirect: true,
      });
    }
  }

  // 2. SD Native Stream
  const sdMatch =
    html.match(/browser_native_sd_url["']?:["']([^"']+)["']/i) ||
    html.match(/playable_url["']?:["']([^"']+)["']/i) ||
    html.match(/sd_src["']?:["']([^"']+)["']/i) ||
    html.match(/sd_src_no_ratelimit["']?:["']([^"']+)["']/i);

  if (sdMatch) {
    const cleanSd = cleanUrl(sdMatch[1]);
    if (isValidVideoUrl(cleanSd) && !seenUrls.has(cleanSd)) {
      seenUrls.add(cleanSd);
      formats.push({
        id: 'fb-sd',
        label: 'Video (SD 480p / 360p)',
        ext: 'mp4',
        url: cleanSd,
        quality: '480p / SD',
        hasVideo: true,
        hasAudio: true,
        isDirect: true,
      });
    }
  }

  // 3. Fallback: Any direct fbcdn .mp4 URLs in script payloads
  if (formats.length === 0) {
    const mp4Matches = Array.from(html.matchAll(/https?:\\\/\\\/[^\s"']+\.mp4[^\s"']*/gi));
    for (const m of mp4Matches) {
      const clean = cleanUrl(m[0]);
      if (clean.includes('fbcdn.net') && !seenUrls.has(clean)) {
        seenUrls.add(clean);
        formats.push({
          id: `fb-mp4-${formats.length}`,
          label: `Video Stream #${formats.length + 1} (MP4)`,
          ext: 'mp4',
          url: clean,
          quality: 'Stream',
          hasVideo: true,
          hasAudio: true,
          isDirect: true,
        });
        if (formats.length >= 2) break;
      }
    }
  }

  // 4. OpenGraph video
  if (formats.length === 0) {
    const ogVideoMatch = html.match(
      /<meta\s+property=["']og:video(:secure_url)?["']\s+content=["']([^"']+)["']/i
    );
    if (ogVideoMatch) {
      const cleanOg = cleanUrl(ogVideoMatch[2]);
      if (isValidVideoUrl(cleanOg) && !seenUrls.has(cleanOg)) {
        seenUrls.add(cleanOg);
        formats.push({
          id: 'fb-og',
          label: 'Video (Embedded OpenGraph)',
          ext: 'mp4',
          url: cleanOg,
          quality: 'Original',
          hasVideo: true,
          hasAudio: true,
          isDirect: true,
        });
      }
    }
  }

  // 5. High-resolution Facebook Photo post fallback
  let isImage = false;
  if (formats.length === 0) {
    const ogImageMatch =
      html.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImageMatch) {
      const cleanImg = cleanUrl(ogImageMatch[1]);
      if (cleanImg.startsWith('http') && !cleanImg.includes('static.xx.fbcdn.net/rsrc.php')) {
        isImage = true;
        formats.push({
          id: 'fb-photo',
          label: 'High-Resolution Facebook Photo',
          ext: 'jpg',
          url: cleanImg,
          quality: 'High',
          isDirect: true,
        });
      }
    }
  }

  if (formats.length === 0) return null;

  // Metadata extraction
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = 'Facebook Media';
  if (titleMatch && titleMatch[1]) {
    title = sanitizeFilename(titleMatch[1].replace(/\|\s*Facebook$/i, '').trim());
  }

  const descMatch = html.match(
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
  );
  const description = descMatch ? descMatch[1] : undefined;

  const thumbMatch =
    html.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const thumbnail = thumbMatch ? cleanUrl(thumbMatch[1]) : undefined;

  const primaryType: MediaType = isImage ? 'image' : 'video';

  return {
    id: Buffer.from(targetUrl).toString('base64').slice(0, 16),
    title: title || 'Facebook Media',
    description,
    url: targetUrl,
    type: primaryType,
    thumbnail,
    formats,
    sourceDomain: 'facebook.com',
    sourceType: 'social',
  };
}

/**
 * Universal Facebook Extractor
 * Multi-layer pipeline: Direct Page Inspector -> SnapSave Engine -> Fallback
 */
export async function extractFacebook(
  url: string
): Promise<{ item: MediaItem; engineUsed: string } | null> {
  const normalizedUrl = normalizeFacebookUrl(url);

  // Strategy 1: Direct Native Page Inspector
  try {
    const directItem = await extractFacebookDirect(normalizedUrl);
    if (directItem && directItem.formats.length > 0) {
      return {
        item: directItem,
        engineUsed: 'Native Facebook Direct Engine',
      };
    }
  } catch {
    // Proceed to SnapSave
  }

  // Strategy 2: SnapSave High-Speed Multi-Quality Resolver
  try {
    const snapItem = await extractWithSnapSave(normalizedUrl);
    if (snapItem && snapItem.formats.length > 0) {
      return {
        item: snapItem,
        engineUsed: 'SnapSave High-Speed Engine',
      };
    }
  } catch {
    // Proceed to next fallback
  }

  return null;
}
