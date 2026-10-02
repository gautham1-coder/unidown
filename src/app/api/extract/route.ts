import { NextRequest, NextResponse } from 'next/server';
import { extractMedia } from '@/lib/extractors';
import { ExtractionRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30; // Up to 30s timeout on Vercel

export async function POST(req: NextRequest) {
  try {
    const body: ExtractionRequest = await req.json();

    if (!body || !body.url) {
      return NextResponse.json(
        { success: false, error: 'URL is required in the request body.' },
        { status: 400 }
      );
    }

    const result = await extractMedia(body);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
