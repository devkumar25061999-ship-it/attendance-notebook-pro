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
  onOpenFacePunch: () => void;
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
  onOpenFacePunch,
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#141a29] text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide text-white">
                {formatDateDisplay(dateString)}
              </h2>
              <span className="text-xs text-amber-300 font-medium">
                Attendance & Duty Details
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2">
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
                      ? `${tool.bgColor} ring-2 ring-slate-900 border-2 border-slate-900 font-extrabold shadow-sm scale-[1.02]`
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200'
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
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  In Time
                </label>
                <input
                  type="time"
                  value={inTime}
                  onChange={(e) => setInTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Out Time
                </label>
                <input
                  type="time"
                  value={outTime}
                  onChange={(e) => setOutTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Overtime hours */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  Overtime (Hours):
                </span>
                <span className="text-[10px] text-slate-500">
                  Rate: ₹{settings.hourlyOt}/hour
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOvertimeHours(Math.max(0, overtimeHours - 0.5))}
                  className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900 flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-base text-emerald-800">
                  {overtimeHours} hrs
                </span>
                <button
                  type="button"
                  onClick={() => setOvertimeHours(overtimeHours + 0.5)}
                  className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-slate-900 flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Day Wage Calculation Result */}
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Estimated Day Earnings:</span>
              <strong className="text-sm font-black text-emerald-700">
                ₹{totalDayPay.toLocaleString('en-IN')}
                <span className="text-[10px] text-slate-500 font-normal ml-1">
                  (Base ₹{basePay} + OT ₹{otPay})
                </span>
              </strong>
            </div>
          </div>

          {/* Daily Note / Remark input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-700" />
                <span>Daily Remark / Work Note:</span>
              </label>
              <span className="text-[10px] text-cyan-700 font-semibold">
                Syncs with Notebook
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Write remarks or notes for this day (e.g. worked 2 extra hours, checked material)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-cyan-600 leading-relaxed"
            />
          </div>

          {/* Photo verification if present or button to take photo */}
          {record?.punchPhoto ? (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={record.punchPhoto}
                  alt="Punch Verification"
                  className="w-14 h-14 object-cover rounded-xl border-2 border-purple-400 shadow-xs cursor-pointer hover:opacity-90"
                  onClick={onOpenFacePunch}
                  title="Click to view full photo"
                />
                <div className="text-xs">
                  <span className="font-black text-purple-950 block flex items-center gap-1.5">
                    <span>Face Punch Photo</span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                      Verified
                    </span>
                  </span>
                  <span className="text-purple-800 text-[11px] font-semibold mt-0.5 block">
                    Time: {record.punchTime || record.inTime}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenFacePunch}
                className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenFacePunch}
              className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-dashed border-purple-300 rounded-xl text-xs font-bold text-purple-900 flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Take Camera Selfie for this Day</span>
            </button>
          )}

          {/* Associated Notes for this date */}
          {notesForDate.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700">
                Notebook Entries for this Date ({notesForDate.length}):
              </span>
              <div className="space-y-1">
                {notesForDate.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded-lg bg-slate-100 text-xs text-slate-800 flex items-center justify-between"
                  >
                    <span className="font-bold truncate">{n.title}</span>
                    {n.amount && (
                      <span className="text-emerald-700 font-black shrink-0">
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
        <div className="p-3.5 bg-[#fdfbf6] border-t border-slate-200 flex items-center gap-2">
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
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="py-2.5 px-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-clear-day-record"
                onClick={() => setConfirmDelete(true)}
                className="py-2.5 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-rose-300 shrink-0"
                title="Clear attendance for this date"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Clear</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
