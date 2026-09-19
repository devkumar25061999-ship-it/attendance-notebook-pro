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
      <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-[#1F2937] text-white">
          <h2 className="text-xl font-black text-white">Select Year</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Year List */}
        <div className="overflow-y-auto divide-y divide-gray-200 px-2 py-1 flex-1 bg-white">
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
                    ? 'bg-green-50 text-[#1F2937] font-black'
                    : 'hover:bg-gray-50 text-[#1F2937] font-bold'
                }`}
              >
                <span className="text-lg tracking-wide">{year}</span>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'border-[#16A34A] bg-[#16A34A] text-white'
                      : 'border-gray-300 bg-transparent'
                  }`}
                >
                  {isCurrent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-[#F3F4F6] flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
