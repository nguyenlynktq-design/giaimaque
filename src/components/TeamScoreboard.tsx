import React from 'react';
import { Team } from '../types';

interface TeamScoreboardProps {
  teams: Team[];
  activeTeamId: number;
  onSelectTeam: (teamId: number) => void;
  onModifyScore: (teamId: number, points: number) => void;
  onOpenDeepExplain: () => void;
}

export const TeamScoreboard: React.FC<TeamScoreboardProps> = ({
  teams,
  activeTeamId,
  onSelectTeam,
  onModifyScore,
  onOpenDeepExplain,
}) => {
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  return (
    <aside className="w-1/5 min-w-[210px] max-w-[260px] bg-slate-900/85 backdrop-blur-md rounded-2xl border border-sky-500/30 flex flex-col p-2.5 shadow-xl">
      {/* Header */}
      <div className="text-center pb-2 border-b border-sky-500/30">
        <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
          BẢNG ĐIỂM THI ĐUA
        </div>
        <h2 className="text-sm sm:text-base font-extrabold text-amber-400 flex items-center justify-center gap-1">
          <span>⚓</span> BẢNG ĐIỂM HẢI TRÌNH
        </h2>
        <p className="text-[10px] text-slate-300 mt-0.5">Giáo viên chọn đội trước khi trả lời</p>
      </div>

      {/* Active Team Indicator */}
      <div className="mt-2 bg-slate-950/70 py-1 px-2 rounded-lg border border-amber-400/40 text-center">
        <span className="text-[10px] text-slate-300">Đang chọn lượt:</span>
        <span className="text-xs font-bold text-amber-300 ml-1">
          {activeTeam.name}
        </span>
      </div>

      {/* 4 Teams List */}
      <div className="flex-1 flex flex-col justify-around py-1.5 space-y-1.5">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;
          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className={`cursor-pointer rounded-xl p-2 border transition relative bg-gradient-to-r ${
                team.color
              } ${
                isActive
                  ? 'active-team-ring border-amber-400 shadow-[0_0_15px_rgba(246,213,92,0.6)]'
                  : 'hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{team.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{team.name}</div>
                    <div className="text-[10px] text-slate-400">{team.slogan}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-300 transition-transform inline-block">
                    {team.score}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-0.5">đ</span>
                </div>
              </div>

              {/* Quick Point Buttons */}
              <div
                className="flex justify-end gap-1 mt-1 pt-1 border-t border-slate-700/60"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onModifyScore(team.id, 10)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                  title="Cộng 10 điểm trả lời đúng"
                >
                  +10
                </button>
                <button
                  onClick={() => onModifyScore(team.id, 5)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-bold cursor-pointer"
                  title="Cộng 5 điểm thưởng"
                >
                  +5 Thưởng
                </button>
                <button
                  onClick={() => onModifyScore(team.id, -5)}
                  className="text-[9px] px-1 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                  title="Trừ 5 điểm điều chỉnh"
                >
                  -5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Deep Question Tool */}
      <div className="pt-2 border-t border-sky-500/30 flex flex-col gap-1.5">
        <button
          onClick={onOpenDeepExplain}
          className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-lg text-xs shadow flex items-center justify-center space-x-1.5 cursor-pointer transition transform active:scale-95"
        >
          <span>✨</span>
          <span>GIẢI THÍCH SÂU (+5Đ)</span>
        </button>
        <div className="text-[9px] text-slate-400 text-center italic">
          Quy tắc: Đúng +10đ • Có dẫn chứng +5đ • Sai không trừ
        </div>
      </div>
    </aside>
  );
};
