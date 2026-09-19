import React from 'react';
import { BookOpen, Printer } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface ActionButtonsRowProps {
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenNotebook: () => void;
  onOpenReport?: () => void;
  lang?: Language;
}

export const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  onOpenNotebook,
  onOpenSettings,
  onOpenReport,
  lang = 'en',
}) => {
  const t = translations[lang];

  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      <div className="grid grid-cols-2 gap-1.5">
        {/* 1. Work Diary & Notes */}
        <button
          id="btn-action-notebook"
          onClick={onOpenNotebook}
          className="bg-white hover:bg-gray-50 border border-gray-300 text-[#1F2937] font-black p-1.5 rounded-xl min-h-[40px] xs:min-h-[42px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all overflow-hidden"
          title="Notebook (Daily Notes, Advances, Site Diary)"
        >
          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-[#1F2937]" />
          </div>
          <div className="flex flex-col text-left leading-tight min-w-0">
            <span className="text-xs font-black tracking-tight truncate">
              {lang === 'hi' ? 'काम डायरी' : 'Work Diary'}
            </span>
            <span className="text-[9px] text-gray-500 font-semibold truncate">
              {lang === 'hi' ? 'नोट्स / खाता' : 'Notes / Khata'}
            </span>
          </div>
        </button>

        {/* 2. Salary Slip & Print */}
        <button
          id="btn-action-salary-slip"
          onClick={onOpenReport || onOpenSettings}
          className="bg-[#16A34A] hover:bg-green-700 border border-green-600 text-white font-black p-1.5 rounded-xl min-h-[40px] xs:min-h-[42px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all overflow-hidden"
          title="Open Monthly Salary Slip & Print"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Printer className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col text-left leading-tight min-w-0">
            <span className="text-xs font-black tracking-tight truncate">
              {t.salarySlip}
            </span>
            <span className="text-[9px] text-green-100 font-extrabold truncate">
              {lang === 'hi' ? 'प्रिंट / PDF' : 'Slip & Print'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
