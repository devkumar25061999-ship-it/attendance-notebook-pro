import React from 'react';
import { BarChart3, BookOpen, Settings, ChevronDown, Share2 } from 'lucide-react';

interface HeaderProps {
  year: number;
  onOpenYearModal: () => void;
  onOpenGuideModal: () => void;
  onOpenReportModal: () => void;
  onOpenNotebookModal: () => void;
  onOpenReferModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenManageDataModal: () => void;
  notesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  onOpenYearModal,
  onOpenReportModal,
  onOpenNotebookModal,
  onOpenReferModal,
  onOpenSettingsModal,
  notesCount,
}) => {
  return (
    <header className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white px-2.5 sm:px-3 py-1.5 shadow-md border-b border-indigo-900/60 sticky top-0 z-30">
      <div className="w-full max-w-md mx-auto flex items-center justify-between gap-1.5">
        {/* Left: Year Picker & App Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            id="btn-year-selector"
            onClick={onOpenYearModal}
            className="flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-2 py-1 rounded-lg border border-amber-300 text-xs tracking-wide shadow-2xs transition-all active:scale-95 shrink-0"
            title="Change Year"
          >
            <span>{year}</span>
            <ChevronDown className="w-3 h-3 stroke-[3] text-slate-950 shrink-0" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-black text-xs sm:text-sm tracking-tight text-white truncate">
                Attendance Pro
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] text-amber-300 font-bold leading-none mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">Duty • Salary • Diary</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Slip, Notebook, Refer, Settings) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* 1. Reports / Salary Slip */}
          <button
            id="btn-open-report"
            onClick={onOpenReportModal}
            className="w-7.5 h-7.5 xs:w-8 xs:h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs font-bold transition-all active:scale-95 shrink-0 shadow-2xs"
            title="Salary Slip & Monthly Reports"
          >
            <BarChart3 className="w-4 h-4 text-emerald-300 shrink-0" />
          </button>

          {/* 2. Notebook / Diary */}
          <button
            id="btn-open-notebook-header"
            onClick={onOpenNotebookModal}
            className="w-7.5 h-7.5 xs:w-8 xs:h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all active:scale-95 relative shrink-0 shadow-2xs"
            title="Notebook & Daily Diary"
          >
            <BookOpen className="w-4 h-4 text-cyan-300" />
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-[8.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-950 shadow-2xs">
                {notesCount > 9 ? '9+' : notesCount}
              </span>
            )}
          </button>

          {/* 3. Refer / Share */}
          <button
            id="btn-header-refer"
            onClick={onOpenReferModal}
            className="w-7.5 h-7.5 xs:w-8 xs:h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-2xs"
            title="Refer to Friend & Share App"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
          </button>

          {/* 4. Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettingsModal}
            className="w-7.5 h-7.5 xs:w-8 xs:h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-2xs"
            title="Duty & Salary Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
