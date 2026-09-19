import React, { useState } from 'react';
import { Trash2, RotateCcw, X, Check, AlertCircle } from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateUtils';

interface ManageDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthIndex: number;
  year: number;
  onClearCurrentMonth: () => void;
  onClearAllRecords: () => void;
  onClearAllNotes: () => void;
  onRestoreDemo: () => void;
}

export const ManageDataModal: React.FC<ManageDataModalProps> = ({
  isOpen,
  onClose,
  monthIndex,
  year,
  onClearCurrentMonth,
  onClearAllRecords,
  onClearAllNotes,
  onRestoreDemo,
}) => {
  const [confirmType, setConfirmType] = useState<'month' | 'records' | 'notes' | null>(null);

  if (!isOpen) return null;

  const currentMonthName = MONTH_NAMES[monthIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-[#1F2937] text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg font-black text-white">
              Manage & Clear Data
            </h2>
          </div>
          <button
            onClick={() => {
              setConfirmType(null);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-white text-[#1F2937]">
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            All your records are stored securely on your device. You can clear or reset records anytime:
          </p>

          <div className="space-y-3 pt-1">
            {/* Clear current month */}
            {confirmType === 'month' ? (
              <div className="p-3 bg-red-50 border border-[#DC2626] rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-black">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>Clear {currentMonthName} {year} attendance?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-confirm-clear-month"
                    onClick={() => {
                      onClearCurrentMonth();
                      setConfirmType(null);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Yes, Clear Month</span>
                  </button>
                  <button
                    onClick={() => setConfirmType(null)}
                    className="py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 text-[#1F2937] font-bold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-clear-current-month"
                onClick={() => setConfirmType('month')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F3F4F6] hover:bg-gray-200 border border-gray-300 text-[#1F2937] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 text-[#DC2626]" />
                <span>Clear {currentMonthName} {year} Only</span>
              </button>
            )}

            {/* Clear all attendance records */}
            {confirmType === 'records' ? (
              <div className="p-3 bg-red-50 border border-[#DC2626] rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-black">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>Delete ALL calendar attendance records?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-confirm-clear-all-records"
                    onClick={() => {
                      onClearAllRecords();
                      setConfirmType(null);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Yes, Clear All Attendance</span>
                  </button>
                  <button
                    onClick={() => setConfirmType(null)}
                    className="py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 text-[#1F2937] font-bold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-clear-all-records"
                onClick={() => setConfirmType('records')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F3F4F6] hover:bg-gray-200 border border-gray-300 text-[#1F2937] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 text-[#DC2626]" />
                <span>Clear All Calendar Attendance</span>
              </button>
            )}

            {/* Clear all notes */}
            {confirmType === 'notes' ? (
              <div className="p-3 bg-red-50 border border-[#DC2626] rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-black">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>Delete ALL notebook notes & diary?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-confirm-clear-all-notes"
                    onClick={() => {
                      onClearAllNotes();
                      setConfirmType(null);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Yes, Delete All Notes</span>
                  </button>
                  <button
                    onClick={() => setConfirmType(null)}
                    className="py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 text-[#1F2937] font-bold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-clear-all-notes"
                onClick={() => setConfirmType('notes')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F3F4F6] hover:bg-gray-200 border border-gray-300 text-[#1F2937] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 text-[#DC2626]" />
                <span>Clear All Notebook Notes</span>
              </button>
            )}

            {/* Restore sample preview */}
            <button
              id="btn-restore-sample-data"
              onClick={() => {
                onRestoreDemo();
                setConfirmType(null);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-[#1F2937] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-[#16A34A]" />
              <span>Load Sample Preview Data (September 2026)</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setConfirmType(null);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#1F2937] font-black text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
