import { ExtractionRequest, ExtractionResponse, MediaFormat, MediaItem, MediaType } from '../types';
import { getDomain, sanitizeFilename } from '../utils';

// Curated list of reliable community instances with fallback rotation
export const DEFAULT_COBALT_INSTANCES = [
  'https://cobalt-backend.onrender.com',
  'https://api.cobalt.tools',
  'https://cobalt.kwiatekm.pl',
  'https://cobalt.canine.tools',
  'https://co.wuk.sh',
];

interface CobaltSuccessResponse {
  status: 'tunnel' | 'redirect' | 'picker';
  url?: string;
  filename?: string;
  picker?: Array<{
    type?: 'photo' | 'video' | 'gif';
    url: string;
    thumb?: string;
  }>;
  audio?: string;
  audioFilename?: string;
}

interface CobaltErrorResponse {
  status: 'error';
  error: {
    code: string;
    context?: Record<string, unknown>;
  };
}

type CobaltResponse = CobaltSuccessResponse | CobaltErrorResponse;

export async function extractWithCobalt(
  req: ExtractionRequest,
  specificInstanceUrl?: string
): Promise<ExtractionResponse> {
  const instances = specificInstanceUrl
    ? [specificInstanceUrl, ...DEFAULT_COBALT_INSTANCES]
    : [
        process.env.COBALT_API_URL,
        process.env.DEFAULT_COBALT_URL,
        ...DEFAULT_COBALT_INSTANCES,
      ].filter(Boolean) as string[];

  const uniqueInstances = Array.from(new Set(instances));
  let lastError = 'No responsive backend instance found.';

  for (const instance of uniqueInstances) {
    try {
      const endpoint = instance.endsWith('/') ? instance.slice(0, -1) : instance;
      const targetApi = `${endpoint}/`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const payload: Record<string, unknown> = {
        url: req.url,
        videoQuality: req.videoQuality || '1080',
        audioFormat: req.audioFormat || 'mp3',
        downloadMode: req.audioOnly ? 'audio' : 'auto',
      };

      const res = await fetch(targetApi, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'UniDown-App/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        lastError = `Instance ${endpoint} returned status ${res.status}`;
        continue;
      }

      const data: CobaltResponse = await res.json();

      if (data.status === 'error') {
        lastError = data.error?.code || 'Extraction failed for this platform.';
        // If it's a specific platform error from the instance, break or continue
        continue;
      }

      const domain = getDomain(req.url);

      if (data.status === 'tunnel' || data.status === 'redirect') {
        const streamUrl = data.url;
        if (!streamUrl) continue;

        const filename = sanitizeFilename(data.filename || `${domain}-media`);
        const ext = filename.split('.').pop() || (req.audioOnly ? 'mp3' : 'mp4');
        const mediaType: MediaType = req.audioOnly ? 'audio' : 'video';

        const formats: MediaFormat[] = [
          {
            id: 'primary',
            label: req.audioOnly ? 'Audio (MP3)' : `Video (${req.videoQuality || 'HD'})`,
            ext,
            url: streamUrl,
            quality: req.videoQuality || 'HD',
            hasAudio: true,
            hasVideo: !req.audioOnly,
            isDirect: false,
          },
        ];

        const item: MediaItem = {
          id: Buffer.from(req.url).toString('base64').slice(0, 16),
          title: filename.replace(/\.[^/.]+$/, ''),
          url: req.url,
          type: mediaType,
          thumbnail: undefined,
          formats,
          sourceDomain: domain,
          sourceType: 'social',
        };

        return {
          success: true,
          item,
          engineUsed: `Cobalt Engine (${endpoint})`,
        };
      }

      if (data.status === 'picker' && Array.isArray(data.picker) && data.picker.length > 0) {
        const pickerItems: MediaItem[] = data.picker.map((p, idx) => {
          const pType: MediaType = p.type === 'photo' ? 'image' : 'video';
          const pExt = pType === 'image' ? 'jpg' : 'mp4';
          const title = `${domain}-item-${idx + 1}`;

          return {
            id: `${Buffer.from(req.url).toString('base64').slice(0, 10)}-${idx}`,
            title,
            url: p.url,
            type: pType,
            thumbnail: p.thumb || (pType === 'image' ? p.url : undefined),
            formats: [
              {
                id: `picker-${idx}`,
                label: `Item #${idx + 1} (${pType.toUpperCase()})`,
                ext: pExt,
                url: p.url,
                quality: 'High',
                isDirect: true,
              },
            ],
            sourceDomain: domain,
            sourceType: 'social',
          };
        });

        return {
          success: true,
          picker: pickerItems,
          engineUsed: `Cobalt Engine Picker (${endpoint})`,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = msg;
      continue;
    }
  }

  return {
    success: false,
    error: lastError,
  };
}
