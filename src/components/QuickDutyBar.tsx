import React, { useState } from 'react';
import { Check, Clock, Moon, Sparkles, AlertCircle, Trash2, ChevronRight, Zap } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import { Language } from '../utils/translations';
import { calculateSalaryBreakdown } from '../utils/dateUtils';

interface QuickDutyBarProps {
  selectedDate: string; // YYYY-MM-DD
  currentRecord?: AttendanceRecord;
  settings: AppSettings;
  lang?: Language;
  onMarkDuty: (status: AttendanceStatus, otHours?: number, shiftNote?: string) => void;
  onClearDuty: () => void;
  onFillWorkingDays: () => void;
  onOpenDetails: () => void;
}

export const QuickDutyBar: React.FC<QuickDutyBarProps> = ({
  selectedDate,
  currentRecord,
  settings,
  lang = 'hi',
  onMarkDuty,
  onClearDuty,
  onFillWorkingDays,
  onOpenDetails,
}) => {
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const breakdown = calculateSalaryBreakdown(settings, 1, 0, 0);
  const perDayWage = breakdown.perDayWage;

  // Format date for readable title
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const dayNameEn = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = dateObj.getDate();
  const monthNameEn = dateObj.toLocaleDateString('en-US', { month: 'short' });

  const dayNamesHi: Record<string, string> = {
    Sun: 'रवि',
    Mon: 'सोम',
    Tue: 'मंगल',
    Wed: 'बुध',
    Thu: 'गुरु',
    Fri: 'शुक्र',
    Sat: 'शनि',
  };

  const monthNamesHi: Record<string, string> = {
    Jan: 'जनवरी',
    Feb: 'फरवरी',
    Mar: 'मार्च',
    Apr: 'अप्रैल',
    May: 'मई',
    Jun: 'जून',
    Jul: 'जुलाई',
    Aug: 'अगस्त',
    Sep: 'सितम्बर',
    Oct: 'अक्टूबर',
    Nov: 'नवम्बर',
    Dec: 'दिसम्बर',
  };

  const dayLabel = lang === 'hi' ? (dayNamesHi[dayNameEn] || dayNameEn) : dayNameEn;
  const monthLabel = lang === 'hi' ? (monthNamesHi[monthNameEn] || monthNameEn) : monthNameEn;
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleMark = (status: AttendanceStatus, otHours = 0, shiftNote = '') => {
    onMarkDuty(status, otHours, shiftNote);
    let msg = '';
    if (status === 'work') {
      msg = lang === 'hi' ? `✅ ${dayNum} ${monthLabel}: पूरी ड्यूटी दर्ज (₹${perDayWage})` : `✅ ${dayNum} ${monthLabel}: Full Duty Marked (₹${perDayWage})`;
    } else if (status === 'half_duty') {
      msg = lang === 'hi' ? `🟡 ${dayNum} ${monthLabel}: हाफ ड्यूटी दर्ज (₹${Math.round(perDayWage / 2)})` : `🟡 ${dayNum} ${monthLabel}: Half Duty Marked (₹${Math.round(perDayWage / 2)})`;
    } else if (status === 'overtime') {
      const otPay = otHours * settings.hourlyOt;
      msg = lang === 'hi' ? `🟣 ${dayNum} ${monthLabel}: ड्यूटी + ${otHours}h OT दर्ज (₹${perDayWage + otPay})` : `🟣 ${dayNum} ${monthLabel}: Duty + ${otHours}h OT (₹${perDayWage + otPay})`;
    } else if (status === 'absent') {
      msg = lang === 'hi' ? `🔴 ${dayNum} ${monthLabel}: अनुपस्थित (गैरहाजिर) दर्ज` : `🔴 ${dayNum} ${monthLabel}: Marked Absent`;
    }
    showToast(msg);
  };

  // Status descriptor for selected date
  const getStatusBadge = () => {
    if (!currentRecord) {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
          {lang === 'hi' ? 'हाजिरी नहीं लगी' : 'Unmarked'}
        </span>
      );
    }
    switch (currentRecord.status) {
      case 'work':
        return (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
            {lang === 'hi' ? `🟢 पूरी ड्यूटी • ₹${currentRecord.wageCalculated || perDayWage}` : `🟢 Full Duty • ₹${currentRecord.wageCalculated || perDayWage}`}
          </span>
        );
      case 'half_duty':
        return (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
            {lang === 'hi' ? `🟡 हाफ ड्यूटी • ₹${currentRecord.wageCalculated || Math.round(perDayWage / 2)}` : `🟡 Half Duty • ₹${currentRecord.wageCalculated || Math.round(perDayWage / 2)}`}
          </span>
        );
      case 'overtime':
        return (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300">
            {lang === 'hi' ? `🟣 +${currentRecord.overtimeHours || 2}h OT • ₹${currentRecord.wageCalculated || perDayWage}` : `🟣 +${currentRecord.overtimeHours || 2}h OT • ₹${currentRecord.wageCalculated || perDayWage}`}
          </span>
        );
      case 'absent':
        return (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
            {lang === 'hi' ? '🔴 गैरहाजिर (A)' : '🔴 Absent (A)'}
          </span>
        );
      case 'holiday':
        return (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300">
            {lang === 'hi' ? '🔵 छुट्टी (H)' : '🔵 Holiday (H)'}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-300">
            {currentRecord.status}
          </span>
        );
    }
  };

  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-1.5 xs:p-2 space-y-1.5 relative overflow-hidden">
        {/* Toast confirmation banner */}
        {feedbackToast && (
          <div className="absolute inset-x-2 top-1.5 z-20 bg-[#1F2937] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg text-center flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Selected Date Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#1F2937]">
              📅 {dayNum} {monthLabel} ({dayLabel})
            </span>
            {isToday && (
              <span className="bg-[#16A34A] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {lang === 'hi' ? 'आज' : 'Today'}
              </span>
            )}
            {getStatusBadge()}
          </div>

          <button
            type="button"
            onClick={onOpenDetails}
            className="text-[10px] font-bold text-[#1F2937] hover:text-black flex items-center gap-0.5 active:scale-95"
          >
            <span>{lang === 'hi' ? 'विस्तार से' : 'Details'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 1-Tap Quick Action Buttons Row */}
        <div className="grid grid-cols-5 gap-1">
          {/* 1. Full Work (P) */}
          <button
            type="button"
            onClick={() => handleMark('work')}
            className={`py-1.5 px-0.5 rounded-lg border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
              currentRecord?.status === 'work' && (currentRecord.overtimeHours || 0) === 0
                ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs font-black'
                : 'bg-green-50 hover:bg-green-100 text-[#16A34A] border-green-200 font-bold'
            }`}
          >
            <span className="text-xs font-black leading-none">P</span>
            <span className="text-[9px] leading-tight mt-0.5">{lang === 'hi' ? 'पूरी ड्यूटी' : 'Full Day'}</span>
          </button>

          {/* 2. Half Duty (HD) */}
          <button
            type="button"
            onClick={() => handleMark('half_duty')}
            className={`py-1.5 px-0.5 rounded-lg border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
              currentRecord?.status === 'half_duty'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-black'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-bold'
            }`}
          >
            <span className="text-xs font-black leading-none">HD</span>
            <span className="text-[9px] leading-tight mt-0.5">{lang === 'hi' ? 'हाफ डे' : 'Half Day'}</span>
          </button>

          {/* 3. Overtime (+2h OT) */}
          <button
            type="button"
            onClick={() => handleMark('overtime', 2)}
            className={`py-1.5 px-0.5 rounded-lg border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
              currentRecord?.status === 'overtime' || (currentRecord?.overtimeHours || 0) > 0
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-black'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200 font-bold'
            }`}
          >
            <span className="text-xs font-black leading-none">+2h</span>
            <span className="text-[9px] leading-tight mt-0.5">{lang === 'hi' ? 'ओवरटाइम' : 'Overtime'}</span>
          </button>

          {/* 4. Night Shift */}
          <button
            type="button"
            onClick={() => handleMark('work', 0, 'Night Shift')}
            className="py-1.5 px-0.5 rounded-lg border text-center transition-all active:scale-95 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-[#1F2937] border-gray-200 font-bold"
          >
            <Moon className="w-3 h-3 text-[#1F2937]" />
            <span className="text-[9px] leading-tight mt-0.5">{lang === 'hi' ? 'नाइट शिफ्ट' : 'Night'}</span>
          </button>

          {/* 5. Absent or Clear */}
          {currentRecord ? (
            <button
              type="button"
              onClick={() => {
                onClearDuty();
                showToast(lang === 'hi' ? `🗑️ ${dayNum} ${monthLabel} की हाजिरी हटाई गई` : `🗑️ Cleared record for ${dayNum} ${monthLabel}`);
              }}
              className="py-1.5 px-0.5 rounded-lg border text-center transition-all active:scale-95 flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-[#DC2626] border-gray-300 font-bold"
              title="Clear / Delete Attendance"
            >
              <Trash2 className="w-3 h-3 text-[#DC2626]" />
              <span className="text-[9px] leading-tight mt-0.5">{lang === 'hi' ? 'मिटाएं' : 'Clear'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleMark('absent')}
              className="py-1.5 px-0.5 rounded-lg border text-center transition-all active:scale-95 flex flex-col items-center justify-center bg-red-50 hover:bg-red-100 text-[#DC2626] border-red-200 font-bold"
            >
              <span className="text-xs font-black leading-none">A</span>
              <span className="text-[9px] leading-tight mt-0.5">{lang === 'hi' ? 'गैरहाजिर' : 'Absent'}</span>
            </button>
          )}
        </div>

        {/* Quick batch fill bar */}
        <div className="flex items-center justify-between pt-0.5 border-t border-gray-100 text-[10px]">
          <div className="text-gray-500 font-medium">
            {lang === 'hi' ? `1 दिन = ₹${perDayWage} | 1 घंटा OT = ₹${settings.hourlyOt}` : `1 Day = ₹${perDayWage} | 1 hr OT = ₹${settings.hourlyOt}`}
          </div>
          <button
            type="button"
            onClick={onFillWorkingDays}
            className="flex items-center gap-1 font-black text-[#16A34A] hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-md border border-green-200 active:scale-95 transition-all"
            title="Auto mark Mon-Sat as Present for this entire month"
          >
            <Zap className="w-3 h-3 text-[#16A34A]" />
            <span>{lang === 'hi' ? '⚡ पूरे महीने की हाजिरी (Mon-Sat)' : '⚡ Fill Working Days'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
