import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface Stage2VoyageProps {
  onStageComplete: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const VERBS = [
  { text: 'hăng', isCorrect: true },
  { text: 'phăng', isCorrect: true },
  { text: 'trôi', isCorrect: false },
  { text: 'vượt', isCorrect: true },
  { text: 'giương', isCorrect: true },
  { text: 'lặng lẽ', isCorrect: false },
  { text: 'rướn', isCorrect: true },
  { text: 'thâu góp', isCorrect: true },
  { text: 'dừng lại', isCorrect: false },
];

export const Stage2Voyage: React.FC<Stage2VoyageProps> = ({
  onStageComplete,
  onAwardPoints,
  onShowToast,
}) => {
  const [selectedVerbs, setSelectedVerbs] = useState<Set<string>>(new Set());
  const [showQuestion2, setShowQuestion2] = useState(false);
  const [q2Answered, setQ2Answered] = useState<string | null>(null);

  const handleVerbClick = (verb: string, isCorrect: boolean) => {
    if (selectedVerbs.has(verb)) return;

    if (isCorrect) {
      const next = new Set(selectedVerbs);
      next.add(verb);
      setSelectedVerbs(next);

      audioService.playTone(420 + next.size * 70, 'triangle', 0.2);

      if (next.size === 6) {
        audioService.playCorrect();
        setTimeout(() => {
          setShowQuestion2(true);
        }, 700);
      }
    } else {
      audioService.playError();
      onShowToast(`"${verb}" không phải là động từ thể hiện tư thế ra khơi mạnh mẽ!`, '❌');
    }
  };

  const handleQ2Choice = (choice: 'A' | 'B' | 'C') => {
    setQ2Answered(choice);
    if (choice === 'B') {
      audioService.playCorrect();
      onAwardPoints(10, "Xuất sắc! Giải mã đúng hình tượng 'con tuấn mã'");
      setTimeout(() => {
        onStageComplete();
      }, 700);
    } else {
      audioService.playError();
      onShowToast('Chưa chính xác! Chú ý đến vẻ đẹp hào hùng và tư thế người chài!', '⚠️');
    }
  };

  const count = selectedVerbs.size;
  const offsets = [-100, -60, -20, 20, 60, 100];
  const currentOffset = count > 0 ? offsets[count - 1] : -100;
  const sailArc = 170 + count * 8;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Challenge Prompt */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30 flex items-center justify-between text-xs sm:text-sm">
        <div>
          <span className="text-amber-400 font-bold">Thử thách 1:</span>
          <span className="text-slate-200 ml-1">
            Nhấp chọn các động từ mạnh biểu hiện khí thế ra khơi để tiếp thêm sức mạnh cho con thuyền vượt sóng!
          </span>
        </div>
        <span className="text-xs bg-sky-950/80 px-2.5 py-0.5 rounded-full text-cyan-200 border border-cyan-400/30 whitespace-nowrap ml-2 font-medium">
          Đã nạp: <strong className="text-amber-400">{count}</strong>/6 động từ
        </span>
      </div>

      {/* Boat Sailing Arena */}
      <div className="relative flex-1 my-2 rounded-2xl overflow-hidden border border-sky-500/50 bg-gradient-to-b from-[#0a3152] via-[#0e4875] to-[#06253d] flex flex-col justify-end items-center p-4">
        {/* Animated Boat */}
        <div
          className="relative transition-all duration-700 ease-out mb-2"
          style={{ transform: `translateX(${currentOffset}px)` }}
        >
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none">
            {/* Animated Sail */}
            <path
              d={`M110,15 Q${sailArc},60 110,105 Z`}
              fill="#ffffff"
              opacity="0.9"
              stroke="#f6d55c"
              strokeWidth="2.5"
            />
            <path
              d="M110,30 Q80,65 110,100 Z"
              fill="#e2e8f0"
              opacity="0.65"
              stroke="#f6d55c"
              strokeWidth="1.5"
            />
            {/* Mast */}
            <line x1="110" y1="10" x2="110" y2="120" stroke="#f6d55c" strokeWidth="4" strokeLinecap="round" />
            {/* Flag */}
            <polygon points="110,10 130,16 110,22" fill="#ed553b" />
            {/* Hull */}
            <path d="M30,110 L190,110 L165,138 L55,138 Z" fill="#92400e" stroke="#fcd34d" strokeWidth="2.5" />
            {/* Water bow splash */}
            {count >= 3 && (
              <path d="M190,115 Q215,105 205,125" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            )}
          </svg>
          <div className="text-[11px] font-bold text-center text-amber-300 mt-1 uppercase tracking-wider">
            {count === 6 ? '⛵ Thuyền rẽ sóng lao vút ra khơi!' : `Khí thế dâng cao (${count}/6)`}
          </div>
        </div>

        {/* Dynamic Ocean waves below boat */}
        <div className="w-full h-8 flex items-center justify-center space-x-1 opacity-70">
          <div className="h-1.5 w-1/3 bg-cyan-400/40 rounded-full animate-pulse" />
          <div className="h-2 w-1/2 bg-cyan-300/50 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="h-1.5 w-1/3 bg-cyan-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>

        {/* Question 2 Overlay once verbs are loaded */}
        {showQuestion2 && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm p-4 flex flex-col justify-center items-center text-center z-20">
            <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400/80 p-4 rounded-2xl shadow-2xl">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                Thử thách 2 • Giải mã biện pháp nghệ thuật
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Tác dụng của hình ảnh so sánh: <span className="text-amber-300 font-poem italic">"Chiếc thuyền nhẹ hăng như con tuấn mã"</span> là gì?
              </h3>

              <div className="grid grid-cols-1 gap-2 mt-4 text-xs text-left">
                <button
                  onClick={() => handleQ2Choice('A')}
                  className={`p-2.5 rounded-xl border text-slate-200 transition cursor-pointer ${
                    q2Answered === 'A' ? 'bg-rose-800 border-rose-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  A. Chỉ nói về tốc độ di chuyển nhanh của con thuyền trên sông
                </button>
                <button
                  onClick={() => handleQ2Choice('B')}
                  className={`p-2.5 rounded-xl border text-slate-200 transition cursor-pointer ${
                    q2Answered === 'B' ? 'bg-emerald-600 border-emerald-400 font-bold text-white' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  B. Làm con thuyền hiện lên khỏe khoắn, mạnh mẽ, tràn đầy sinh lực và vẻ đẹp dũng mãnh của người lao động
                </button>
                <button
                  onClick={() => handleQ2Choice('C')}
                  className={`p-2.5 rounded-xl border text-slate-200 transition cursor-pointer ${
                    q2Answered === 'C' ? 'bg-rose-800 border-rose-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  C. Nhấn mạnh việc ngư dân sử dụng ngựa kéo thuyền trên bờ cát
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word Tray */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30">
        <div className="text-[11px] text-slate-300 mb-1.5 font-semibold">
          Chọn đúng 6 động từ giàu sức biểu cảm trong khổ 2:
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {VERBS.map((v) => {
            const isSelected = selectedVerbs.has(v.text);
            return (
              <button
                key={v.text}
                onClick={() => handleVerbClick(v.text, v.isCorrect)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow'
                    : 'bg-sky-950/60 hover:bg-amber-400 hover:text-slate-950 border-cyan-400/40 text-cyan-200'
                }`}
              >
                "{v.text}"
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
