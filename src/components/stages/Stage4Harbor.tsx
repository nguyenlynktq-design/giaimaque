import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface Stage4HarborProps {
  onStageComplete: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const HARBOR_WORDS = [
  { text: 'ồn ào', isCorrect: true },
  { text: 'tấp nập', isCorrect: true },
  { text: 'lặng lẽ', isCorrect: false },
  { text: 'cá đầy ghe', isCorrect: true },
  { text: 'buồn bã', isCorrect: false },
  { text: 'vắng vẻ', isCorrect: false },
];

export const Stage4Harbor: React.FC<Stage4HarborProps> = ({
  onStageComplete,
  onAwardPoints,
  onShowToast,
}) => {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [showExtended, setShowExtended] = useState(false);
  const [extAnswer, setExtAnswer] = useState<'A' | 'B' | null>(null);

  const handleWordClick = (word: string, isCorrect: boolean) => {
    if (selectedWords.has(word)) return;

    if (isCorrect) {
      const next = new Set(selectedWords);
      next.add(word);
      setSelectedWords(next);

      audioService.playTone(520 + next.size * 90, 'triangle', 0.2);

      if (next.size === 3) {
        audioService.playCorrect();
        setTimeout(() => {
          setShowExtended(true);
        }, 650);
      }
    } else {
      audioService.playError();
      onShowToast(`"${word}" không phản ánh đúng không khí náo nức ngày thuyền về!`, '❌');
    }
  };

  const handleExtendedChoice = (choice: 'A' | 'B') => {
    setExtAnswer(choice);
    if (choice === 'A') {
      audioService.playCorrect();
      onAwardPoints(10, 'Chính xác! Thấu hiểu sâu sắc giá trị của lao động và cộng đồng');
      setTimeout(() => {
        onStageComplete();
      }, 700);
    } else {
      audioService.playError();
      onShowToast('Chưa đúng! Không khí ồn ào ở đây là niềm vui hân hoan của mùa màng bội thu!', '⚠️');
    }
  };

  const isFullWords = selectedWords.size === 3;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Challenge Prompt */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30 text-xs sm:text-sm flex items-center justify-between">
        <div>
          <span className="text-amber-400 font-bold">Thử thách 1:</span>
          <span className="text-slate-200 ml-1">
            Chọn những từ ngữ miêu tả đúng bức tranh bến cá trong ngày trở về:
          </span>
        </div>
        <span className="text-xs bg-sky-950/80 px-2.5 py-0.5 rounded-full text-cyan-200 border border-cyan-400/30 whitespace-nowrap ml-2 font-medium">
          Đúng: <strong className="text-amber-400">{selectedWords.size}</strong>/3 từ
        </span>
      </div>

      {/* Animated Harbor Scene */}
      <div className="relative flex-1 my-2 rounded-2xl overflow-hidden border border-sky-500/50 bg-gradient-to-b from-[#184e77] via-[#103a5c] to-[#0b2842] flex flex-col justify-center items-center p-4">
        {/* Harbor visual atmosphere */}
        <div className="relative w-full max-w-md h-32 flex items-center justify-around">
          <div className="text-3xl sm:text-4xl filter drop-shadow">⛵</div>
          <div className="text-4xl sm:text-5xl filter drop-shadow transition-transform duration-500">
            {isFullWords ? '🐟🦐🦀✨' : '🐟'}
          </div>
          <div className="text-3xl sm:text-4xl filter drop-shadow">🚣</div>
          <div
            className={`text-3xl sm:text-4xl filter drop-shadow transition duration-500 ${
              isFullWords ? 'scale-115 opacity-100' : 'opacity-60'
            }`}
          >
            👨‍👩‍👧‍👦
          </div>
        </div>

        {/* Port Atmosphere Banner */}
        <div className="mt-2 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-slate-700 text-center text-xs text-slate-200">
          {isFullWords
            ? '🎉 Bến cá rộn rã reo vui, ghe đầy ắp cá tôm tươi ngon!'
            : 'Cảnh bến đỗ: "Dân chài lưới làn da ngăm rám nắng / Cả dân làng tấp nập đón ghe về"'}
        </div>

        {/* Extended Question Modal Inside Stage */}
        {showExtended && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center z-20">
            <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400/80 p-4 rounded-2xl shadow-2xl">
              <span className="text-xs uppercase text-cyan-400 font-bold">
                Thử thách 2 • Cảm nhận chiều sâu
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Không khí bến cá ngày trở về cho em cảm nhận gì về cuộc sống làng chài?
              </h3>

              <div className="grid grid-cols-1 gap-2 mt-3 text-xs text-left">
                <button
                  onClick={() => handleExtendedChoice('A')}
                  className={`p-2.5 rounded-xl border text-slate-200 transition cursor-pointer ${
                    extAnswer === 'A'
                      ? 'bg-emerald-600 border-emerald-400 font-bold text-white'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  A. Cuộc sống vui tươi, nhộn nhịp, tinh thần gắn bó cộng đồng và niềm tự hào về thành quả lao động đáng quý
                </button>
                <button
                  onClick={() => handleExtendedChoice('B')}
                  className={`p-2.5 rounded-xl border text-slate-200 transition cursor-pointer ${
                    extAnswer === 'B'
                      ? 'bg-rose-800 border-rose-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  B. Sự ồn ào hỗn loạn gây mệt mỏi cho người dân sau chuyến đi biển dài ngày
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word chips tray */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex flex-wrap gap-2 text-xs">
          {HARBOR_WORDS.map((w) => {
            const isSelected = selectedWords.has(w.text);
            return (
              <button
                key={w.text}
                onClick={() => handleWordClick(w.text, w.isCorrect)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-sky-950/60 hover:bg-amber-400 hover:text-slate-950 border-cyan-400/40 text-cyan-200'
                }`}
              >
                "{w.text}"
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
