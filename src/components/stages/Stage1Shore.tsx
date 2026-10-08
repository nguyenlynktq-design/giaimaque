import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface Stage1ShoreProps {
  onStageComplete: () => void;
  onSkipStage?: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

interface HotspotItem {
  id: string;
  text: string;
  icon: string;
  isCorrect: boolean;
  top: string;
  left: string;
}

const HOTSPOTS: HotspotItem[] = [
  { id: '1', text: 'làm nghề chài lưới', icon: '🕸️', isCorrect: true, top: '28%', left: '10%' },
  { id: '2', text: 'nước bao vây', icon: '🌊', isCorrect: true, top: '56%', left: '22%' },
  { id: '3', text: 'cách biển nửa ngày sông', icon: '🧭', isCorrect: true, top: '20%', left: '44%' },
  { id: '4', text: 'thuyền đi đánh cá', icon: '⛵', isCorrect: true, top: '46%', left: '68%' },
  { id: '5', text: 'bến đỗ', icon: '⚓', isCorrect: true, top: '74%', left: '15%' },
  { id: '6', text: 'cá đầy ghe', icon: '🐟', isCorrect: true, top: '70%', left: '72%' },
  // Distractors
  { id: 'd1', text: 'đồng lúa chín vàng', icon: '🌾', isCorrect: false, top: '16%', left: '76%' },
  { id: 'd2', text: 'tiếng chuông chùa', icon: '🔔', isCorrect: false, top: '72%', left: '44%' },
];

export const Stage1Shore: React.FC<Stage1ShoreProps> = ({
  onStageComplete,
  onSkipStage,
  onAwardPoints,
  onShowToast,
}) => {
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleClick = (item: HotspotItem) => {
    if (foundIds.has(item.id)) return;

    if (item.isCorrect) {
      const next = new Set(foundIds);
      next.add(item.id);
      setFoundIds(next);

      audioService.playTone(550 + next.size * 65, 'triangle', 0.16);

      if (next.size === 6) {
        audioService.playCorrect();
        onAwardPoints(10, 'Hoàn thành xuất sắc Chặng 1: Bờ biển!');
        setTimeout(() => {
          onStageComplete();
        }, 700);
      }
    } else {
      audioService.playError();
      setErrorId(item.id);
      onShowToast(`"${item.text}" không phải là chi tiết về làng chài trong bài thơ!`, '❌');
      setTimeout(() => setErrorId(null), 900);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Challenge Prompt */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30 flex items-center justify-between text-xs sm:text-sm">
        <div>
          <span className="text-amber-400 font-bold">Câu hỏi:</span>
          <span className="text-slate-200 ml-1">
            Những chi tiết nào giúp em nhận biết quê hương của tác giả là một làng chài ven biển?
          </span>
        </div>
        <span className="text-xs bg-sky-950/80 px-2.5 py-0.5 rounded-full text-cyan-200 whitespace-nowrap ml-2 border border-cyan-400/30 font-medium">
          Đã tìm: <strong className="text-amber-400">{foundIds.size}</strong>/6 chi tiết
        </span>
      </div>

      {/* Interactive Panorama Landscape */}
      <div className="relative flex-1 my-2 rounded-2xl overflow-hidden border border-sky-500/50 bg-gradient-to-b from-[#1b5075] via-[#103b5b] to-[#082236] shadow-inner flex items-center justify-center">
        {/* SVG Coastal Backdrop */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 400">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ea3cf" />
              <stop offset="40%" stopColor="#2a6d96" />
              <stop offset="100%" stopColor="#0a2a44" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#skyGrad)" />
          {/* Distant Mountains */}
          <polygon points="0,220 150,140 320,210 500,130 680,220 800,160 800,280 0,280" fill="#0d3656" opacity="0.65" />
          {/* River and Estuary */}
          <path d="M0,260 Q400,220 800,280 L800,400 L0,400 Z" fill="#0c4266" />
          {/* Shore Sand & Wooden Pier */}
          <path d="M0,320 Q280,290 520,340 Q650,360 800,330 L800,400 L0,400 Z" fill="#b08b59" opacity="0.8" />
          <path d="M120,325 L260,325 L240,350 L100,350 Z" fill="#543d2b" />
        </svg>

        {/* Hotspots Container */}
        <div className="relative w-full h-full max-w-[850px] p-4 text-xs font-semibold">
          {HOTSPOTS.map((item) => {
            const isFound = foundIds.has(item.id);
            const isErr = errorId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                style={{ top: item.top, left: item.left }}
                className={`absolute p-2 rounded-xl border transition-all transform hover:scale-105 shadow-lg flex items-center space-x-1.5 cursor-pointer ${
                  isFound
                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-300 scale-105'
                    : isErr
                      ? 'bg-rose-700 text-white border-rose-400 animate-bounce'
                      : item.isCorrect
                        ? 'bg-slate-900/85 hover:bg-amber-500 hover:text-slate-950 text-cyan-200 border-cyan-400/50'
                        : 'bg-slate-900/70 hover:bg-rose-900/80 text-slate-300 border-slate-700/60'
                }`}
              >
                <span>{isFound ? '✓' : item.icon}</span>
                <span>"{item.text}"</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Helper */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 Nhấp vào các hình ảnh, từ ngữ gắn với bức tranh sinh hoạt làng chài trong 2 câu thơ đầu.</span>
        <div className="flex items-center space-x-2">
          <span className="text-amber-400 font-semibold hidden sm:inline">Tìm đủ 6 chi tiết chính xác</span>
          {onSkipStage && (
            <button
              onClick={onSkipStage}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-600 text-xs font-semibold cursor-pointer transition active:scale-95"
              title="Chuyển sang chặng kế tiếp mà không tính điểm"
            >
              ⏭️ Chuyển chặng (0đ)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
