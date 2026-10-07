import React from 'react';
import { audioService } from '../../services/audioService';

interface TeacherDeepExplainModalProps {
  questionPrompt: string;
  activeTeamName: string;
  onConfirmAward: () => void;
  onClose: () => void;
}

export const TeacherDeepExplainModal: React.FC<TeacherDeepExplainModalProps> = ({
  questionPrompt,
  activeTeamName,
  onConfirmAward,
  onClose,
}) => {
  const handleSpeakQuestion = () => {
    audioService.speak(questionPrompt);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center space-x-2">
            <span>✨</span>
            <span>GÓC GIẢI THÍCH SÂU - CỘNG 5 ĐIỂM THƯỞNG</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-3 text-xs sm:text-sm space-y-3">
          <div className="p-3 bg-sky-950/60 rounded-xl border border-sky-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-300 font-bold">Gợi ý câu hỏi đào sâu từ giáo viên:</span>
              <button
                onClick={handleSpeakQuestion}
                className="px-2 py-0.5 rounded bg-sky-800/60 hover:bg-sky-700 text-cyan-200 text-[11px] flex items-center space-x-1 cursor-pointer"
                title="Đọc câu hỏi bằng giọng nam Miền Bắc"
              >
                <span>🔊</span>
                <span>Đọc câu hỏi</span>
              </button>
            </div>
            <p className="text-slate-100 italic font-poem leading-relaxed mt-1">
              “{questionPrompt}”
            </p>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Cộng thưởng cho đội đang kích hoạt:
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-700">
              <span className="font-bold text-amber-300 text-sm">{activeTeamName}</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                +5 điểm thưởng
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
          >
            Bỏ qua
          </button>
          <button
            onClick={onConfirmAward}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition transform active:scale-95"
          >
            Xác nhận phát biểu tốt (+5đ)
          </button>
        </div>
      </div>
    </div>
  );
};
