import React from 'react';

interface StatsCardsProps {
  workDays: number;
  overtimeHours: number;
  halfDays: number;
  totalEarnings: number;
  dailyWage: number;
  onViewSalaryDetails: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  workDays,
  overtimeHours,
  halfDays,
  totalEarnings,
  dailyWage,
  onViewSalaryDetails,
}) => {
  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      <div className="grid grid-cols-2 gap-1.5">
        {/* Work Days Card */}
        <button
          id="stat-card-work"
          onClick={onViewSalaryDetails}
          className="bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 hover:from-blue-200/80 hover:to-indigo-200/80 border border-blue-400/90 rounded-xl p-1.5 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-left overflow-hidden group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-sm font-black shadow-2xs shrink-0">
            💼
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-xs font-black text-blue-950 truncate leading-tight">
              Work: <span className="text-blue-700 font-black">{workDays}d</span>
            </div>
            <div className="text-[9.5px] text-blue-800 font-bold truncate leading-tight mt-0.5">
              {halfDays > 0 ? `+${halfDays} Half Day` : 'View Salary Slip'}
            </div>
          </div>
        </button>

        {/* Overtime Hours Card */}
        <button
          id="stat-card-overtime"
          onClick={onViewSalaryDetails}
          className="bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 hover:from-emerald-200/80 hover:to-teal-200/80 border border-emerald-400/90 rounded-xl p-1.5 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-left overflow-hidden group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-sm font-black shadow-2xs shrink-0">
            ⏱️
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-xs font-black text-emerald-950 truncate leading-tight">
              OT: <span className="text-emerald-700 font-black">{overtimeHours}h</span>
            </div>
            <div className="text-[9.5px] text-emerald-800 font-black truncate leading-tight mt-0.5">
              ₹{totalEarnings.toLocaleString('en-IN')} Total
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
