import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface Stage3SailProps {
  onStageComplete: () => void;
  onSkipStage?: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const Stage3Sail: React.FC<Stage3SailProps> = ({
  onStageComplete,
  onSkipStage,
  onAwardPoints,
  onShowToast,
}) => {
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({
    A: false,
    B: false,
    C: false,
    D: false,
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleOption = (key: 'A' | 'B' | 'C' | 'D') => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheck = () => {
    // Correct answers are B and C
    if (!selected.A && selected.B && selected.C && !selected.D) {
      setIsSuccess(true);
      audioService.playCorrect();
      onAwardPoints(10, 'Tuyệt vời! Giải mã trọn vẹn biểu tượng cánh buồm');
      setTimeout(() => {
        onStageComplete();
      }, 900);
    } else {
      audioService.playError();
      onShowToast('Chưa chính xác! Gợi ý: Hãy chọn 2 tầng nghĩa biểu tượng sâu sắc nhất (B và C), hoặc bấm chuyển chặng.', '⚠️');
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Challenge Prompt */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30 text-xs sm:text-sm flex items-center justify-between">
        <div>
          <span className="text-amber-400 font-bold">Thử thách:</span>
          <span className="text-slate-200 ml-1">
            Chọn <strong className="text-amber-300">TẤT CẢ các tầng nghĩa đúng</strong> của câu thơ dưới đây (Có nhiều hơn một đáp án đúng):
          </span>
        </div>
        {onSkipStage && (
          <button
            onClick={onSkipStage}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-600 cursor-pointer transition active:scale-95"
            title="Chuyển sang chặng kế tiếp mà không tính điểm"
          >
            ⏭️ Chuyển chặng (0đ)
          </button>
        )}
      </div>

      {/* Giant Sail Center Piece */}
      <div className="relative flex-1 my-2 rounded-2xl overflow-hidden border border-sky-500/50 bg-gradient-to-b from-[#0e3b61] via-[#092b47] to-[#041727] flex flex-col items-center justify-center p-4">
        {/* Sail Visual Container */}
        <div
          className={`relative w-44 sm:w-56 h-48 sm:h-56 transition-all duration-700 ${
            isSuccess ? 'glow-gold scale-105' : ''
          }`}
        >
          <svg className="w-full h-full filter drop-shadow-2xl" viewBox="0 0 200 240" fill="none">
            {/* Giant White Sail */}
            <path
              d="M100,20 C180,80 185,180 100,225 Z"
              fill={isSuccess ? '#f6d55c' : '#ffffff'}
              opacity={isSuccess ? 0.95 : 0.88}
              stroke="#f6d55c"
              strokeWidth="3"
            />
            <path
              d="M100,35 C50,90 40,165 100,215 Z"
              fill={isSuccess ? '#fcd34d' : '#f1f5f9'}
              opacity={isSuccess ? 0.85 : 0.72}
              stroke="#f6d55c"
              strokeWidth="2"
            />
            <line x1="100" y1="10" x2="100" y2="235" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
            <polygon points="100,10 125,18 100,26" fill="#ef4444" />
          </svg>

          {/* Silhouette of Village inside sail */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${
              isSuccess ? 'opacity-90' : 'opacity-0'
            }`}
          >
            <span className="text-3xl sm:text-4xl filter drop-shadow">🏘️⛵🌴</span>
          </div>
        </div>

        {/* Poetic Verse Banner */}
        <div className="mt-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-amber-400/60 text-center">
          <span className="text-amber-300 font-poem text-sm sm:text-base font-bold italic tracking-wide">
            “Cánh buồm giương to như mảnh hồn làng”
          </span>
        </div>
      </div>

      {/* Multi-choice options */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-700">
            <input
              type="checkbox"
              checked={selected.A}
              onChange={() => toggleOption('A')}
              className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-300">A. Chỉ nhằm miêu tả cánh buồm có kích thước rất to lớn.</span>
          </label>

          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-700">
            <input
              type="checkbox"
              checked={selected.B}
              onChange={() => toggleOption('B')}
              className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-100 font-medium">
              B. Cánh buồm gắn bó mật thiết, thân thuộc với cuộc đời người dân chài.
            </span>
          </label>

          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-700">
            <input
              type="checkbox"
              checked={selected.C}
              onChange={() => toggleOption('C')}
              className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-100 font-medium">
              C. Cánh buồm là biểu tượng thiêng liêng cho linh hồn, sức sống và niềm tự hào quê hương.
            </span>
          </label>

          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-700">
            <input
              type="checkbox"
              checked={selected.D}
              onChange={() => toggleOption('D')}
              className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-300">D. Chỉ là hình ảnh ngẫu nhiên được đưa vào trang trí câu thơ.</span>
          </label>
        </div>

        <div className="flex items-center justify-between mt-2">
          {onSkipStage ? (
            <button
              onClick={onSkipStage}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-600 cursor-pointer transition active:scale-95"
              title="Bỏ qua thử thách và chuyển chặng mà không tính điểm"
            >
              ⏭️ Chuyển chặng tiếp (0 điểm)
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleCheck}
            className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition transform active:scale-95"
          >
            Kiểm tra đáp án & Thắp sáng cánh buồm
          </button>
        </div>
      </div>
    </div>
  );
};
