import { ExtractionRequest, ExtractionResponse } from '../types';
import { extractDirectFile } from './direct';
import { extractWithCobalt } from './cobalt';
import { extractReddit } from './reddit';
import { extractTwitter } from './twitter';
import { extractFacebook } from './facebook';
import { scrapeWebpageMedia } from './web-scraper';

export async function extractMedia(req: ExtractionRequest): Promise<ExtractionResponse> {
  const { url } = req;

  if (!url || typeof url !== 'string') {
    return { success: false, error: 'A valid URL is required.' };
  }

  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    new URL(formattedUrl);
  } catch {
    return { success: false, error: 'The provided URL is not valid. Please enter a complete web address.' };
  }

  const hostname = new URL(formattedUrl).hostname.toLowerCase();

  // 1. Try Direct File inspection first
  try {
    const directResult = await extractDirectFile(formattedUrl);
    if (directResult) {
      return {
        success: true,
        item: directResult,
        engineUsed: 'Direct Stream Inspector',
      };
    }
  } catch {
    // Continue to next extractors
  }

  // 2. Platform specific native extractors
  if (
    hostname.includes('facebook.com') ||
    hostname.includes('fb.watch') ||
    hostname.includes('fb.gg') ||
    hostname.includes('facebook.net')
  ) {
    try {
      const fbResult = await extractFacebook(formattedUrl);
      if (fbResult && fbResult.item.formats.length > 0) {
        return {
          success: true,
          item: fbResult.item,
          engineUsed: fbResult.engineUsed,
        };
      }
    } catch {
      // Fallback
    }
  }

  if (hostname.includes('reddit.com') || hostname.includes('redd.it')) {
    try {
      const redditItem = await extractReddit(formattedUrl);
      if (redditItem) {
        return {
          success: true,
          item: redditItem,
          engineUsed: 'Native Reddit Extractor',
        };
      }
    } catch {
      // Fallback to cobalt or scraper
    }
  }

  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    try {
      const twitterItem = await extractTwitter(formattedUrl);
      if (twitterItem) {
        return {
          success: true,
          item: twitterItem,
          engineUsed: 'Native Twitter Extractor',
        };
      }
    } catch {
      // Fallback
    }
  }

  // 3. For Social Media & Video platforms, try Cobalt engine
  const isSocialPlatform = [
    'youtube.com', 'youtu.be',
    'tiktok.com',
    'instagram.com',
    'twitter.com', 'x.com',
    'reddit.com', 'redd.it',
    'soundcloud.com',
    'vimeo.com',
    'pinterest.com', 'pin.it',
    'facebook.com', 'fb.watch',
    'dailymotion.com',
    'twitch.tv',
    'tumblr.com',
  ].some((domain) => hostname.includes(domain));

  if (isSocialPlatform) {
    const cobaltRes = await extractWithCobalt(
      { ...req, url: formattedUrl },
      req.customBackendUrl
    );
    if (cobaltRes.success) {
      return cobaltRes;
    }
  }

  // 4. Universal Webpage Inspector & Scraper (works for any site!)
  try {
    const scrapedItem = await scrapeWebpageMedia(formattedUrl);
    if (scrapedItem && scrapedItem.formats.length > 0) {
      return {
        success: true,
        item: scrapedItem,
        engineUsed: 'Universal Web Inspector',
      };
    }
  } catch {
    // Scraper error
  }

  // 5. If everything failed on a social platform, re-try Cobalt as last ditch if not tried yet
  if (!isSocialPlatform) {
    const fallbackCobalt = await extractWithCobalt(
      { ...req, url: formattedUrl },
      req.customBackendUrl
    );
    if (fallbackCobalt.success) {
      return fallbackCobalt;
    }
  }

  return {
    success: false,
    error:
      'Could not extract downloadable media from this URL. The site may require a login, be private, or possess DRM protection.',
  };
}
