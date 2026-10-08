// Audio Service for Northern Vietnamese Voice (Female Hoài My & Male Nam Minh) TTS & Sound Effects
export type AudioListener = (
  isPlaying: boolean,
  isPaused: boolean,
  text: string,
  voiceGender: 'female' | 'male'
) => void;

class AudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private voiceRate: number = 1.0;
  private voiceGender: 'female' | 'male' = 'female'; // Default Northern Vietnamese Female Voice (Hoài My)
  private currentAudioElement: HTMLAudioElement | null = null;
  private cachedBlobs: Map<string, string> = new Map();
  private listeners: Set<AudioListener> = new Set();
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentText: string = '';
  private userInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const handleInteraction = () => {
        this.userInteracted = true;
        this.initAudioContext();
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      };
      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('touchstart', handleInteraction, { once: true });

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          // Warm up browser voices
        };
      }
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.isPaused, this.currentText, this.voiceGender);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) =>
      fn(this.isSpeaking, this.isPaused, this.currentText, this.voiceGender)
    );
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

  public setVoiceGender(gender: 'female' | 'male') {
    this.voiceGender = gender;
    this.notify();
  }

  public getVoiceGender(): 'female' | 'male' {
    return this.voiceGender;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getCurrentText(): string {
    return this.currentText;
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

  // Play synthesized musical tones using Web Audio API
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

  // Pause playback
  public pause() {
    if (!this.isSpeaking) return;

    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }

    this.isPaused = true;
    this.notify();
  }

  // Resume playback
  public resume() {
    if (!this.isSpeaking || !this.isPaused) return;

    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play().catch((err) => {
        console.warn('Resume audio element error:', err);
      });
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    this.isPaused = false;
    this.notify();
  }

  // Toggle pause/resume
  public togglePause() {
    if (this.isPaused) {
      this.resume();
    } else if (this.isSpeaking) {
      this.pause();
    }
  }

  // Stop completely
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
    this.isPaused = false;
    this.currentText = '';
    this.notify();
  }

  // High-fidelity Northern Vietnamese Voice Speech Synthesis
  public async speak(
    text: string,
    options: { isPoem?: boolean; onStart?: () => void; onEnd?: () => void } = {}
  ): Promise<void> {
    if (!this.soundEnabled || !text) return;

    this.stop();
    this.initAudioContext();

    this.isSpeaking = true;
    this.isPaused = false;
    this.currentText = text;
    this.notify();
    if (options.onStart) options.onStart();

    const cleanText = text.trim();
    const cacheKey = `${cleanText}_${this.voiceRate}_${this.voiceGender}`;

    // 1. Check client-side cached Blob URL
    if (this.cachedBlobs.has(cacheKey)) {
      const url = this.cachedBlobs.get(cacheKey)!;
      this.playAudioUrl(url, options.onEnd);
      return;
    }

    // 2. Fetch from backend TTS endpoint (Microsoft vi-VN-HoaiMyNeural Female / vi-VN-NamMinhNeural Male)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          speed: this.voiceRate,
          voice: this.voiceGender,
          isPoem: options.isPoem || false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: data.mimeType || 'audio/mp3' });
          const url = URL.createObjectURL(blob);
          this.cachedBlobs.set(cacheKey, url);

          this.playAudioUrl(url, options.onEnd);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend TTS request error, trying fallback:', err);
    }

    // 3. Secondary Fallback: Direct Google Translate Vietnamese Audio Stream (Female Northern accent)
    try {
      const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        cleanText.slice(0, 250)
      )}&tl=vi&client=tw-ob`;
      this.playAudioUrl(gUrl, options.onEnd);
      return;
    } catch (gErr) {
      console.warn('Google stream error, checking browser voices:', gErr);
    }

    // 4. Tertiary Fallback: Browser Web Speech API (only if genuine Vietnamese voice exists)
    this.fallbackBrowserSpeech(cleanText, options.onEnd);
  }

  private playAudioUrl(url: string, onEnd?: () => void) {
    const audio = new Audio(url);
    this.currentAudioElement = audio;

    audio.onended = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      console.warn('Audio element error on URL playback');
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play() was interrupted or prevented by browser:', err);
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentText = '';
        this.notify();
        if (onEnd) onEnd();
      });
    }
  }

  private fallbackBrowserSpeech(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    // Strictly find Vietnamese voices (never let it default to English!)
    const viVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('vi') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('tiếng việt')
    );

    if (viVoices.length === 0) {
      console.warn('No Vietnamese voice installed in browser, skipping English voice distortion.');
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = this.voiceRate;
    utter.pitch = this.voiceGender === 'female' ? 1.05 : 0.92;
    utter.lang = 'vi-VN';

    // Prioritize selected gender voice
    if (this.voiceGender === 'female') {
      const femaleVi = viVoices.find(
        (v) =>
          v.name.toLowerCase().includes('hoaimy') ||
          v.name.toLowerCase().includes('linh') ||
          v.name.toLowerCase().includes('mai') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('google tiếng việt')
      );
      utter.voice = femaleVi || viVoices[0];
    } else {
      const maleVi = viVoices.find(
        (v) =>
          v.name.toLowerCase().includes('nam') ||
          v.name.toLowerCase().includes('minh') ||
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('an')
      );
      utter.voice = maleVi || viVoices[0];
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
