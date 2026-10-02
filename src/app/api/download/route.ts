import { NextRequest, NextResponse } from 'next/server';
import { sanitizeFilename } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  const filenameParam = req.nextUrl.searchParams.get('filename') || 'downloaded-media';

  if (!urlParam) {
    return new NextResponse('URL query parameter is required', { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlParam);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return new NextResponse('Invalid protocol', { status: 400 });
    }
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  try {
    const upstreamHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: '*/*',
    };

    // Forward range header if present (for seeking, resumable downloads)
    const clientRange = req.headers.get('range');
    if (clientRange) {
      upstreamHeaders['Range'] = clientRange;
    }

    const upstreamRes = await fetch(targetUrl.toString(), {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return new NextResponse(`Upstream server responded with ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    // Determine filename and extension
    let cleanFilename = sanitizeFilename(filenameParam);
    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';

    // If filename has no extension, append based on contentType
    if (!cleanFilename.includes('.')) {
      if (contentType.includes('video/mp4')) cleanFilename += '.mp4';
      else if (contentType.includes('video/webm')) cleanFilename += '.webm';
      else if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) cleanFilename += '.mp3';
      else if (contentType.includes('image/jpeg')) cleanFilename += '.jpg';
      else if (contentType.includes('image/png')) cleanFilename += '.png';
      else if (contentType.includes('image/gif')) cleanFilename += '.gif';
      else if (contentType.includes('application/pdf')) cleanFilename += '.pdf';
      else if (contentType.includes('application/zip')) cleanFilename += '.zip';
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set(
      'Content-Disposition',
      `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`
    );

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    const acceptRanges = upstreamRes.headers.get('accept-ranges');
    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }

    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    // Stream directly through without buffering entire file in memory
    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Download streaming error';
    return new NextResponse(`Streaming error: ${msg}`, { status: 502 });
  }
}
