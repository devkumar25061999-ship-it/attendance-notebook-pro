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
  onViewSalaryDetails,
}) => {
  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      <div className="grid grid-cols-2 gap-1.5">
        {/* Work Days Card */}
        <button
          id="stat-card-work"
          onClick={onViewSalaryDetails}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-left overflow-hidden group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-2xs shrink-0">
            💼
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-xs font-black text-slate-900 truncate leading-tight">
              Work: <span className="text-blue-600 font-black">{workDays}d</span>
            </div>
            <div className="text-[9.5px] text-slate-500 font-bold truncate leading-tight mt-0.5">
              {halfDays > 0 ? `+${halfDays} Half Day` : 'View Salary Slip'}
            </div>
          </div>
        </button>

        {/* Overtime Hours Card */}
        <button
          id="stat-card-overtime"
          onClick={onViewSalaryDetails}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-left overflow-hidden group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-2xs shrink-0">
            ⏱️
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-xs font-black text-slate-900 truncate leading-tight">
              OT: <span className="text-emerald-600 font-black">{overtimeHours}h</span>
            </div>
            <div className="text-[9.5px] text-slate-500 font-black truncate leading-tight mt-0.5">
              ₹{totalEarnings.toLocaleString('en-IN')} Total
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
