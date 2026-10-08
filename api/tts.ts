import { EdgeTTS } from 'node-edge-tts';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default async function handler(req: any, res: any) {
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
    const { text, speed = 1.0, voice = 'female', isPoem = false } = body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    let processedText = text.trim();
    if (isPoem) {
      processedText = processedText
        .replace(/\n+/g, '... ')
        .replace(/([,;])\s*/g, '$1 ')
        .replace(/\s+/g, ' ');
    }

    const isMale = voice === 'male' || voice === 'vi-VN-NamMinhNeural';
    const selectedVoice = isMale ? 'vi-VN-NamMinhNeural' : 'vi-VN-HoaiMyNeural';

    // 1. Primary: EdgeTTS with vi-VN-HoaiMyNeural (Northern Vietnamese Female Voice, natural emotion)
    try {
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
        `tts_v_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`
      );

      await tts.ttsPromise(processedText, tempFilePath);
      const buffer = await fs.promises.readFile(tempFilePath);
      fs.promises.unlink(tempFilePath).catch(() => {});

      if (buffer && buffer.length > 0) {
        return res.status(200).json({
          audioBase64: buffer.toString('base64'),
          mimeType: 'audio/mp3',
          voice: selectedVoice,
        });
      }
    } catch (e1) {
      console.warn('EdgeTTS error on Vercel:', e1);
    }

    // 2. Secondary: Google Translate Vietnamese TTS (Giọng nữ miền Bắc)
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
        return res.status(200).json({
          audioBase64: buffer.toString('base64'),
          mimeType: 'audio/mp3',
          voice: 'google-vi',
        });
      }
    } catch (e2) {
      console.warn('Google TTS error on Vercel:', e2);
    }

    return res.status(500).json({
      error: 'TTS generation failed',
      fallback: true,
    });
  } catch (error: any) {
    console.error('TTS error on Vercel handler:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize speech',
      fallback: true,
    });
  }
}
