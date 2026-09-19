import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES, MONTH_NAMES_HI } from '../utils/dateUtils';
import { Language } from '../utils/translations';

interface MonthNavigationProps {
  currentMonthIndex: number;
  year: number;
  lang?: Language;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectCurrentMonth: () => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonthIndex,
  year,
  lang = 'en',
  onPrevMonth,
  onNextMonth,
  onSelectCurrentMonth,
}) => {
  const monthName = lang === 'hi' ? MONTH_NAMES_HI[currentMonthIndex] : MONTH_NAMES[currentMonthIndex];

  return (
    <div className="w-full my-0.5 px-1 sm:px-2 flex justify-center shrink-0">
      <div className="w-full max-w-md bg-white rounded-xl py-1.5 px-2.5 flex items-center justify-between shadow-xs border border-gray-200">
        <button
          id="btn-prev-month"
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-lg bg-[#1F2937] hover:bg-gray-700 text-white flex items-center justify-center transition-all active:scale-95 shadow-2xs shrink-0"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
        </button>

        <button
          id="btn-current-month-title"
          onClick={onSelectCurrentMonth}
          className="flex flex-col items-center justify-center px-3 py-0.5 rounded-lg hover:bg-gray-50 active:scale-98 transition-all"
          title={lang === 'hi' ? 'चालू महीने पर जाएं' : 'Click to jump to current month'}
        >
          <span className="text-base sm:text-lg font-black text-[#1F2937] tracking-wide font-sans leading-none">
            {monthName}
          </span>
          <span className="text-[10px] text-gray-600 font-black tracking-wide flex items-center gap-1 mt-0.5 leading-none">
            <span>{lang === 'hi' ? 'वर्ष' : 'Year'}</span>
            <span className="bg-[#F3F4F6] text-[#1F2937] border border-gray-300 px-1.5 py-0.2 rounded font-extrabold">{year}</span>
          </span>
        </button>

        <button
          id="btn-next-month"
          onClick={onNextMonth}
          className="w-8 h-8 rounded-lg bg-[#1F2937] hover:bg-gray-700 text-white flex items-center justify-center transition-all active:scale-95 shadow-2xs shrink-0"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

