// Audio Service for Northern Vietnamese Male Voice TTS & Sound Effects
type AudioListener = (isPlaying: boolean, text: string) => void;

class AudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private voiceRate: number = 1.0;
  private currentAudioElement: HTMLAudioElement | null = null;
  private cachedBlobs: Map<string, string> = new Map();
  private listeners: Set<AudioListener> = new Set();
  private isSpeaking: boolean = false;
  private currentText: string = '';

  constructor() {
    // Pre-warm voices on browser if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voice list ready
      };
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.currentText);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isSpeaking, this.currentText));
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setRate(rate: number) {
    this.voiceRate = rate;
  }

  public getRate(): number {
    return this.voiceRate;
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play synthesized tones using Web Audio API
  public playTone(freq: number, type: OscillatorType = 'sine', duration = 0.25, gainVal = 0.18) {
    if (!this.soundEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  public playCorrect() {
    if (!this.soundEnabled) return;
    this.playTone(523.25, 'triangle', 0.12, 0.22); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.22), 100); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.28, 0.26), 200); // G5
  }

  public playBonus() {
    if (!this.soundEnabled) return;
    this.playTone(440, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(880, 'sine', 0.25, 0.25), 100);
  }

  public playUnlock() {
    if (!this.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.35, 0.2), idx * 110);
    });
  }

  public playError() {
    if (!this.soundEnabled) return;
    this.playTone(220, 'sawtooth', 0.15, 0.15);
    setTimeout(() => this.playTone(185, 'sawtooth', 0.22, 0.15), 110);
  }

  public playFanfare() {
    if (!this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.45, 0.25), idx * 140);
    });
  }

  public stop() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentText = '';
    this.notify();
  }

  // High-fidelity Northern Vietnamese Male Voice Speech Synthesis
  public async speak(
    text: string,
    options: { isPoem?: boolean; onStart?: () => void; onEnd?: () => void } = {}
  ): Promise<void> {
    if (!this.soundEnabled || !text) return;

    this.stop();
    this.initAudioContext();

    this.isSpeaking = true;
    this.currentText = text;
    this.notify();
    if (options.onStart) options.onStart();

    const cacheKey = `${text.trim()}_${options.isPoem ? 'poem' : 'prose'}_${this.voiceRate}`;

    // 1. Check client-side cached Blob URL
    if (this.cachedBlobs.has(cacheKey)) {
      const url = this.cachedBlobs.get(cacheKey)!;
      this.playAudioUrl(url, options.onEnd);
      return;
    }

    // 2. Try calling Gemini Neural TTS backend API for natural Northern Vietnamese male voice
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: 'Puck', // Warm, expressive male persona
          speed: this.voiceRate,
          isPoem: options.isPoem || false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          // Convert base64 to Blob URL
          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
          const url = URL.createObjectURL(blob);
          this.cachedBlobs.set(cacheKey, url);

          this.playAudioUrl(url, options.onEnd);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend TTS failed, falling back to Web Speech API:', err);
    }

    // 3. Fallback: Browser Web Speech API tuned to Northern Vietnamese male timbre
    this.fallbackBrowserSpeech(text, options.onEnd);
  }

  private playAudioUrl(url: string, onEnd?: () => void) {
    const audio = new Audio(url);
    audio.playbackRate = this.voiceRate;
    this.currentAudioElement = audio;

    audio.onended = () => {
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    audio.play().catch((err) => {
      console.warn('Playback error:', err);
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    });
  }

  private fallbackBrowserSpeech(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = this.voiceRate;
    utter.pitch = 0.92; // Slightly deeper, warm male tone
    utter.lang = 'vi-VN';

    const voices = window.speechSynthesis.getVoices();
    // Prioritize Northern Vietnamese male voice (Nam, Minh, Northern, vi-VN)
    const northernMaleVoice =
      voices.find(
        (v) =>
          v.lang.includes('vi') &&
          (v.name.toLowerCase().includes('nam') ||
            v.name.toLowerCase().includes('minh') ||
            v.name.toLowerCase().includes('male'))
      ) || voices.find((v) => v.lang.includes('vi') || v.lang.startsWith('vi'));

    if (northernMaleVoice) {
      utter.voice = northernMaleVoice;
    }

    utter.onend = () => {
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    utter.onerror = () => {
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utter);
  }
}

export const audioService = new AudioService();
