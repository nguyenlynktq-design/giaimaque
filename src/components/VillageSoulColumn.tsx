import React from 'react';
import { Fragment } from '../types';

interface VillageSoulColumnProps {
  fragments: Fragment[];
  unlockedList: boolean[]; // array of 6 booleans
  allCompleted: boolean;
  onSelectFragment: (fragment: Fragment) => void;
}

export const VillageSoulColumn: React.FC<VillageSoulColumnProps> = ({
  fragments,
  unlockedList,
  allCompleted,
  onSelectFragment,
}) => {
  const completedCount = unlockedList.filter(Boolean).length;
  const sailFillOpacity = Math.min(0.9, 0.15 + completedCount * 0.13);

  return (
    <aside className="w-1/5 min-w-[200px] max-w-[250px] bg-slate-900/85 backdrop-blur-md rounded-2xl border border-sky-500/30 flex flex-col p-2.5 shadow-xl">
      {/* Header */}
      <div className="text-center pb-2 border-b border-sky-500/30">
        <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
          KHO TÀNG TÂM TƯỞNG
        </div>
        <h2 className="text-sm sm:text-base font-extrabold text-amber-400 flex items-center justify-center gap-1">
          <span>✨</span> HỒN LÀNG
        </h2>
        <p className="text-[10px] text-slate-300 mt-0.5">
          Thu thập 6 mảnh ghép ({completedCount}/6)
        </p>
      </div>

      {/* Stylized Glowing Sail & 6 Fragments Slots */}
      <div className="flex-1 flex flex-col items-center justify-center my-1 relative">
        {/* Decorative Sail Graphic */}
        <div className="relative w-full max-w-[170px] h-[190px] flex items-center justify-center">
          <svg
            className={`w-full h-full transition-all duration-1000 filter drop-shadow-md ${
              allCompleted ? 'scale-105 glow-gold' : ''
            }`}
            viewBox="0 0 160 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Mast & Base */}
            <path d="M80,10 L80,200" stroke="#f6d55c" strokeWidth="4" strokeLinecap="round" />
            <path
              d="M25,200 L135,200 L120,215 L40,215 Z"
              fill="#0b3c5d"
              stroke="#f6d55c"
              strokeWidth="2"
            />

            {/* Sail Outline & Progressive Fill */}
            <path
              d="M80,20 C140,70 145,150 80,190 Z"
              fill={allCompleted ? '#f6d55c' : '#ffffff'}
              fillOpacity={sailFillOpacity}
              stroke="#f6d55c"
              strokeWidth="2.5"
            />
            <path
              d="M80,35 C40,80 35,140 80,180 Z"
              fill={allCompleted ? '#fcd34d' : '#e2e8f0'}
              fillOpacity={sailFillOpacity * 0.85}
              stroke="#f6d55c"
              strokeWidth="2"
            />

            {/* Flag on top */}
            <polygon points="80,10 102,17 80,24" fill="#ed553b" />
          </svg>

          {/* Aura on Completion */}
          {allCompleted && (
            <div className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-r from-amber-400/25 via-yellow-300/35 to-amber-500/25 blur-xl animate-pulse" />
          )}
        </div>

        {/* 6 Slots List */}
        <div className="w-full space-y-1 mt-1 text-[11px]">
          {fragments.map((frag, idx) => {
            const isUnlocked = unlockedList[idx];
            return (
              <div
                key={frag.id}
                onClick={() => isUnlocked && onSelectFragment(frag)}
                className={`flex items-center justify-between p-1.5 rounded-lg border transition duration-500 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-amber-950/90 to-slate-900 border-amber-400/60 text-amber-300 font-bold cursor-pointer hover:border-amber-300'
                    : 'bg-slate-950/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      isUnlocked
                        ? 'bg-amber-400 shadow-[0_0_8px_#f6d55c]'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span>
                    {frag.id}. {frag.name}
                  </span>
                </div>
                <span className="text-[10px]">
                  {isUnlocked ? '✨ MỞ' : '🔒'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Message Banner */}
      <div className="pt-2 border-t border-sky-500/30 text-center">
        <div className="text-[9px] uppercase tracking-wider text-slate-300">
          Thông điệp hội tụ:
        </div>
        <div
          className={`text-xs font-bold mt-0.5 tracking-wider ${
            allCompleted
              ? 'text-yellow-200 animate-pulse text-sm'
              : 'text-amber-300'
          }`}
        >
          {allCompleted ? '⭐ TÌNH YÊU QUÊ HƯƠNG ⭐' : '[ TÌNH YÊU QUÊ HƯƠNG ]'}
        </div>
      </div>
    </aside>
  );
};
