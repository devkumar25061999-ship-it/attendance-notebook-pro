import React from 'react';
import { X, Check } from 'lucide-react';

interface YearSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export const YearSelectorModal: React.FC<YearSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedYear,
  onSelectYear,
}) => {
  if (!isOpen) return null;

  // Generate years from 2020 to 2060
  const years: number[] = [];
  for (let y = 2020; y <= 2060; y++) {
    years.push(y);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
          <h2 className="text-xl font-black text-slate-900">Select Year</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Year List */}
        <div className="overflow-y-auto divide-y divide-amber-100/70 px-2 py-1 flex-1">
          {years.map((year) => {
            const isCurrent = year === selectedYear;
            return (
              <button
                key={year}
                onClick={() => {
                  onSelectYear(year);
                  onClose();
                }}
                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors rounded-xl ${
                  isCurrent
                    ? 'bg-amber-100/60 text-slate-950 font-black'
                    : 'hover:bg-amber-50/70 text-slate-800 font-bold'
                }`}
              >
                <span className="text-lg tracking-wide">{year}</span>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-400 bg-transparent'
                  }`}
                >
                  {isCurrent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-amber-100 bg-amber-50/50 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
