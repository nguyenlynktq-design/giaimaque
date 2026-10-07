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
  });
});

// Text-to-Speech API using Gemini 3.8 Flash Lite TTS
// Configured specifically for authentic Northern Vietnamese male voice (giọng nam miền Bắc)
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceName = 'Puck', speed = 1.0, isPoem = false } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const trimmedText = text.trim();
    const cacheKey = `${trimmedText}_${voiceName}_${speed}_${isPoem}`;

    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
      });
      return;
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured',
        fallback: true,
      });
      return;
    }

    const voicePersonaPrompt = isPoem
      ? 'Giọng nam miền Bắc Việt Nam chuẩn Hà Nội, ngâm thơ truyền cảm, trầm ấm, hào sảng, nhịp nhàng sâu lắng, đậm chất trữ tình quê hương.'
      : 'Giọng nam miền Bắc Việt Nam chuẩn Hà Nội, rõ ràng, dõng dạc, hào sảng, ấm áp và truyền cảm như phát thanh viên giáo dục hoặc thầy giáo dạy Văn.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: voicePersonaPrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Puck and Charon are expressive male voices in Gemini TTS
            prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      res.status(500).json({
        error: 'No audio returned from Gemini TTS',
        fallback: true,
      });
      return;
    }

    // Cache the result in memory (limit to 100 items to avoid excessive RAM)
    if (audioCache.size > 100) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, { audioBase64: base64Audio, mimeType });

    res.json({
      audioBase64: base64Audio,
      mimeType,
      cached: false,
    });
  } catch (error: any) {
    console.error('TTS generation error:', error?.message || error);
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
