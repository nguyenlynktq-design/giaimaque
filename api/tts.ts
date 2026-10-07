import { GoogleGenAI } from '@google/genai';

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

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { text, voiceName = 'Puck', speed = 1.0, isPoem = false } = body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on Vercel',
        fallback: true,
      });
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
              text: text.trim(),
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
            prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      return res.status(500).json({
        error: 'No audio returned',
        fallback: true,
      });
    }

    return res.status(200).json({
      audioBase64: base64Audio,
      mimeType,
      cached: false,
    });
  } catch (error: any) {
    console.error('TTS error on Vercel:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize speech',
      fallback: true,
    });
  }
}
