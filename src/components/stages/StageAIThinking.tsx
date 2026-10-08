import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface StageAIThinkingProps {
  onStageComplete: () => void;
  onSkipStage?: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const StageAIThinking: React.FC<StageAIThinkingProps> = ({
  onStageComplete,
  onSkipStage,
  onAwardPoints,
  onShowToast,
}) => {
  const [stance, setStance] = useState<'agree' | 'partial' | 'disagree' | null>(null);
  const [counterArg, setCounterArg] = useState<number | null>(null);
  const [showTakeaway, setShowTakeaway] = useState(false);

  const handleSelectStance = (val: 'agree' | 'partial' | 'disagree') => {
    setStance(val);
    if (val === 'agree') {
      audioService.playError();
      onShowToast('Chưa đúng! Thơ ca chứa đựng hồn cốt tinh thần vượt ra ngoài kích thước vật lý!', '⚠️');
    } else {
      audioService.playCorrect();
    }
  };

  const handleSelectCounter = (isCorrect: boolean, idx: number) => {
    setCounterArg(idx);
    if (isCorrect) {
      audioService.playCorrect();
      setShowTakeaway(true);
      onAwardPoints(10, 'Xuất sắc! Phản biện sắc bén với tư duy độc lập');
    } else {
      audioService.playError();
      onShowToast('Dẫn chứng chưa đủ sức thuyết phục để bác bỏ nhận định thô thiển của AI', '❌');
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header Badge */}
      <div className="bg-indigo-950/80 p-2.5 rounded-xl border border-indigo-500/40 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🤖</span>
          <span className="text-indigo-200 font-bold">
            Thử thách Năng lực số: Phản biện nhận định của Trí tuệ nhân tạo (AI)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] px-2.5 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-400/40 font-semibold hidden sm:inline">
            Tư duy phản biện
          </span>
          {onSkipStage && (
            <button
              onClick={onSkipStage}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-slate-600 cursor-pointer transition active:scale-95"
              title="Chuyển sang chặng kế tiếp mà không tính điểm"
            >
              ⏭️ Chuyển chặng (0đ)
            </button>
          )}
        </div>
      </div>

      {/* Simulated Chatbot Workspace */}
      <div className="flex-1 my-2 bg-slate-950/80 rounded-2xl border border-indigo-500/30 p-3 sm:p-4 overflow-y-auto space-y-3">
        {/* AI Message Bubble */}
        <div className="flex items-start space-x-2.5 max-w-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow">
            🤖
          </div>
          <div className="bg-indigo-950/70 border border-indigo-400/40 rounded-2xl rounded-tl-none p-3 text-xs sm:text-sm text-slate-200 shadow">
            <div className="text-[10px] text-indigo-300 font-bold mb-1">
              TRỢ LÝ AI VĂN HỌC (Phiên bản Thử nghiệm):
            </div>
            <p className="leading-relaxed">
              "Theo dữ liệu phân tích của tôi, câu thơ{' '}
              <span className="text-amber-300 font-poem font-bold">
                'Cánh buồm giương to như mảnh hồn làng'
              </span>{' '}
              đơn thuần chỉ là phép so sánh hình thể nhằm miêu tả cánh buồm có kích thước rất lớn, che chắn gió biển."
            </p>
          </div>
        </div>

        {/* Step 1: Student Stance */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700">
          <span className="text-xs font-bold text-amber-300 block mb-2">
            Bước 1: Em có đồng ý với lời giải này của AI không?
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleSelectStance('disagree')}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                stance === 'disagree'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              ❌ Không đồng ý
            </button>
            <button
              onClick={() => handleSelectStance('partial')}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                stance === 'partial'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              ⚖️ Đồng ý một phần
            </button>
            <button
              onClick={() => handleSelectStance('agree')}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                stance === 'agree'
                  ? 'bg-rose-700 text-white font-bold border-rose-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              ✔️ Hoàn toàn đồng ý
            </button>
          </div>
        </div>

        {/* Step 2: Critical Argument Selection */}
        {(stance === 'disagree' || stance === 'partial') && (
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700">
            <span className="text-xs font-bold text-cyan-300 block mb-2">
              Bước 2: Chọn luận cứ xác đáng nhất để phản biện lại nhận định của AI:
            </span>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => handleSelectCounter(true, 1)}
                className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer ${
                  counterArg === 1
                    ? 'bg-emerald-600/80 border-emerald-400 text-white font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                💡 Cánh buồm là vật vô tri nhưng được so sánh với "mảnh hồn làng" - cái trừu tượng, thiêng liêng; biến cánh buồm thành biểu tượng sức sống và tâm hồn của cả cộng đồng làng chài.
              </button>
              <button
                onClick={() => handleSelectCounter(false, 2)}
                className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer ${
                  counterArg === 2
                    ? 'bg-rose-800 border-rose-500 text-white'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                ⚠️ Vì cánh buồm màu trắng vôi nên trông rất sáng trên biển.
              </button>
            </div>
          </div>
        )}

        {/* Educational Takeaway Banner */}
        {showTakeaway && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border-2 border-emerald-400 text-xs sm:text-sm text-slate-100">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
              <span>🌟</span>
              <span>BÀI HỌC VỀ NĂNG LỰC SỐ VÀ TRÍ TUỆ NHÂN TẠO:</span>
            </div>
            <p className="font-semibold text-yellow-200 italic font-poem text-sm sm:text-base">
              “AI có thể gợi ý. Con người phải đọc – kiểm chứng – suy nghĩ – chịu trách nhiệm.”
            </p>
            <div className="mt-3 text-right">
              <button
                onClick={onStageComplete}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer transition transform active:scale-95"
              >
                Tiếp tục hải trình đến Chặng 4 ⛵
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 Rèn luyện tư duy độc lập: Luôn đối chiếu câu trả lời của AI với nguyên bản văn học và trải nghiệm cảm xúc con người.</span>
        {onSkipStage && (
          <button
            onClick={onSkipStage}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-600 cursor-pointer ml-2"
          >
            ⏭️ Bỏ qua (0đ)
          </button>
        )}
      </div>
    </div>
  );
};
