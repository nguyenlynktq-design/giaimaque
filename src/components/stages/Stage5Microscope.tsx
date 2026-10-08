import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

interface Stage5MicroscopeProps {
  onStageComplete: () => void;
  onSkipStage?: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

interface TermItem {
  id: string;
  text: string;
  target: 'people' | 'boat';
  explanation: string;
}

const TERMS: TermItem[] = [
  {
    id: 't1',
    text: 'ngăm rám nắng',
    target: 'people',
    explanation: 'Khỏe khoắn, dạn dày sương gió, mang dấu ấn đặc trưng của biển cả.',
  },
  {
    id: 't2',
    text: 'nồng thở vị xa xăm',
    target: 'people',
    explanation: 'Hơi thở mặn mòi của đại dương bao la đã thấm sâu vào da thịt con người.',
  },
  {
    id: 't3',
    text: 'im bến mỏi',
    target: 'boat',
    explanation: 'Biện pháp nhân hóa: con thuyền như một sinh thể biết nghỉ ngơi sau hành trình lao động vất vả.',
  },
  {
    id: 't4',
    text: 'chất muối thấm dần',
    target: 'boat',
    explanation: 'Biển cả thấm sâu vào từng thớ gỗ của con thuyền, kết tinh linh hồn của làng chài.',
  },
];

export const Stage5Microscope: React.FC<Stage5MicroscopeProps> = ({
  onStageComplete,
  onSkipStage,
  onAwardPoints,
  onShowToast,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermItem | null>(null);
  const [classified, setClassified] = useState<{ [id: string]: 'people' | 'boat' }>({});
  const [showMeaningModal, setShowMeaningModal] = useState(false);

  const handleSelectTerm = (term: TermItem) => {
    audioService.playTone(450, 'sine', 0.1);
    setSelectedTerm(term);
  };

  const handleDropTo = (zone: 'people' | 'boat') => {
    if (!selectedTerm) {
      onShowToast('Vui lòng chọn 1 cụm từ ở hàng dưới trước!', '👆');
      return;
    }

    if (selectedTerm.target === zone) {
      audioService.playCorrect();
      const next = { ...classified, [selectedTerm.id]: zone };
      setClassified(next);
      setSelectedTerm(null);

      if (Object.keys(next).length === 4) {
        setTimeout(() => {
          setShowMeaningModal(true);
        }, 550);
      }
    } else {
      audioService.playError();
      onShowToast(
        `Cụm từ này không dùng để miêu tả ${zone === 'people' ? 'người dân chài' : 'con thuyền'}!`,
        '❌'
      );
    }
  };

  const handleFinalChoice = (isCorrect: boolean) => {
    if (isCorrect) {
      audioService.playCorrect();
      onAwardPoints(10, 'Chính xác! Thấu suốt sự gắn bó máu thịt giữa người và biển');
      setTimeout(() => {
        onStageComplete();
      }, 700);
    } else {
      audioService.playError();
      onShowToast("Hãy chú ý đến hình ảnh 'thấm dần trong thớ vỏ' và 'nồng thở vị xa xăm'!", '⚠️');
    }
  };

  const remainingTerms = TERMS.filter((t) => !classified[t.id]);
  const peopleItems = TERMS.filter((t) => classified[t.id] === 'people');
  const boatItems = TERMS.filter((t) => classified[t.id] === 'boat');
  const count = Object.keys(classified).length;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Challenge Prompt */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30 text-xs sm:text-sm flex items-center justify-between">
        <div>
          <span className="text-amber-400 font-bold">Thử thách:</span>
          <span className="text-slate-200 ml-1">
            Nhấp chọn một cụm từ bên dưới, sau đó nhấp vào đối tượng tương ứng để phân loại:
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-sky-950/80 px-2.5 py-0.5 rounded-full text-cyan-200 border border-cyan-400/30 whitespace-nowrap font-medium">
            Đã khớp: <strong className="text-amber-400">{count}</strong>/4 cụm từ
          </span>
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
      </div>

      {/* 2 Classification Zones */}
      <div className="flex-1 my-2 grid grid-cols-2 gap-3">
        {/* Column 1: Người dân chài */}
        <div
          onClick={() => handleDropTo('people')}
          className={`rounded-2xl border-2 border-dashed p-3 flex flex-col items-center justify-between cursor-pointer transition ${
            selectedTerm?.target === 'people'
              ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_15px_rgba(246,213,92,0.3)]'
              : 'border-amber-400/50 bg-slate-900/80 hover:border-amber-400'
          }`}
        >
          <div className="text-center">
            <span className="text-3xl">👨‍🌾🌊</span>
            <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 mt-1 uppercase">
              NGƯỜI DÂN CHÀI
            </h3>
            <p className="text-[10px] text-slate-400">Hình ảnh con người mang vị biển</p>
          </div>

          <div className="w-full space-y-1.5 my-2 flex-1">
            {peopleItems.map((item) => (
              <div
                key={item.id}
                className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs font-semibold text-emerald-200 flex items-center space-x-1"
              >
                <span>✓</span>
                <span>"{item.text}"</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-amber-300/80 italic">Nhấp vào đây để đặt từ</div>
        </div>

        {/* Column 2: Con thuyền */}
        <div
          onClick={() => handleDropTo('boat')}
          className={`rounded-2xl border-2 border-dashed p-3 flex flex-col items-center justify-between cursor-pointer transition ${
            selectedTerm?.target === 'boat'
              ? 'border-cyan-400 bg-sky-950/30 shadow-[0_0_15px_rgba(50,140,193,0.3)]'
              : 'border-cyan-400/50 bg-slate-900/80 hover:border-cyan-400'
          }`}
        >
          <div className="text-center">
            <span className="text-3xl">⛵🪵</span>
            <h3 className="text-xs sm:text-sm font-extrabold text-cyan-300 mt-1 uppercase">
              CON THUYỀN
            </h3>
            <p className="text-[10px] text-slate-400">Hình ảnh con thuyền nghỉ ngơi</p>
          </div>

          <div className="w-full space-y-1.5 my-2 flex-1">
            {boatItems.map((item) => (
              <div
                key={item.id}
                className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs font-semibold text-emerald-200 flex items-center space-x-1"
              >
                <span>✓</span>
                <span>"{item.text}"</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-cyan-300/80 italic">Nhấp vào đây để đặt từ</div>
        </div>
      </div>

      {/* Vocabulary Bank */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-sky-500/30">
        <div className="text-[11px] text-slate-400 mb-1">
          {remainingTerms.length > 0
            ? 'Nhấp chọn một cụm từ bên dưới trước:'
            : 'Đã phân loại thành công toàn bộ cụm từ!'}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {remainingTerms.map((t) => {
            const isPicked = selectedTerm?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTerm(t)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  isPicked
                    ? 'ring-2 ring-amber-400 bg-amber-400 text-slate-950 font-black'
                    : 'bg-sky-950/60 hover:bg-slate-800 border-cyan-400/40 text-slate-200'
                }`}
              >
                "{t.text}"
              </button>
            );
          })}
        </div>
      </div>

      {/* Meaning Popup once all 4 terms classified */}
      {showMeaningModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center z-20">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl text-slate-100">
            <div className="text-xs uppercase font-bold text-amber-300">
              BẢNG GIẢI MÃ NGHỆ THUẬT NGÔN TỪ
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-800 border-l-4 border-amber-400">
                <strong>"ngăm rám nắng"</strong> → Khỏe khoắn, dạn dày sương gió nơi đầu sóng ngọn gió.
              </div>
              <div className="p-2 rounded bg-slate-800 border-l-4 border-amber-400">
                <strong>"nồng thở vị xa xăm"</strong> → Hơi thở đại dương bao la thấm sâu vào từng thớ thịt con người.
              </div>
              <div className="p-2 rounded bg-slate-800 border-l-4 border-cyan-400">
                <strong>"im bến mỏi"</strong> → Nhân hóa con thuyền như một sinh thể mệt mỏi nghỉ ngơi sau hành trình lao động.
              </div>
              <div className="p-2 rounded bg-slate-800 border-l-4 border-cyan-400">
                <strong>"chất muối thấm dần"</strong> → Vị mặn mòi của biển cả kết tinh thành linh hồn của con người và làng chài.
              </div>
            </div>

            {/* Deep Reflection Question */}
            <div className="p-3 bg-sky-950/70 rounded-xl border border-cyan-400/40 text-xs">
              <p className="font-bold text-amber-300 mb-2">
                Câu hỏi suy ngẫm: Biển chỉ ở bên ngoài hay đã trở thành một phần máu thịt của người dân chài?
              </p>
              <div className="space-x-2 flex">
                <button
                  onClick={() => handleFinalChoice(true)}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white cursor-pointer transition"
                >
                  Biển đã thấm sâu vào máu thịt, tâm hồn con người
                </button>
                <button
                  onClick={() => handleFinalChoice(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer transition"
                >
                  Biển chỉ là cảnh vật địa lý bên ngoài
                </button>
              </div>

              {onSkipStage && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={onSkipStage}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-600 cursor-pointer transition active:scale-95"
                  >
                    ⏭️ Chuyển chặng tiếp (0 điểm)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
