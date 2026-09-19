import React from 'react';
import { Language, translations } from '../utils/translations';

interface StatsCardsProps {
  workDays: number;
  overtimeHours: number;
  halfDays: number;
  totalEarnings: number;
  dailyWage: number;
  lang?: Language;
  onViewSalaryDetails: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  workDays,
  overtimeHours,
  halfDays,
  totalEarnings,
  lang = 'en',
  onViewSalaryDetails,
}) => {
  const t = translations[lang];

  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      <div className="grid grid-cols-2 gap-1.5">
        {/* Work Days Card */}
        <button
          id="stat-card-work"
          onClick={onViewSalaryDetails}
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-1.5 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-left overflow-hidden group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-sm font-black shadow-2xs shrink-0">
            💼
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-xs font-black text-[#1F2937] truncate leading-tight">
              {t.workDays}: <span className="text-[#16A34A] font-black">{workDays}{lang === 'hi' ? ' दिन' : 'd'}</span>
            </div>
            <div className="text-[9.5px] text-gray-500 font-bold truncate leading-tight mt-0.5">
              {halfDays > 0 ? `+${halfDays} ${lang === 'hi' ? 'हाफ डे' : 'Half Day'}` : t.viewSalaryDetails}
            </div>
          </div>
        </button>

        {/* Overtime Hours Card */}
        <button
          id="stat-card-overtime"
          onClick={onViewSalaryDetails}
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-1.5 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-left overflow-hidden group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-sm font-black shadow-2xs shrink-0">
            ⏱️
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-xs font-black text-[#1F2937] truncate leading-tight">
              {t.overtimeHours}: <span className="text-[#16A34A] font-black">{overtimeHours}{lang === 'hi' ? ' घंटे' : 'h'}</span>
            </div>
            <div className="text-[9.5px] text-gray-500 font-black truncate leading-tight mt-0.5">
              ₹{totalEarnings.toLocaleString('en-IN')} {lang === 'hi' ? 'नेट वेतन' : 'Total'}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
