import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateUtils';

interface MonthNavigationProps {
  currentMonthIndex: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectCurrentMonth: () => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonthIndex,
  year,
  onPrevMonth,
  onNextMonth,
  onSelectCurrentMonth,
}) => {
  const monthName = MONTH_NAMES[currentMonthIndex];

  return (
    <div className="w-full my-0.5 px-1 sm:px-2 flex justify-center shrink-0">
      <div className="w-full max-w-md bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-xl py-1 px-2.5 flex items-center justify-between shadow-md border border-indigo-800/60">
        <button
          id="btn-prev-month"
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center transition-all active:scale-95 shadow-xs shrink-0"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
        </button>

        <button
          id="btn-current-month-title"
          onClick={onSelectCurrentMonth}
          className="flex flex-col items-center justify-center px-3 py-0.5 rounded-lg hover:bg-white/5 active:scale-98 transition-all"
          title="Click to jump to current month"
        >
          <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide font-sans leading-none">
            {monthName}
          </span>
          <span className="text-[10px] text-amber-300/90 font-black tracking-wide flex items-center gap-1 mt-0.5 leading-none">
            <span className="text-indigo-200">Year</span>
            <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-extrabold">{year}</span>
          </span>
        </button>

        <button
          id="btn-next-month"
          onClick={onNextMonth}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center transition-all active:scale-95 shadow-xs shrink-0"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

