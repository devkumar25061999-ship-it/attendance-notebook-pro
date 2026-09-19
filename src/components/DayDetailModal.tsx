import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Clock, DollarSign, BookOpen, Camera, Calendar } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AppSettings, NoteItem } from '../types';
import { TOOLS_CONFIG } from '../data/defaultData';
import { formatDateDisplay, getMonthlyGross, calculateSalaryBreakdown } from '../utils/dateUtils';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateString: string;
  record?: AttendanceRecord;
  settings: AppSettings;
  notesForDate: NoteItem[];
  onSaveRecord: (dateString: string, record: Partial<AttendanceRecord>) => void;
  onDeleteRecord: (dateString: string) => void;
  onAddNoteFromDay: (dateString: string, title: string, text: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateString,
  record,
  settings,
  notesForDate,
  onSaveRecord,
  onDeleteRecord,
  onAddNoteFromDay,
}) => {
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'work');
  const [inTime, setInTime] = useState<string>(record?.inTime || settings.shiftStart);
  const [outTime, setOutTime] = useState<string>(record?.outTime || settings.shiftEnd);
  const [overtimeHours, setOvertimeHours] = useState<number>(record?.overtimeHours || 0);
  const [note, setNote] = useState<string>(record?.note || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    if (record) {
      setStatus(record.status);
      setInTime(record.inTime || settings.shiftStart);
      setOutTime(record.outTime || settings.shiftEnd);
      setOvertimeHours(record.overtimeHours || 0);
      setNote(record.note || '');
    } else {
      setStatus('work');
      setInTime(settings.shiftStart);
      setOutTime(settings.shiftEnd);
      setOvertimeHours(0);
      setNote('');
    }
  }, [record, dateString, settings]);

  if (!isOpen) return null;

  // Calculate day wage from unified salary breakdown
  const breakdown = calculateSalaryBreakdown(settings, 1, 0, 0);
  const perDayWage = breakdown.perDayWage;
  let basePay = 0;
  if (status === 'work') basePay = perDayWage;
  else if (status === 'half_duty') basePay = perDayWage / 2;
  else if (status === 'overtime') basePay = perDayWage;

  const otPay = overtimeHours * settings.hourlyOt;
  const totalDayPay = basePay + otPay;

  const handleSave = () => {
    onSaveRecord(dateString, {
      status,
      inTime,
      outTime,
      overtimeHours,
      note: note.trim(),
      wageCalculated: totalDayPay,
      updatedAt: Date.now(),
    });

    // If there is a note and user wants it synced into notebook
    if (note.trim() && settings.autoSaveNoteToDiary) {
      onAddNoteFromDay(
        dateString,
        `Day Note: ${formatDateDisplay(dateString)}`,
        note.trim()
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1F2937] text-white border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide text-white">
                {formatDateDisplay(dateString)}
              </h2>
              <span className="text-xs text-gray-300 font-medium">
                Attendance & Duty Details
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-black text-[#1F2937] mb-2">
              Duty / Attendance Status:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {TOOLS_CONFIG.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setStatus(tool.id)}
                  className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    status === tool.id
                      ? `${tool.bgColor} ring-2 ring-[#1F2937] border-2 border-[#1F2937] font-extrabold shadow-sm scale-[1.02]`
                      : 'bg-gray-100 hover:bg-gray-200 text-[#1F2937] font-semibold border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-[10px] truncate w-full mt-0.5">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shift Time & Overtime */}
          <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  In Time (आने का समय)
                </label>
                <input
                  type="time"
                  value={inTime}
                  onChange={(e) => setInTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-[#1F2937]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Out Time (जाने का समय)
                </label>
                <input
                  type="time"
                  value={outTime}
                  onChange={(e) => setOutTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-[#1F2937]"
                />
              </div>
            </div>

            {/* Overtime hours */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-extrabold text-[#1F2937] block">
                  Overtime / ओवरटाइम (घंटे):
                </span>
                <span className="text-[10px] text-gray-500">
                  Rate: ₹{settings.hourlyOt}/hour
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOvertimeHours(Math.max(0, overtimeHours - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 font-black text-[#1F2937] flex items-center justify-center text-sm active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 text-center font-black text-base text-[#16A34A] bg-white border border-gray-300 rounded-xl py-1 shadow-2xs"
                />
                <span className="text-xs font-bold text-gray-600">hrs</span>
                <button
                  type="button"
                  onClick={() => setOvertimeHours(overtimeHours + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 font-black text-[#1F2937] flex items-center justify-center text-sm active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Day Wage Calculation Result */}
            <div className="pt-2 border-t border-gray-300 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">Estimated Day Earnings:</span>
              <strong className="text-sm font-black text-[#16A34A]">
                ₹{totalDayPay.toLocaleString('en-IN')}
                <span className="text-[10px] text-gray-500 font-normal ml-1">
                  (Base ₹{basePay} + OT ₹{otPay})
                </span>
              </strong>
            </div>
          </div>

          {/* Daily Note / Remark input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1F2937] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Daily Remark / Work Note:</span>
              </label>
              <span className="text-[10px] text-gray-500 font-semibold">
                Syncs with Notebook
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Write remarks or notes for this day (e.g. worked 2 extra hours, checked material)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-[#1F2937] focus:outline-hidden focus:border-[#16A34A] leading-relaxed"
            />
          </div>

          {/* Associated Notes for this date */}
          {notesForDate.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-gray-700">
                Notebook Entries for this Date ({notesForDate.length}):
              </span>
              <div className="space-y-1">
                {notesForDate.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded-lg bg-gray-100 text-xs text-[#1F2937] flex items-center justify-between border border-gray-200"
                  >
                    <span className="font-bold truncate">{n.title}</span>
                    {n.amount && (
                      <span className="text-[#16A34A] font-black shrink-0">
                        ₹{n.amount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#F3F4F6] border-t border-gray-200 flex items-center gap-2">
          {record && (
            confirmDelete ? (
              <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
                <button
                  type="button"
                  id="btn-confirm-delete-record"
                  onClick={() => {
                    onDeleteRecord(dateString);
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="py-2.5 px-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-clear-day-record"
                onClick={() => setConfirmDelete(true)}
                className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-red-200 shrink-0"
                title="Clear attendance for this date"
              >
                <Trash2 className="w-4 h-4 text-[#DC2626]" />
                <span>Clear</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
