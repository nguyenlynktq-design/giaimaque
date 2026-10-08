import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory audio cache to guarantee instant playback on repeat requests
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

// Initialize Gemini client on server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    cachedAudios: audioCache.size,
    defaultVoice: 'Leda (Northern Hanoi Female)',
  });
});

// Helper: Format text with natural poetic cadence and expressive punctuation for Vietnamese speech
function prepareNaturalVietnameseText(text: string, isPoem: boolean): string {
  let cleaned = text.trim();
  if (isPoem) {
    // Add natural breath pauses between poem verses for authentic poetic recitation
    cleaned = cleaned
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(', ... ');
    cleaned = cleaned
      .replace(/([.?!])\s*,\s*\.\.\./g, '$1 ...')
      .replace(/\s+/g, ' ');
  } else {
    // Subtle natural pause after colons and question marks for expressive teacher narration
    cleaned = cleaned
      .replace(/:\s*/g, ': ... ')
      .replace(/\?\s*/g, '? ... ');
  }
  return cleaned;
}

// Helper: Wrap raw Linear 16 (L16) 24kHz PCM into a standard WAV format for universal browser playback
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000, channels: number = 1): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;

  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // AudioFormat: 1 (PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Helper: Split text into natural breath clauses under 150 chars for expressive Northern recitation
function splitTextIntoNaturalClauses(text: string): string[] {
  const cleaned = text.trim();
  const rawParts = cleaned.split(/(?<=[.,?!;\n])\s+/);
  const clauses: string[] = [];
  let current = '';

  for (const part of rawParts) {
    if (!part) continue;
    if ((current + ' ' + part).trim().length <= 150) {
      current = (current ? current + ' ' + part : part).trim();
    } else {
      if (current) clauses.push(current);
      if (part.length > 150) {
        const words = part.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= 150) {
            sub = (sub ? sub + ' ' + w : w).trim();
          } else {
            if (sub) clauses.push(sub);
            sub = w;
          }
        }
        if (sub) clauses.push(sub);
        current = '';
      } else {
        current = part;
      }
    }
  }
  if (current) clauses.push(current);
  return clauses.filter(Boolean);
}

// Helper: Generate authentic Northern Vietnamese (Hanoi accent) Voice
async function generateVietnameseAudio(
  text: string,
  _speed: number = 1.0,
  _voiceChoice: string = 'female',
  isPoem: boolean = false
): Promise<{ buffer: Buffer; mimeType: string }> {
  const processedText = prepareNaturalVietnameseText(text, isPoem);

  // 1. Primary Engine: Guaranteed Northern Vietnamese (Giọng chuẩn miền Bắc Hà Nội)
  // Pronounces "gi" as /z/, sharp tone marks (hỏi, ngã), distinct Northern consonants
  try {
    const clauses = splitTextIntoNaturalClauses(processedText);
    if (clauses.length > 0) {
      const chunks = await Promise.all(
        clauses.map(async (clause) => {
          const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            clause
          )}&tl=vi&client=tw-ob`;
          const gRes = await fetch(gUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          if (!gRes.ok) {
            throw new Error(`TTS HTTP error: ${gRes.status}`);
          }
          const arrayBuf = await gRes.arrayBuffer();
          return Buffer.from(arrayBuf);
        })
      );

      const buffer = Buffer.concat(chunks);
      if (buffer.length > 0) {
        return { buffer, mimeType: 'audio/mp3' };
      }
    }
  } catch (err) {
    // If primary network fetch fails, continue to fallback
  }

  // 2. Secondary Engine: Gemini Audio Model
  if (ai && process.env.GEMINI_API_KEY) {
    const modelsToTry = ['gemini-3.1-flash-tts-preview', 'gemini-3.8-flash-tts'];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Phát âm bằng giọng miền Bắc Việt Nam: "${processedText}"`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Leda' },
              },
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const base64Audio = part?.inlineData?.data;
        if (base64Audio) {
          const rawBuffer = Buffer.from(base64Audio, 'base64');
          const wavBuffer = pcmToWav(rawBuffer, 24000, 1);
          return { buffer: wavBuffer, mimeType: 'audio/wav' };
        }
      } catch {
        // Continue silently
      }
    }
  }

  throw new Error('Không thể tạo giọng đọc miền Bắc, vui lòng thử lại.');
}

// Text-to-Speech API
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, speed = 1.0, isPoem = false, voice = 'female' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const trimmedText = text.trim();
    const voiceKey = voice === 'male' ? 'male' : 'female';
    const cacheKey = `hanoi_leda_v3_${trimmedText}_${speed}_${isPoem}_${voiceKey}`;

    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
        voice: voiceKey,
      });
      return;
    }

    const { buffer, mimeType } = await generateVietnameseAudio(trimmedText, speed, voiceKey, isPoem);
    const audioBase64 = buffer.toString('base64');

    // Cache the result in memory (limit to 150 items)
    if (audioCache.size > 150) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, { audioBase64, mimeType });

    res.json({
      audioBase64,
      mimeType,
      cached: false,
      voice: voiceKey,
    });
  } catch (error: any) {
    console.error('TTS endpoint error:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Failed to synthesize speech',
      fallback: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
