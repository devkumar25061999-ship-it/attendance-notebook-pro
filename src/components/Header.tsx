import React from 'react';
import { BarChart3, BookOpen, Settings, ChevronDown, Share2, Users, Languages } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HeaderProps {
  year: number;
  lang: Language;
  onToggleLang: () => void;
  onOpenYearModal: () => void;
  onOpenGuideModal: () => void;
  onOpenReportModal: () => void;
  onOpenNotebookModal: () => void;
  onOpenReferModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenManageDataModal: () => void;
  onOpenFactoryHRModal: () => void;
  notesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  lang,
  onToggleLang,
  onOpenYearModal,
  onOpenReportModal,
  onOpenNotebookModal,
  onOpenReferModal,
  onOpenSettingsModal,
  onOpenFactoryHRModal,
  notesCount,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-[#1F2937] text-white px-2.5 sm:px-4 pt-[max(env(safe-area-inset-top),14px)] pb-2.5 shadow-sm border-b border-gray-700 sticky top-0 z-30">
      <div className="w-full max-w-md mx-auto flex items-center justify-between gap-1.5">
        {/* Left: Year Picker & App Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            id="btn-year-selector"
            onClick={onOpenYearModal}
            className="flex items-center gap-0.5 bg-white hover:bg-gray-100 text-[#1F2937] font-black px-2 py-1 rounded-lg border border-gray-300 text-xs tracking-wide shadow-2xs transition-all active:scale-95 shrink-0"
            title={t.changeYear}
          >
            <span>{year}</span>
            <ChevronDown className="w-3 h-3 stroke-[3] text-[#1F2937] shrink-0" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-black text-xs sm:text-sm tracking-tight text-white truncate">
                {t.appName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] text-gray-300 font-bold leading-none mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse shrink-0"></span>
              <span className="truncate">{t.appSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons + Language Switcher */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Switcher Pill */}
          <button
            id="btn-header-lang-toggle"
            onClick={onToggleLang}
            className="h-7.5 px-2 rounded-lg bg-white hover:bg-gray-100 text-[#1F2937] font-black border border-gray-300 flex items-center gap-1 text-[11px] shadow-xs active:scale-95 transition-all shrink-0"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 shrink-0 text-[#1F2937]" />
            <span className="leading-none">{lang === 'hi' ? 'ENG' : 'हिंदी'}</span>
          </button>

          {/* 2. Notebook / Diary */}
          <button
            id="btn-open-notebook-header"
            onClick={onOpenNotebookModal}
            className="w-7.5 h-7.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all active:scale-95 relative shrink-0 shadow-2xs"
            title="Notebook & Daily Diary"
          >
            <BookOpen className="w-4 h-4 text-white" />
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#16A34A] text-white text-[8.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#1F2937] shadow-2xs">
                {notesCount > 9 ? '9+' : notesCount}
              </span>
            )}
          </button>

          {/* 4. Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettingsModal}
            className="w-7.5 h-7.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-2xs"
            title="Duty & Salary Settings"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
