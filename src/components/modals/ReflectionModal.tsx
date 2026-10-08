import React, { useEffect, useState } from 'react';
import { Fragment } from '../../types';
import { audioService } from '../../services/audioService';

interface ReflectionModalProps {
  fragment: Fragment;
  onCloseAndProceed: () => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  fragment,
  onCloseAndProceed,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsub = audioService.subscribe((speaking, paused) => {
      setIsSpeaking(speaking);
      setIsPaused(paused);
    });

    // Attempt narration on open
    const timer = setTimeout(() => {
      audioService.speak(fragment.message);
    }, 300);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [fragment]);

  const handleToggleSpeak = () => {
    if (!isSpeaking) {
      audioService.speak(fragment.message);
    } else {
      audioService.togglePause();
    }
  };

  const handleStopSpeak = () => {
    audioService.stop();
  };

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md p-6 flex items-center justify-center animate-fadeIn">
      <div className="max-w-md w-full bg-gradient-to-b from-slate-900 to-sky-950 border-2 border-amber-400/80 rounded-2xl p-5 shadow-2xl relative text-center">
        {/* Badge */}
        <div className="w-14 h-14 mx-auto -mt-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg border-2 border-white pulse-subtle">
          🎁
        </div>

        <div className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          MẢNH HỒN LÀNG ĐÃ MỞ KHÓA
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
          MẢNH SỐ {fragment.id}: {fragment.name}
        </h3>

        {/* Poetic Verse Context */}
        <div className="text-[11px] text-cyan-300 font-poem italic mt-1 px-2">
          "{fragment.verse}"
        </div>

        {/* Message with Wave Styling */}
        <div className="my-3 p-3.5 bg-slate-900/80 rounded-xl border border-sky-400/40 text-slate-100 text-xs sm:text-sm italic font-poem relative text-left">
          <span className="text-amber-400 text-xl font-bold">“</span>
          <p className="inline px-1 leading-relaxed">{fragment.message}</p>
          <span className="text-amber-400 text-xl font-bold">”</span>
        </div>

        {/* Action Buttons with Pause / Resume / Stop */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {isSpeaking ? (
            <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1 rounded-xl border border-amber-400/50">
              <button
                onClick={handleToggleSpeak}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1 cursor-pointer transition active:scale-95 shadow"
                title={isPaused ? 'Tiếp tục đọc' : 'Tạm dừng đọc'}
              >
                <span>{isPaused ? '▶' : '⏸'}</span>
                <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
              </button>
              <button
                onClick={handleStopSpeak}
                className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                title="Dừng đọc"
              >
                <span>⏹</span>
                <span>Dừng</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleSpeak}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 cursor-pointer transition bg-slate-800 hover:bg-slate-700 text-cyan-200 border-sky-400/40"
              title="Giọng nam Miền Bắc chuẩn Hà Nội truyền cảm"
            >
              <span>🔊</span>
              <span>Nghe giọng đọc</span>
            </button>
          )}

          <button
            onClick={() => {
              audioService.stop();
              onCloseAndProceed();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center space-x-1.5 cursor-pointer transition transform active:scale-95"
          >
            <span>⛵</span>
            <span>Ghi nhớ & Tiếp tục</span>
          </button>
        </div>
      </div>
    </div>
  );
};
