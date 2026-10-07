import React, { useEffect, useRef } from 'react';
import { Team } from '../../types';
import { audioService } from '../../services/audioService';

interface GrandFinaleModalProps {
  teams: Team[];
  onResetGame: () => void;
  onReviewSail: () => void;
}

export const GrandFinaleModal: React.FC<GrandFinaleModalProps> = ({
  teams,
  onResetGame,
  onReviewSail,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sort teams from highest score to lowest
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  useEffect(() => {
    audioService.playFanfare();

    const victoryNarration =
      'Chúc mừng các đội đã xuất sắc hoàn thành hải trình và thắp sáng trọn vẹn Hồn Làng qua tác phẩm Quê Hương của nhà thơ Tế Hanh!';
    audioService.speak(victoryNarration);

    // Confetti Animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const colors = ['#f6d55c', '#ed553b', '#328cc1', '#ffffff', '#10b981', '#a855f7'];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      velY: Math.random() * 2.5 + 1.5,
      velX: Math.random() * 2 - 1,
      angle: Math.random() * 360,
    }));

    let animId: number;
    let frames = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.velY;
        p.x += p.velX;
        p.angle += 3;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      frames++;
      if (frames < 450) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-fadeIn overflow-y-auto">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      <div className="relative z-10 max-w-2xl w-full bg-slate-900/95 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl my-auto">
        {/* Badge */}
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-amber-300/40 pulse-subtle">
          🏆
        </div>

        <div className="mt-3 text-xs uppercase tracking-widest font-extrabold text-cyan-400">
          CHÚC MỪNG HOÀN THÀNH HẢI TRÌNH
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 uppercase">
          NHÀ GIẢI MÃ HỒN LÀNG
        </h2>

        {/* Poetic Message */}
        <div className="my-4 p-4 rounded-2xl bg-sky-950/70 border border-cyan-400/40 font-poem text-slate-100 text-xs sm:text-sm leading-relaxed">
          <p className="italic text-yellow-100">
            “Quê hương không chỉ là nơi ta sinh ra. Quê hương là những hình ảnh, âm thanh, con người và cả những mùi vị theo ta suốt cuộc đời.”
          </p>
          <div className="text-right text-xs text-amber-400 mt-2 font-sans font-bold">
            — Hồn làng Tế Hanh trong tâm tưởng người Việt —
          </div>
        </div>

        {/* Final Rankings */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700/80 mb-4">
          <div className="text-xs text-slate-400 mb-2 font-semibold">
            BẢNG XẾP HẠNG HẢI TRÌNH CHUNG CUỘC:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {sortedTeams.map((team, idx) => (
              <div
                key={team.id}
                className={`p-2.5 rounded-xl border transition ${
                  idx === 0
                    ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-bold shadow-[0_0_12px_rgba(246,213,92,0.4)]'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-[10px] text-slate-400">
                  {idx === 0 ? '👑 QUÁN QUÂN' : `Hạng ${idx + 1}`}
                </div>
                <div className="truncate font-bold mt-0.5">{team.name}</div>
                <div className="text-sm font-extrabold text-amber-300 mt-0.5">
                  {team.score} điểm
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onResetGame}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-600 transition cursor-pointer"
          >
            🔄 Chơi lại từ đầu
          </button>
          <button
            onClick={onReviewSail}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg transition cursor-pointer"
          >
            ⛵ Xem lại cánh buồm & câu trả lời
          </button>
        </div>
      </div>
    </div>
  );
};
