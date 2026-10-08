import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { EdgeTTS } from 'node-edge-tts';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory audio cache to guarantee instant playback on repeat requests
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

// Initialize Gemini client on server side (as tertiary fallback)
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
    defaultVoice: 'vi-VN-HoaiMyNeural', // Northern Vietnamese Female
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

// Helper: Generate authentic, highly expressive Northern Vietnamese Voice (Female Hoài My / Male Nam Minh)
async function generateVietnameseAudio(
  text: string,
  speed: number = 1.0,
  voiceChoice: string = 'female',
  isPoem: boolean = false
): Promise<{ buffer: Buffer; mimeType: string }> {
  const isMale = voiceChoice === 'male' || voiceChoice === 'vi-VN-NamMinhNeural';
  const selectedVoice = isMale ? 'vi-VN-NamMinhNeural' : 'vi-VN-HoaiMyNeural';

  const processedText = prepareNaturalVietnameseText(text, isPoem);

  // 1. Primary Engine: Microsoft Edge Neural TTS
  // vi-VN-HoaiMyNeural: Giọng nữ miền Bắc Hà Nội trong trẻo, biểu cảm tự nhiên, sâu lắng
  // vi-VN-NamMinhNeural: Giọng nam miền Bắc Hà Nội hào sảng, truyền cảm
  try {
    // Natural rate adjustment:
    // For poetry (ngâm thơ), a gentle -5% cadence allows natural breathing and rich emotional resonance
    const baseOffset = isPoem ? -5 : -2;
    const ratePercent = Math.round((speed - 1.0) * 100) + baseOffset;
    const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    const tts = new EdgeTTS({
      voice: selectedVoice,
      rate: rateStr,
      pitch: '+0Hz',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });

    const tempFilePath = path.join(
      os.tmpdir(),
      `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`
    );

    await tts.ttsPromise(processedText, tempFilePath);
    const buffer = await fs.promises.readFile(tempFilePath);
    fs.promises.unlink(tempFilePath).catch(() => {});

    if (buffer && buffer.length > 0) {
      return { buffer, mimeType: 'audio/mp3' };
    }
  } catch (edgeErr) {
    console.warn('EdgeTTS failed, falling back to Google Translate Vietnamese TTS:', edgeErr);
  }

  // 2. Secondary Fallback: Google Translate Vietnamese TTS (Giọng nữ miền Bắc)
  try {
    const encoded = encodeURIComponent(processedText.slice(0, 300));
    const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;
    const gRes = await fetch(gUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (gRes.ok) {
      const arrayBuf = await gRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length > 0) {
        return { buffer, mimeType: 'audio/mp3' };
      }
    }
  } catch (gErr) {
    console.warn('Google Translate TTS failed:', gErr);
  }

  // 3. Tertiary Fallback: Gemini TTS if available
  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: processedText,
                speechMetadata: {
                  style: isMale
                    ? 'Giọng nam miền Bắc Việt Nam chuẩn Hà Nội truyền cảm.'
                    : 'Giọng nữ miền Bắc Việt Nam chuẩn Hà Nội, trong trẻo, biểu cảm tự nhiên, ngâm thơ và đọc bài sâu lắng.',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: isMale ? 'Puck' : 'Kore' },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      if (base64Audio) {
        return {
          buffer: Buffer.from(base64Audio, 'base64'),
          mimeType: part?.inlineData?.mimeType || 'audio/wav',
        };
      }
    } catch (geminiErr) {
      console.warn('Gemini TTS fallback failed:', geminiErr);
    }
  }

  throw new Error('All TTS engines failed to synthesize speech');
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
    const cacheKey = `${trimmedText}_${speed}_${isPoem}_${voiceKey}`;

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
