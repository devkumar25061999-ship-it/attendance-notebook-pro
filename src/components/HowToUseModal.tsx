import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle, Calendar, Camera, FileSpreadsheet, Clock, BookOpen } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'face_punch' | 'hr_excel' | 'overtime' | 'notebook'>('attendance');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#181f2f] text-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border-2 border-amber-500/40 overflow-hidden">
        {/* Header matching Screenshot 4 */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-700/60 bg-[#1e2638]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300">
                How to Use Attendance Notebook Pro
              </h2>
              <p className="text-xs text-slate-300">
                User Guide & Helpful Tips
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700/80 bg-[#151c2b] overflow-x-auto scrollbar-none px-2 py-1.5 gap-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'attendance'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'notebook'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notebook</span>
          </button>

          <button
            onClick={() => setActiveTab('face_punch')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'face_punch'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Face Punch</span>
          </button>

          <button
            onClick={() => setActiveTab('hr_excel')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'hr_excel'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>HR Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('overtime')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'overtime'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Overtime</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'attendance' && (
            <>
              {/* Point 1 */}
              <div className="bg-[#20293d] border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>1. Marking Duty & Attendance</span>
                </div>

                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold">Select Tool:</strong>{' '}
                      Choose your duty status from the toolbar: <strong>Work, Half Duty, Overtime, Holiday, Sick</strong>, etc.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold">Tap on Any Date:</strong>{' '}
                      Tap on any calendar day to quickly mark that attendance status with 1-tap.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold">Day Details Button:</strong>{' '}
                      Click "Day Details" to record custom In/Out times, exact overtime hours, or write remarks.
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 2 */}
              <div className="bg-[#20293d] border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Clock className="w-4 h-4" />
                  <span>2. Switching Months & Years</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  Use the <strong>Left/Right arrows (&lt; &gt;)</strong> to switch between months, and click the <strong>Year Badge (e.g., 2026 ▼)</strong> to jump to any year.
                </p>
              </div>
            </>
          )}

          {activeTab === 'notebook' && (
            <div className="bg-[#20293d] border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Integrated Notebook & Work Diary Features</span>
              </div>

              <div className="space-y-2 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Daily Notes:</strong> Record daily work progress, tasks, and important logs.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Khata & Cash Advance:</strong> Track cash advances and payment logs with automatic total calculation.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Date Linkage:</strong> Notes can be linked directly to specific calendar dates for audit and history tracking.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'face_punch' && (
            <div className="bg-[#20293d] border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
                <Camera className="w-4 h-4" />
                <span>Face Punch Verification</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Click the <strong>Face Punch</strong> button in the top action bar. Take a camera selfie on arrival or departure. The app saves the photo, date, and exact timestamp securely in offline memory.
              </p>
            </div>
          )}

          {activeTab === 'hr_excel' && (
            <div className="bg-[#20293d] border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                <span>HR Excel & Salary Slip</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Click the <strong>Report (📊)</strong> icon to see your full monthly summary, salary calculations, and export as CSV/Excel to share with your contractor or HR manager.
              </p>
            </div>
          )}

          {activeTab === 'overtime' && (
            <div className="bg-[#20293d] border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <Clock className="w-4 h-4" />
                <span>Overtime & Salary Calculation</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Select the Overtime tool or open Day Details to record extra duty hours. Overtime earnings are automatically calculated based on the hourly rate configured in Settings.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Got It button */}
        <div className="p-4 bg-[#141b29] border-t border-slate-700/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Attendance Notebook Pro • v1.0.0
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
