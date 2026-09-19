import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle, Calendar, Camera, FileSpreadsheet, Clock, BookOpen, Users } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'factory_hr' | 'notebook' | 'face_punch' | 'hr_excel' | 'overtime'>('attendance');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-[#1F2937] rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-700 bg-[#1F2937] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center font-black shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                How to Use Attendance Notebook Pro
              </h2>
              <p className="text-xs text-gray-300">
                User Guide & Helpful Tips
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-[#F3F4F6] overflow-x-auto scrollbar-none px-2 py-1.5 gap-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'attendance'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('factory_hr')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'factory_hr'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Factory HR</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'notebook'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notebook</span>
          </button>

          <button
            onClick={() => setActiveTab('face_punch')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'face_punch'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-gray-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Face Punch</span>
          </button>

          <button
            onClick={() => setActiveTab('hr_excel')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'hr_excel'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>HR Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('overtime')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'overtime'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:bg-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Overtime</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {activeTab === 'attendance' && (
            <>
              {/* Point 1 */}
              <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>1. Marking Duty & Attendance</span>
                </div>

                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2937] font-bold">Select Tool:</strong>{' '}
                      Choose your duty status from the toolbar: <strong>Work, Half Duty, Overtime, Holiday, Sick</strong>, etc.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2937] font-bold">Tap on Any Date:</strong>{' '}
                      Tap on any calendar day to quickly mark that attendance status with 1-tap.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2937] font-bold">Day Details Button:</strong>{' '}
                      Click "Day Details" to record custom In/Out times, exact overtime hours, or write remarks.
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 2 */}
              <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                  <Clock className="w-4 h-4" />
                  <span>2. Switching Months & Years</span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  Use the <strong>Left/Right arrows (&lt; &gt;)</strong> to switch between months, and click the <strong>Year Badge (e.g., 2026 ▼)</strong> to jump to any year.
                </p>
              </div>
            </>
          )}

          {activeTab === 'factory_hr' && (
            <div className="space-y-4">
              {/* Point 1 */}
              <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                  <Users className="w-4 h-4" />
                  <span>Factory HR Mode (फैक्ट्री HR मोड)</span>
                </div>

                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2937] font-bold">Switch Mode:</strong> Tap on the <strong>"Factory HR Mode"</strong> button at the top header to switch from Self-Attendance to Worker management.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2937] font-bold">Manage Workers:</strong> Add new workers, edit their details (Name, Daily Wages, Mobile Number), and view their individual attendance sheets.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2937] font-bold">Payroll & Salary Slip:</strong> View monthly gross earnings, calculate and track cash advances, and generate ready-to-share PDF/Image Salary Slips for any worker!
                    </div>
                  </div>
                </div>
              </div>

              {/* Point 2 */}
              <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Automatic Calculations</span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  Simply mark worker attendance, and the app will automatically calculate:
                  <br />
                  • Total working days (Full days & half days)
                  <br />
                  • Accurate overtime (OT) amount based on hourly OT rates
                  <br />
                  • Final salary after deducting cash advances (पेशगी / Advance)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notebook' && (
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Integrated Notebook & Work Diary Features</span>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1F2937] font-bold">Daily Notes:</strong> Record daily work progress, tasks, and important logs.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1F2937] font-bold">Khata & Cash Advance:</strong> Track cash advances and payment logs with automatic total calculation.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1F2937] font-bold">Date Linkage:</strong> Notes can be linked directly to specific calendar dates for audit and history tracking.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'face_punch' && (
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                <Camera className="w-4 h-4" />
                <span>Face Punch Verification</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Click the <strong>Face Punch</strong> button in the top action bar. Take a camera selfie on arrival or departure. The app saves the photo, date, and exact timestamp securely in offline memory.
              </p>
            </div>
          )}

          {activeTab === 'hr_excel' && (
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                <span>HR Excel & Salary Slip</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Click the <strong>Report (📊)</strong> icon to see your full monthly summary, salary calculations, and export as CSV/Excel to share with your contractor or HR manager.
              </p>
            </div>
          )}

          {activeTab === 'overtime' && (
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#16A34A] font-black text-sm">
                <Clock className="w-4 h-4" />
                <span>Overtime & Salary Calculation</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Select the Overtime tool or open Day Details to record extra duty hours. Overtime earnings are automatically calculated based on the hourly rate configured in Settings.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Got It button */}
        <div className="p-4 bg-[#F3F4F6] border-t border-gray-200 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 font-medium">
            Attendance Notebook Pro • v1.0.0
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#16A34A] hover:bg-green-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
