import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface Stage6LongingProps {
  onStageComplete: () => void;
  onSkipStage?: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

interface SensoryItem {
  id: string;
  text: string;
  category: 'mat' | 'dong' | 'mui' | 'tim';
}

const SENSORY_ITEMS: SensoryItem[] = [
  { id: 'm1', text: 'màu nước xanh', category: 'mat' },
  { id: 'm2', text: 'cá bạc', category: 'mat' },
  { id: 'm3', text: 'chiếc buồm vôi', category: 'mat' },
  { id: 'm4', text: 'con thuyền rẽ sóng', category: 'dong' },
  { id: 'm5', text: 'mùi nồng mặn', category: 'mui' },
  { id: 'm6', text: 'luôn tưởng nhớ', category: 'tim' },
];

export const Stage6Longing: React.FC<Stage6LongingProps> = ({
  onStageComplete,
  onSkipStage,
  onAwardPoints,
  onShowToast,
}) => {
  const [selectedItem, setSelectedItem] = useState<SensoryItem | null>(null);
  const [classified, setClassified] = useState<{ [id: string]: string }>({});
  const [showFinalModal, setShowFinalModal] = useState(false);

  const handleSelectItem = (item: SensoryItem) => {
    audioService.playTone(480, 'sine', 0.1);
    setSelectedItem(item);
  };

  const handleDropTo = (bucket: 'mat' | 'dong' | 'mui' | 'tim') => {
    if (!selectedItem) {
      onShowToast('Vui lòng chọn 1 mảnh nhớ bên dưới trước!', '👆');
      return;
    }

    if (selectedItem.category === bucket) {
      audioService.playCorrect();
      const next = { ...classified, [selectedItem.id]: bucket };
      setClassified(next);
      setSelectedItem(null);

      if (Object.keys(next).length === 6) {
        setTimeout(() => {
          setShowFinalModal(true);
        }, 600);
      }
    } else {
      audioService.playError();
      onShowToast('Mảnh nhớ này thuộc một giác quan / cảm xúc khác!', '❌');
    }
  };

  const handleFinalChoice = (isCorrect: boolean) => {
    if (isCorrect) {
      audioService.playCorrect();
      onAwardPoints(10, 'Xuất sắc! Giải mã trọn vẹn hồn thơ Tế Hanh');
      setTimeout(() => {
        onStageComplete();
      }, 700);
    } else {
      audioService.playError();
      onShowToast('Mùi nồng mặn là linh hồn máu thịt của làng chài, không phải ngẫu nhiên!', '⚠️');
    }
  };

  const count = Object.keys(classified).length;
  const remaining = SENSORY_ITEMS.filter((i) => !classified[i.id]);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Challenge Prompt */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30 text-xs sm:text-sm flex items-center justify-between">
        <div>
          <span className="text-amber-400 font-bold">Thử thách:</span>
          <span className="text-slate-200 ml-1">
            Chọn các mảnh nhớ trong khổ thơ cuối rồi xếp vào 4 giác quan / cảm xúc tương ứng:
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-sky-950/80 px-2.5 py-0.5 rounded-full text-cyan-200 border border-cyan-400/30 whitespace-nowrap font-medium">
            Đã gán: <strong className="text-amber-400">{count}</strong>/6 mảnh nhớ
          </span>
          {onSkipStage && (
            <button
              onClick={onSkipStage}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-600 cursor-pointer transition active:scale-95"
              title="Hoàn thành chặng mà không tính điểm"
            >
              ⏭️ Bỏ qua (0đ)
            </button>
          )}
        </div>
      </div>

      {/* 4 Senses Grid Arena with Sunset Hue */}
      <div className="flex-1 my-2 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gradient-to-b from-[#2a1b3d] via-[#1a2142] to-[#0c1b33] p-2.5 rounded-2xl border border-amber-500/30">
        {/* Bucket 1: Mắt */}
        <div
          onClick={() => handleDropTo('mat')}
          className={`rounded-xl border-2 border-dashed p-2 flex flex-col justify-between cursor-pointer transition ${
            selectedItem?.category === 'mat'
              ? 'border-cyan-300 bg-sky-950/40 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              : 'border-cyan-400/40 bg-slate-900/80 hover:border-cyan-300'
          }`}
        >
          <div className="text-center">
            <span className="text-2xl">👁️</span>
            <div className="text-xs font-bold text-cyan-300 mt-0.5">MẮT</div>
            <div className="text-[9px] text-slate-400">Hình ảnh & Màu sắc</div>
          </div>
          <div className="space-y-1 my-1 flex-1">
            {SENSORY_ITEMS.filter((i) => classified[i.id] === 'mat').map((item) => (
              <div
                key={item.id}
                className="p-1 rounded bg-slate-800 border border-emerald-400/60 text-[10px] font-semibold text-emerald-200"
              >
                ✓ "{item.text}"
              </div>
            ))}
          </div>
          <div className="text-[9px] text-center text-cyan-300/70">Nhấp gán vào đây</div>
        </div>

        {/* Bucket 2: Chuyển động */}
        <div
          onClick={() => handleDropTo('dong')}
          className={`rounded-xl border-2 border-dashed p-2 flex flex-col justify-between cursor-pointer transition ${
            selectedItem?.category === 'dong'
              ? 'border-emerald-300 bg-emerald-950/40 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
              : 'border-emerald-400/40 bg-slate-900/80 hover:border-emerald-300'
          }`}
        >
          <div className="text-center">
            <span className="text-2xl">🌊</span>
            <div className="text-xs font-bold text-emerald-300 mt-0.5">CHUYỂN ĐỘNG</div>
            <div className="text-[9px] text-slate-400">Tư thế & Nhịp điệu</div>
          </div>
          <div className="space-y-1 my-1 flex-1">
            {SENSORY_ITEMS.filter((i) => classified[i.id] === 'dong').map((item) => (
              <div
                key={item.id}
                className="p-1 rounded bg-slate-800 border border-emerald-400/60 text-[10px] font-semibold text-emerald-200"
              >
                ✓ "{item.text}"
              </div>
            ))}
          </div>
          <div className="text-[9px] text-center text-emerald-300/70">Nhấp gán vào đây</div>
        </div>

        {/* Bucket 3: Khứu giác */}
        <div
          onClick={() => handleDropTo('mui')}
          className={`rounded-xl border-2 border-dashed p-2 flex flex-col justify-between cursor-pointer transition ${
            selectedItem?.category === 'mui'
              ? 'border-amber-300 bg-amber-950/40 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              : 'border-amber-400/40 bg-slate-900/80 hover:border-amber-300'
          }`}
        >
          <div className="text-center">
            <span className="text-2xl">👃</span>
            <div className="text-xs font-bold text-amber-300 mt-0.5">KHỨU GIÁC</div>
            <div className="text-[9px] text-slate-400">Hương vị đặc trưng</div>
          </div>
          <div className="space-y-1 my-1 flex-1">
            {SENSORY_ITEMS.filter((i) => classified[i.id] === 'mui').map((item) => (
              <div
                key={item.id}
                className="p-1 rounded bg-slate-800 border border-emerald-400/60 text-[10px] font-semibold text-emerald-200"
              >
                ✓ "{item.text}"
              </div>
            ))}
          </div>
          <div className="text-[9px] text-center text-amber-300/70">Nhấp gán vào đây</div>
        </div>

        {/* Bucket 4: Trái tim */}
        <div
          onClick={() => handleDropTo('tim')}
          className={`rounded-xl border-2 border-dashed p-2 flex flex-col justify-between cursor-pointer transition ${
            selectedItem?.category === 'tim'
              ? 'border-rose-300 bg-rose-950/40 shadow-[0_0_12px_rgba(251,113,133,0.4)]'
              : 'border-rose-400/40 bg-slate-900/80 hover:border-rose-300'
          }`}
        >
          <div className="text-center">
            <span className="text-2xl">❤️</span>
            <div className="text-xs font-bold text-rose-300 mt-0.5">TRÁI TIM</div>
            <div className="text-[9px] text-slate-400">Cảm xúc thường trực</div>
          </div>
          <div className="space-y-1 my-1 flex-1">
            {SENSORY_ITEMS.filter((i) => classified[i.id] === 'tim').map((item) => (
              <div
                key={item.id}
                className="p-1 rounded bg-slate-800 border border-emerald-400/60 text-[10px] font-semibold text-emerald-200"
              >
                ✓ "{item.text}"
              </div>
            ))}
          </div>
          <div className="text-[9px] text-center text-rose-300/70">Nhấp gán vào đây</div>
        </div>
      </div>

      {/* Sensory Word Bank */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30">
        <div className="text-[11px] text-slate-400 mb-1">
          {remaining.length > 0
            ? 'Chọn một mảnh nhớ dưới đây rồi gán vào ô phù hợp:'
            : 'Đã hoàn thành toàn bộ 6 mảnh giác quan!'}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {remaining.map((c) => {
            const isPicked = selectedItem?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectItem(c)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  isPicked
                    ? 'ring-2 ring-amber-400 bg-amber-400 text-slate-950 font-black'
                    : 'bg-sky-950/60 hover:bg-slate-800 border-cyan-400/40 text-slate-200'
                }`}
              >
                "{c.text}"
              </button>
            );
          })}
        </div>
      </div>

      {/* Final Question: Why conclude with a 'smell'? */}
      {showFinalModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center z-20">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl text-slate-100">
            <span className="text-xs uppercase font-bold text-amber-300">
              CÂU HỎI TRỌNG TÂM KẾT THÚC BÀI THƠ
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              Tại sao bài thơ lại khép lại bằng một "mùi" -{' '}
              <span className="text-amber-300 font-poem italic">
                “Tôi thấy nhớ cái mùi nồng mặn quá!”
              </span>
              ?
            </h3>

            <div className="grid grid-cols-1 gap-2 my-3 text-xs">
              <button
                onClick={() => handleFinalChoice(true)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-slate-100 cursor-pointer transition hover:border-amber-400"
              >
                A. Vì nỗi nhớ quê hương đã chuyển hóa thành cảm giác cụ thể, thấm sâu vào da thịt, khứu giác và ký ức ruột thịt của nhà thơ.
              </button>
              <button
                onClick={() => handleFinalChoice(false)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 cursor-pointer transition hover:border-rose-400"
              >
                B. Đơn giản vì tác giả không còn từ ngữ nào khác để diễn tả màu sắc của biển khơi.
              </button>
            </div>

            {onSkipStage && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={onSkipStage}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-600 cursor-pointer transition active:scale-95"
                >
                  ⏭️ Hoàn thành hải trình (0 điểm)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
