import React, { useEffect, useState } from 'react';
import { audioService } from '../services/audioService';

interface HeaderProps {
  currentStage: number;
  unlockedStages: number;
  soundEnabled: boolean;
  voiceRate: number;
  onToggleSound: () => void;
  onSetRate: (rate: number) => void;
  onOpenGuide: () => void;
  onOpenPoem: () => void;
  onResetGame: () => void;
}

const STAGES = [
  { id: 1, name: 'Bờ biển' },
  { id: 2, name: 'Ra khơi' },
  { id: 3, name: 'Cánh buồm' },
  { id: 4, name: 'Trở về' },
  { id: 5, name: 'Con người' },
  { id: 6, name: 'Nỗi nhớ' },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  unlockedStages,
  soundEnabled,
  voiceRate,
  onToggleSound,
  onSetRate,
  onOpenGuide,
  onOpenPoem,
  onResetGame,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return audioService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="relative z-20 flex-shrink-0 bg-slate-900/90 backdrop-blur border-b border-sky-500/30 px-3 py-1.5 flex items-center justify-between text-xs sm:text-sm shadow-md">
      {/* Brand & Left Actions */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 font-bold tracking-wider text-amber-400 text-sm sm:text-base uppercase">
          <span className="text-xl">⛵</span>
          <span className="hidden md:inline bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            GIẢI MÃ HỒN LÀNG
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-200 border border-sky-400/40 font-normal">
            Quê hương • Tế Hanh
          </span>
        </div>

        <button
          onClick={onOpenPoem}
          title="Đọc toàn bài thơ Quê hương"
          className="px-2 py-1 rounded-lg bg-sky-900/40 hover:bg-sky-800/60 text-cyan-200 flex items-center space-x-1 transition border border-sky-400/30 cursor-pointer"
        >
          <span>📜</span>
          <span className="hidden lg:inline text-xs font-medium">Toàn bài thơ</span>
        </button>

        <button
          onClick={onOpenGuide}
          title="Hướng dẫn cách chơi"
          className="px-2 py-1 rounded-lg bg-sky-900/40 hover:bg-sky-800/60 text-cyan-200 flex items-center space-x-1 transition border border-sky-400/30 cursor-pointer"
        >
          <span>🧭</span>
          <span className="hidden lg:inline text-xs font-medium">Hướng dẫn</span>
        </button>

        <button
          onClick={onResetGame}
          title="Chơi lại từ đầu"
          className="px-2 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 flex items-center space-x-1 transition border border-rose-500/30 cursor-pointer"
        >
          <span>🔄</span>
          <span className="hidden lg:inline text-xs font-medium">Đặt lại</span>
        </button>
      </div>

      {/* Middle: Stage Navigation Breadcrumbs */}
      <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/70 px-3 py-1 rounded-full border border-sky-500/30 text-[11px] sm:text-xs">
        <span className="text-amber-400 font-semibold flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
          <span>Đã mở: {Math.min(6, unlockedStages - 1)}/6 chặng</span>
        </span>

        <div className="hidden xl:flex items-center space-x-1.5 text-slate-300 pl-2 border-l border-slate-700">
          {STAGES.map((stg, idx) => {
            const isCompleted = stg.id < unlockedStages;
            const isCurrent = Math.floor(currentStage) === stg.id;
            return (
              <React.Fragment key={stg.id}>
                {idx > 0 && <span className="text-slate-600">›</span>}
                <span
                  className={
                    isCompleted
                      ? 'font-medium text-emerald-400'
                      : isCurrent
                        ? 'font-bold text-amber-300 underline'
                        : 'text-slate-500'
                  }
                >
                  {stg.id}. {stg.name}
                  {isCompleted ? ' ✓' : isCurrent ? '' : ' 🔒'}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Right: Audio Indicator & Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Speaking visualizer badge */}
        {isSpeaking && (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-sky-950/80 border border-cyan-400/60 text-cyan-200 text-[10px]">
            <span className="sound-bar h-2" style={{ animationDelay: '0s' }} />
            <span className="sound-bar h-3" style={{ animationDelay: '0.2s' }} />
            <span className="sound-bar h-2" style={{ animationDelay: '0.4s' }} />
            <span className="ml-1 font-medium hidden sm:inline">Giọng nam miền Bắc</span>
          </div>
        )}

        {/* Speed Switcher */}
        <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-sky-500/30 text-[11px]">
          <span className="text-slate-400 px-1" title="Tốc độ giọng đọc">
            🎙️
          </span>
          <button
            onClick={() => onSetRate(1.0)}
            className={`px-1.5 py-0.5 rounded font-medium cursor-pointer ${
              voiceRate === 1.0 ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => onSetRate(1.2)}
            className={`px-1.5 py-0.5 rounded font-medium cursor-pointer ${
              voiceRate === 1.2 ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            1.2x
          </button>
          <button
            onClick={() => onSetRate(1.5)}
            className={`px-1.5 py-0.5 rounded font-medium cursor-pointer ${
              voiceRate === 1.5 ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            1.5x
          </button>
        </div>

        {/* Mute/Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-850 text-cyan-200 border border-cyan-400/30 cursor-pointer"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-850 text-cyan-200 border border-cyan-400/30 cursor-pointer"
          title="Toàn màn hình"
        >
          ⛶
        </button>
      </div>
    </header>
  );
};
