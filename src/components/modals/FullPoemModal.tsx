import React, { useState, useEffect } from 'react';
import { FULL_POEM } from '../../data/poemData';
import { audioService } from '../../services/audioService';

interface FullPoemModalProps {
  onClose: () => void;
}

export const FullPoemModal: React.FC<FullPoemModalProps> = ({ onClose }) => {
  const [playingStanza, setPlayingStanza] = useState<number | 'all' | null>(null);

  useEffect(() => {
    const unsub = audioService.subscribe((speaking) => {
      if (!speaking) {
        setPlayingStanza(null);
      }
    });
    return () => unsub();
  }, []);

  const handleReciteStanza = (stanzaIndex: number, lines: string[]) => {
    if (playingStanza === stanzaIndex) {
      audioService.stop();
      setPlayingStanza(null);
      return;
    }
    setPlayingStanza(stanzaIndex);
    const textToRecite = lines.join('. ');
    audioService.speak(textToRecite, {
      isPoem: true,
      onEnd: () => setPlayingStanza(null),
    });
  };

  const handleReciteAll = () => {
    if (playingStanza === 'all') {
      audioService.stop();
      setPlayingStanza(null);
      return;
    }
    setPlayingStanza('all');
    const allLines = FULL_POEM.flatMap((s) => s.lines).join('. ');
    audioService.speak(
      `Bài thơ Quê hương, tác giả Tế Hanh. ${allLines}`,
      {
        isPoem: true,
        onEnd: () => setPlayingStanza(null),
      }
    );
  };

  const handleStop = () => {
    audioService.stop();
    setPlayingStanza(null);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
              THI PHẨM KIỆT TÁC
            </span>
            <h3 className="text-base sm:text-lg font-bold text-amber-300 font-poem">
              Quê hương — Tế Hanh (1939)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {playingStanza ? (
              <button
                onClick={handleStop}
                className="px-3 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>⏹</span>
                <span>Dừng đọc</span>
              </button>
            ) : (
              <button
                onClick={handleReciteAll}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1 shadow cursor-pointer"
              >
                <span>🔊</span>
                <span>Ngâm toàn bài thơ</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Poem Scrollable Content */}
        <div className="py-3 overflow-y-auto space-y-4 pr-1 flex-1 font-poem text-xs sm:text-sm">
          {FULL_POEM.map((stanza, idx) => {
            const isThisPlaying = playingStanza === stanza.stanza;
            return (
              <div
                key={stanza.stanza}
                className={`p-3 rounded-xl border transition ${
                  isThisPlaying
                    ? 'bg-sky-950/70 border-amber-400 shadow-[0_0_15px_rgba(246,213,92,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-sans font-bold text-amber-400 tracking-wider">
                    {stanza.title}
                  </span>
                  <button
                    onClick={() => handleReciteStanza(stanza.stanza, stanza.lines)}
                    className="px-2 py-0.5 rounded bg-sky-900/60 hover:bg-sky-800 text-cyan-200 text-[11px] font-sans flex items-center space-x-1 cursor-pointer border border-sky-500/30"
                  >
                    <span>{isThisPlaying ? '⏹ Dừng' : '🔊 Nghe khổ này'}</span>
                  </button>
                </div>

                <div className="space-y-1 pl-3 border-l-2 border-sky-500/40 text-slate-200 italic leading-relaxed">
                  {stanza.lines.map((line, lIdx) => (
                    <p key={lIdx} className="hover:text-amber-200 transition-colors">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span>🎙️ Giọng nam miền Bắc Việt Nam chuẩn Hà Nội truyền cảm</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
