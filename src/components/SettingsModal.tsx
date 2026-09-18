import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Save,
  Download,
  Upload,
  Check,
  BookOpen,
  Database,
  UserCheck,
  ShieldCheck,
  Calendar,
  DollarSign,
  Clock,
  Printer,
  FileSpreadsheet,
  Lock,
  Camera,
  CheckCircle2,
  HelpCircle,
  FileText,
  Share2,
  Bell,
} from 'lucide-react';
import { AppSettings } from '../types';
import {
  scheduleDailyReminders,
  cancelAllReminders,
  triggerTestNotification,
  DEFAULT_REMINDER_TIMES,
} from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onOpenPrivacy?: () => void;
  onOpenRefer?: () => void;
  onOpenGuide?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onOpenPrivacy,
  onOpenRefer,
  onOpenGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notebook' | 'reminders' | 'data' | 'about'>('general');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderStatusMsg, setReminderStatusMsg] = useState<string | null>(null);

  const handleToggleReminders = async () => {
    if (remindersEnabled) {
      await cancelAllReminders();
      setRemindersEnabled(false);
      setReminderStatusMsg('Reminders disabled');
    } else {
      const ok = await scheduleDailyReminders();
      setRemindersEnabled(ok);
      setReminderStatusMsg(ok ? '5 Daily Reminders Enabled!' : 'Permission denied for notifications');
    }
    setTimeout(() => setReminderStatusMsg(null), 3000);
  };

  const handleTestNotification = async () => {
    const ok = await triggerTestNotification();
    setReminderStatusMsg(ok ? 'Test notification sent!' : 'Unable to send notification');
    setTimeout(() => setReminderStatusMsg(null), 3000);
  };
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onImportData(content);
        alert('Data successfully imported!');
      } catch (err) {
        alert('Invalid backup file. Please select a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#141824] text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black tracking-wide">
              Settings & Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean, Policy Compliant Tabs (NO .APK/.AAB guide or Ads Setup guide) */}
        <div className="flex border-b border-amber-200 bg-[#fff9ed] overflow-x-auto p-1.5 gap-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'general'
                ? 'bg-white shadow-xs text-slate-900 border border-amber-300 font-extrabold'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>₹</span>
            <span>General Wages</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'notebook'
                ? 'bg-white shadow-xs text-slate-900 border border-amber-300 font-extrabold'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-700" />
            <span>Notepad Diary</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'reminders'
                ? 'bg-white shadow-xs text-slate-900 border border-amber-300 font-extrabold'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Reminders</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'data'
                ? 'bg-white shadow-xs text-slate-900 border border-amber-300 font-extrabold'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Data & Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'about'
                ? 'bg-white shadow-xs text-slate-900 border border-amber-300 font-extrabold'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>About App</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Help Box */}
              <div className="bg-[#ecfdf5] border-2 border-[#a7f3d0] rounded-2xl p-3.5 text-xs text-emerald-950 leading-relaxed shadow-xs">
                <strong className="font-extrabold text-emerald-900">Wage Calculation Settings:</strong> Set your daily wage rate and hourly overtime rate. Total salary and dues will be calculated automatically in monthly summaries and reports.
              </div>

              {/* Wage & OT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Daily Wage (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.dailyWage}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyWage: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-base font-extrabold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Daily base wage
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Hourly OT (₹/hr)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyOt}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyOt: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-base font-extrabold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Overtime rate per hour
                  </span>
                </div>
              </div>

              {/* Company & Employee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Company / Contractor
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Company or contractor name
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Employee / Worker Name
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Employee or worker name
                  </span>
                </div>
              </div>

              {/* ID & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Employee code / badge
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    Department / work unit
                  </span>
                </div>
              </div>

              {/* Shift timings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Shift Start Time
                  </label>
                  <select
                    value={formData.shiftStart}
                    onChange={(e) =>
                      setFormData({ ...formData, shiftStart: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      const val = `${String(i).padStart(2, '0')}:00`;
                      return (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Duty start
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Shift End Time
                  </label>
                  <select
                    value={formData.shiftEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, shiftEnd: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      const val = `${String(i).padStart(2, '0')}:00`;
                      return (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Duty end
                  </span>
                </div>
              </div>

              {/* Face Punch Duty Verification Toggle */}
              <div className="bg-[#faf5ff] border-2 border-[#e9d5ff] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="font-extrabold text-sm text-purple-950">
                    Face Punch Duty Verification (Optional)
                  </div>
                  <div className="text-xs text-purple-800/90 mt-0.5">
                    Capture camera selfie and biometric frame to mark attendance
                  </div>
                  <div className="text-[11px] text-purple-700 font-semibold mt-1">
                    {formData.facePunchEnabled
                      ? '✓ Enabled: Face Punch button is visible on screen'
                      : '✕ Disabled: Standard 1-tap attendance only'}
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.facePunchEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, facePunchEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#9333ea]"></div>
                </label>
              </div>

              {/* Save button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notebook' && (
            <div className="space-y-4">
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-3.5 text-xs text-cyan-950 leading-relaxed">
                <strong className="font-extrabold text-cyan-900">Notepad & Work Diary Integration:</strong> Manage daily remarks, site logs, and cash advance notes alongside attendance records.
              </div>

              <div className="space-y-3">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Auto-sync Attendance Remarks with Notebook
                    </span>
                    <span className="text-xs text-slate-500">
                      When you write a note for any date, automatically save it to the Notebook Work Diary.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSaveNoteToDiary}
                    onChange={(e) => {
                      const updated = { ...formData, autoSaveNoteToDiary: e.target.checked };
                      setFormData(updated);
                      onSaveSettings(updated);
                    }}
                    className="w-5 h-5 accent-cyan-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-slate-900 text-sm">Notebook Categories:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>General Notes:</strong> Daily thoughts and routine notes</li>
                    <li><strong>Khata & Advance:</strong> Track cash advance and payment ledgers</li>
                    <li><strong>Site Log:</strong> Site material check, work progress and supervisor logs</li>
                    <li><strong>Task / Todo:</strong> Important checklists and pending tasks</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
                <div className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-700" />
                  <span>Daily Attendance Reminders (4-5 Times / Day)</span>
                </div>
                <p className="leading-snug">
                  Automatic daily notification reminders help keep your attendance logs accurate without missing duty punches or overtime hours.
                </p>
              </div>

              {reminderStatusMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold animate-in slide-in-from-top-1">
                  {reminderStatusMsg}
                </div>
              )}

              {/* Toggle Switch */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    Enable Daily Notifications
                  </div>
                  <div className="text-xs text-slate-500">
                    Schedules 5 reminders daily on Android device
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleReminders}
                  className={`w-12 h-7 rounded-full transition-colors relative focus:outline-hidden ${
                    remindersEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                      remindersEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Scheduled Times Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Daily Scheduled Alarm Times:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {DEFAULT_REMINDER_TIMES.map((time, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-900 font-mono">{time.title.split(' ')[0]} {time.title.split(' ')[1]}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{time.body}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Test Notification Button */}
              <button
                type="button"
                onClick={handleTestNotification}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>Test Notification Now</span>
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 leading-relaxed">
                <strong className="font-extrabold text-amber-900">100% Offline & Private:</strong> All your attendance data is securely stored in your device storage. Use the backup options below to download or restore your data.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onExportData}
                  className="p-4 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-900 font-bold flex flex-col items-center justify-center text-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Download className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm font-extrabold">Download Backup (JSON)</div>
                    <div className="text-[11px] text-slate-500">Save your complete data to a file</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-400 text-emerald-900 font-bold flex flex-col items-center justify-center text-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Upload className="w-6 h-6 text-emerald-600" />
                  <div>
                    <div className="text-sm font-extrabold">Restore Backup</div>
                    <div className="text-[11px] text-slate-500">Load a previously saved backup file</div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-slate-700">
              {/* App Identity Banner */}
              <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-900/60 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        Attendance Notebook Pro
                      </h3>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        v1.0.0 Pro
                      </span>
                    </div>
                    <p className="text-xs text-amber-300 font-bold mt-1">
                      Duty Register • Overtime Counter • Salary Diary
                    </p>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      Daily duty, overtime hours, automatic salary calculation aur work diary maintain karne ke liye complete all-in-one solution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links: Refer to Friend & Privacy Policy & Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {onOpenRefer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRefer();
                    }}
                    className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl flex items-center gap-2.5 shadow-sm font-black text-xs transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left leading-tight">
                      <div>Refer to Friend</div>
                      <div className="text-[10px] text-emerald-200 font-normal">WhatsApp / Share</div>
                    </div>
                  </button>
                )}

                {onOpenPrivacy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPrivacy();
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-2xl flex items-center gap-2.5 shadow-2xs font-black text-xs transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-left leading-tight">
                      <div>Privacy Policy</div>
                      <div className="text-[10px] text-slate-500 font-normal">Offline & Secure</div>
                    </div>
                  </button>
                )}

                {onOpenGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGuide();
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border-2 border-indigo-200 text-indigo-950 rounded-2xl flex items-center gap-2.5 shadow-2xs font-black text-xs transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-left leading-tight">
                      <div>How to Use</div>
                      <div className="text-[10px] text-indigo-500 font-normal">Full App Guide</div>
                    </div>
                  </button>
                )}
              </div>

              {/* App Purpose / Summary Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 space-y-1.5 text-blue-950 leading-relaxed">
                <h4 className="font-extrabold text-xs text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Yeh App Kis Kaam Aata Hai?</span>
                </h4>
                <p className="text-[11px] text-slate-700">
                  Yeh app workers, site supervisors, factory staff, contractors (thekedar) aur chote-bade sabhi businesses ke liye banaya gaya hai. Isme aap har din ki attendance, in/out time, overtime hours aur payment ka hisab bilkul aasan tareeqe se manage kar sakte hain.
                </p>
              </div>

              {/* Core Features Grid */}
              <div className="space-y-2.5">
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                  App Ke Mukhya Features:
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  {/* Feature 1 */}
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs">1-Tap Daily Attendance</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Present (P), Half Day (HD), Overtime (OT), Holiday (H), Sick Leave (SL) aur Emergency (E) ko ek touch me mark karein.
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs">Automatic Salary & OT Calculation</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Apna daily wage aur hourly overtime rate set karein. Month ke end par total working days aur overtime amount automatic calculate ho jata hai.
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs">Work Diary & Khata Notebook</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Daily progress notes, advance payment (khata), site material logs aur important task checklists ek hi jagah save karein.
                      </div>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs">Face Punch (Camera Check-in)</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Bina kisi mahangi biometric machine ke, duty aane par selfie click karke verified time aur photo record karein.
                      </div>
                    </div>
                  </div>

                  {/* Feature 5 */}
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs">Official Salary Slip & PDF</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Supervisor aur employee signature ke sath official A4 salary slip print karein ya PDF download karke WhatsApp par share karein.
                      </div>
                    </div>
                  </div>

                  {/* Feature 6 */}
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs">HR Excel / CSV Export</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Pure mahine ki duty sheet ko Excel / CSV format me download karke computer ya contractor ke sath share karein.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Safety & Privacy */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-2 text-emerald-950">
                <div className="flex items-center gap-2 font-black text-xs text-emerald-900">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>100% Privacy & Data Security</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Aapka saara attendance, salary aur diary data aapke phone ki local storage me safe rehta hai. Isme kisi registration ya cloud account ki zaroorat nahi hoti.
                </p>
                <div className="pt-1 border-t border-emerald-200/80 text-[10px] text-emerald-800 font-bold flex items-center justify-between">
                  <span>Storage: On-Device Storage</span>
                  <span>Backup: JSON Export Supported</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
