import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MonthNavigation } from './components/MonthNavigation';
import { StatsCards } from './components/StatsCards';
import { ActionButtonsRow } from './components/ActionButtonsRow';
import { CalendarGrid } from './components/CalendarGrid';
import { ToolSelector } from './components/ToolSelector';
import { YearSelectorModal } from './components/YearSelectorModal';
import { ManageDataModal } from './components/ManageDataModal';
import { SettingsModal } from './components/SettingsModal';
import { ReferModal } from './components/ReferModal';
import { HowToUseModal } from './components/HowToUseModal';
import { NotebookModal } from './components/NotebookModal';
import { DayDetailModal } from './components/DayDetailModal';
import { ReportModal } from './components/ReportModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { FactoryHRModal } from './components/FactoryHRModal';
import { FactoryHRView } from './components/FactoryHRView';
import { getCalendarGrid, CalendarDay, getMonthlyGross, calculateSalaryBreakdown } from './utils/dateUtils';
import {
  loadSettings,
  saveSettings,
  loadAttendance,
  saveAttendance,
  loadNotes,
  saveNotes,
} from './utils/storage';
import { AttendanceRecord, AttendanceStatus, AppSettings, NoteItem } from './types';
import { INITIAL_ATTENDANCE, INITIAL_NOTES, DEMO_ATTENDANCE, DEMO_NOTES } from './data/defaultData';
import { exportAndSaveFile } from './utils/fileExport';
import { scheduleDailyReminders } from './utils/notifications';
import { initializeAdMob, showInterstitialAd } from './utils/admob';
import { Language } from './utils/translations';

export default function App() {
  // App state
  const [year, setYear] = useState<number>(2026);
  const [monthIndex, setMonthIndex] = useState<number>(8); // September (0-indexed: 8 is Sep)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [selectedTool, setSelectedTool] = useState<AttendanceStatus>('work');
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_user_language') as Language) || 'hi';
  });

  const handleToggleLanguage = () => {
    setLang((prev) => {
      const nextLang = prev === 'hi' ? 'en' : 'hi';
      localStorage.setItem('app_user_language', nextLang);
      return nextLang;
    });
  };

  // Stored Data
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(loadAttendance);
  const [notes, setNotes] = useState<NoteItem[]>(loadNotes);

  // Modals visibility
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isManageDataModalOpen, setIsManageDataModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isFactoryHRModalOpen, setIsFactoryHRModalOpen] = useState(false);

  const [appMode, setAppMode] = useState<'self' | 'hr'>('self');
  const [workersCount, setWorkersCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('attendance_factory_workers_v2');
      if (saved) return JSON.parse(saved).length;
    } catch (e) {
      // ignore
    }
    return 2;
  });

  // Update workers count when modal closes
  useEffect(() => {
    if (!isFactoryHRModalOpen) {
      try {
        const saved = localStorage.getItem('attendance_factory_workers_v2');
        if (saved) setWorkersCount(JSON.parse(saved).length);
      } catch (e) {
        // ignore
      }
    }
  }, [isFactoryHRModalOpen]);

  // Auto-sync storage & native initialization
  useEffect(() => {
    scheduleDailyReminders().catch((err) => console.log('Notification setup error:', err));
    initializeAdMob().catch((err) => console.log('AdMob setup error:', err));
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveAttendance(records);
  }, [records]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    return getCalendarGrid(year, monthIndex);
  }, [year, monthIndex]);

  // Group notes by date
  const notesByDate = useMemo(() => {
    const map: Record<string, NoteItem[]> = {};
    for (const note of notes) {
      if (!map[note.date]) map[note.date] = [];
      map[note.date].push(note);
    }
    return map;
  }, [notes]);

  // Current month stats calculation with Monthly Gross Salary, PF, ESI, OT, and Advance
  const currentMonthStats = useMemo(() => {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthRecords = Object.values(records).filter((r) => r.date.startsWith(prefix));

    const workDays = monthRecords.filter((r) => r.status === 'work').length;
    const halfDays = monthRecords.filter((r) => r.status === 'half_duty').length;
    const totalDaysWorked = workDays + halfDays * 0.5;
    const otHours = monthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    const breakdown = calculateSalaryBreakdown(settings, workDays, halfDays, otHours);
    const netSalary = breakdown.totalNetSalary;

    return {
      workDays,
      halfDays,
      overtimeHours: otHours,
      totalEarnings: netSalary > 0 ? netSalary : 0,
    };
  }, [records, year, monthIndex, settings]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonthIndex(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Calendar day click handler (matches original app: apply selected tool!)
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.dateString);

    if (selectedTool === 'clear') {
      // Clear/erase attendance for tapped date
      const updated = { ...records };
      delete updated[day.dateString];
      setRecords(updated);
      return;
    }

    if (selectedTool === 'note') {
      // Note tool opens the day details to write note
      setIsDayDetailModalOpen(true);
      return;
    }

    // Toggle or apply tool
    const existing = records[day.dateString];
    if (existing && existing.status === selectedTool) {
      // If tapped again with same tool, remove record to unmark
      const updated = { ...records };
      delete updated[day.dateString];
      setRecords(updated);
    } else {
      // Apply selected tool
      const defaultOt = selectedTool === 'overtime' ? 2 : 0;
      const breakdown = calculateSalaryBreakdown(settings, 1, 0, 0);
      const perDayWage = breakdown.perDayWage;
      let dayPay = 0;
      if (selectedTool === 'work') dayPay = perDayWage;
      else if (selectedTool === 'half_duty') dayPay = perDayWage / 2;
      dayPay += defaultOt * settings.hourlyOt;

      setRecords((prev) => ({
        ...prev,
        [day.dateString]: {
          date: day.dateString,
          status: selectedTool,
          inTime: existing?.inTime || settings.shiftStart,
          outTime: existing?.outTime || settings.shiftEnd,
          overtimeHours: existing?.overtimeHours ?? defaultOt,
          note: existing?.note || '',
          punchPhoto: existing?.punchPhoto,
          wageCalculated: dayPay,
          updatedAt: Date.now(),
        },
      }));
    }
  };

  // Day detail save
  const handleSaveDayRecord = (dateString: string, recordUpdates: Partial<AttendanceRecord>) => {
    setRecords((prev) => {
      const existing = prev[dateString] || {
        date: dateString,
        status: 'work',
        inTime: settings.shiftStart,
        outTime: settings.shiftEnd,
        overtimeHours: 0,
        updatedAt: Date.now(),
      };
      return {
        ...prev,
        [dateString]: {
          ...existing,
          ...recordUpdates,
        },
      };
    });
  };

  const handleDeleteDayRecord = (dateString: string) => {
    setRecords((prev) => {
      const updated = { ...prev };
      delete updated[dateString];
      return updated;
    });
  };

  const handleQuickDutyMark = (status: AttendanceStatus, otHours = 0, shiftNote = '') => {
    setRecords((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {
          date: selectedDate,
          status: 'work',
          inTime: settings.shiftStart,
          outTime: settings.shiftEnd,
          overtimeHours: 0,
        }),
        status,
        overtimeHours: otHours > 0 ? otHours : (status === 'overtime' ? (prev[selectedDate]?.overtimeHours || 2) : 0),
        note: shiftNote
          ? `${prev[selectedDate]?.note ? prev[selectedDate]?.note + ' | ' : ''}${shiftNote}`
          : prev[selectedDate]?.note,
        updatedAt: Date.now(),
      },
    }));
  };

  const handleQuickDutyClear = () => {
    handleDeleteDayRecord(selectedDate);
  };

  const handleFillWorkingDays = () => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    setRecords((prev) => {
      const updated = { ...prev };
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthIndex, day);
        // If not Sunday (0 is Sunday)
        if (d.getDay() !== 0) {
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (!updated[dateStr]) {
            updated[dateStr] = {
              date: dateStr,
              status: 'work',
              inTime: settings.shiftStart,
              outTime: settings.shiftEnd,
              overtimeHours: 0,
              updatedAt: Date.now(),
            };
          }
        }
      }
      return updated;
    });
  };

  // Notebook handlers
  const handleAddNote = (newNoteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...newNoteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleUpdateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSelectDateFromNote = (dateString: string) => {
    const [y, m] = dateString.split('-').map(Number);
    if (y && m) {
      setYear(y);
      setMonthIndex(m - 1);
      setSelectedDate(dateString);
    }
  };

  // Data management handlers
  const handleClearCurrentMonth = () => {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    setRecords((prev) => {
      const updated: Record<string, AttendanceRecord> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!k.startsWith(prefix)) {
          updated[k] = v;
        }
      }
      return updated;
    });
  };

  const handleClearAllRecords = () => {
    setRecords({});
  };

  const handleClearAllNotes = () => {
    setNotes([]);
  };

  const handleRestoreDemo = () => {
    setYear(2026);
    setMonthIndex(8); // September
    setSelectedDate('2026-09-18');
    setRecords(DEMO_ATTENDANCE);
    setNotes(DEMO_NOTES);
  };

  // Export JSON backup
  const handleExportJSON = async () => {
    const data = {
      app: 'Attendance Notebook Pro',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      records,
      notes,
    };
    const filename = `attendance_notebook_pro_backup_${year}_${monthIndex + 1}.json`;
    await exportAndSaveFile({
      filename,
      content: JSON.stringify(data, null, 2),
      mimeType: 'application/json',
      title: 'Attendance Notebook Pro - Data Backup',
      dialogTitle: 'Save or Share Data Backup',
    });
  };

  const handleImportJSON = (jsonStr: string) => {
    const parsed = JSON.parse(jsonStr);
    if (parsed.settings) setSettings(parsed.settings);
    if (parsed.records) setRecords(parsed.records);
    if (parsed.notes) setNotes(parsed.notes);
  };

  return (
    <div className="w-full h-full h-[100dvh] max-h-[100dvh] flex flex-col bg-[#F3F4F6] text-[#1F2937] font-sans overflow-hidden select-none overscroll-none">
      {/* Top Header - Fixed & Pinned */}
      <div className="shrink-0 z-30 shadow-xs">
        <Header
          year={year}
          lang={lang}
          onToggleLang={handleToggleLanguage}
          onOpenYearModal={() => setIsYearModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          onOpenReportModal={() => {
            showInterstitialAd();
            setIsReportModalOpen(true);
          }}
          onOpenNotebookModal={() => setIsNotebookModalOpen(true)}
          onOpenReferModal={() => setIsReferModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenManageDataModal={() => setIsManageDataModalOpen(true)}
          onOpenFactoryHRModal={() => setIsFactoryHRModalOpen(true)}
          notesCount={notes.length}
        />
      </div>

      {/* App Mode Switcher Bar */}
      <div className="bg-white px-3 py-1.5 flex items-center justify-between border-b border-gray-200 shrink-0 shadow-xs">
        <div className="text-xs font-black text-[#1F2937] flex items-center gap-1.5">
          <span>{lang === 'hi' ? 'मोड:' : 'Mode:'}</span>
        </div>
        <div className="flex bg-[#F3F4F6] p-1 rounded-xl gap-1 border border-gray-200">
          <button
            onClick={() => setAppMode('self')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
              appMode === 'self'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:text-black'
            }`}
          >
            {lang === 'hi' ? '👤 व्यक्तिगत हाजिरी' : '👤 Self Attendance'}
          </button>
          <button
            onClick={() => setAppMode('hr')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
              appMode === 'hr'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#1F2937] hover:text-black'
            }`}
          >
            {lang === 'hi' ? '🏭 फैक्ट्री HR मोड' : '🏭 Factory HR Mode'}
          </button>
        </div>
      </div>

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between px-2 sm:px-3 py-1 overflow-y-auto">
        {appMode === 'hr' ? (
          <div className="flex-1 flex flex-col my-1 overflow-hidden">
            <FactoryHRView defaultHourlyOt={settings.hourlyOt} lang={lang} />
          </div>
        ) : (
          <>
            {/* Dark Pill Month Navigation */}
        <MonthNavigation
          currentMonthIndex={monthIndex}
          year={year}
          lang={lang}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectCurrentMonth={handleResetToCurrentMonth}
        />

        {/* Quick Stats: Work: X Days | Overtime: Y Hours */}
        <StatsCards
          workDays={currentMonthStats.workDays}
          halfDays={currentMonthStats.halfDays}
          overtimeHours={currentMonthStats.overtimeHours}
          totalEarnings={currentMonthStats.totalEarnings}
          dailyWage={calculateSalaryBreakdown(settings, 0, 0, 0).perDayWage}
          lang={lang}
          onViewSalaryDetails={() => setIsReportModalOpen(true)}
        />

        {/* Action Row: Work Diary, Salary Slip & Print */}
        <ActionButtonsRow
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenNotebook={() => setIsNotebookModalOpen(true)}
          onOpenReport={() => setIsReportModalOpen(true)}
          lang={lang}
        />

        {/* Calendar Grid 7-column SUN-SAT with badges and note indicators */}
        <div className="w-full my-1 shrink-0">
          <CalendarGrid
            days={calendarDays}
            records={records}
            notesByDate={notesByDate}
            selectedDate={selectedDate}
            selectedTool={selectedTool}
            lang={lang}
            onDayClick={handleDayClick}
            onOpenDayDetails={(dateStr) => {
              setSelectedDate(dateStr);
              setIsDayDetailModalOpen(true);
            }}
          />
        </div>

        {/* 8-status Tool Selector Toolbar */}
        <ToolSelector
          selectedTool={selectedTool}
          lang={lang}
          onSelectTool={(tool) => {
            setSelectedTool(tool);
            if (tool === 'note') {
              // Quick open notebook
              setIsNotebookModalOpen(true);
            }
          }}
        />

          </>
        )}

        {/* Quick Footer Links: Refer to Friend • Privacy Policy • How to Use */}
        <footer className="w-full shrink-0 pt-1 pb-0.5 px-2 flex items-center justify-center gap-3 text-[10.5px] font-semibold text-[#1F2937] border-t border-gray-300 mt-0.5">
          <button
            id="btn-footer-refer"
            onClick={() => setIsReferModalOpen(true)}
            className="text-[#16A34A] hover:text-green-800 font-black flex items-center gap-1 active:scale-95 transition-transform"
            title="Refer App to Friends & Coworkers"
          >
            <span>🎁</span>
            <span>{lang === 'hi' ? 'मित्र को भेजें' : 'Refer to Friend'}</span>
          </button>
          <span className="text-gray-300">•</span>
          <button
            id="btn-footer-privacy"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-[#1F2937] hover:text-black font-bold active:scale-95 transition-transform"
            title="Privacy Policy & Offline Data Security"
          >
            {lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
          </button>
          <span className="text-gray-300">•</span>
          <button
            id="btn-footer-guide"
            onClick={() => setIsGuideModalOpen(true)}
            className="text-[#1F2937] hover:text-black font-bold active:scale-95 transition-transform"
            title="How to Use App Guide"
          >
            {lang === 'hi' ? 'उपयोग विधि' : 'How to Use'}
          </button>
        </footer>
      </main>

      {/* Modals */}
      <YearSelectorModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        selectedYear={year}
        onSelectYear={(newYear) => setYear(newYear)}
      />

      <ManageDataModal
        isOpen={isManageDataModalOpen}
        onClose={() => setIsManageDataModalOpen(false)}
        monthIndex={monthIndex}
        year={year}
        onClearCurrentMonth={handleClearCurrentMonth}
        onClearAllRecords={handleClearAllRecords}
        onClearAllNotes={handleClearAllNotes}
        onRestoreDemo={handleRestoreDemo}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onExportData={handleExportJSON}
        onImportData={handleImportJSON}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenRefer={() => setIsReferModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      <ReferModal
        isOpen={isReferModalOpen}
        onClose={() => setIsReferModalOpen(false)}
        appName="Attendance Plus Notebook"
      />

      <HowToUseModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <NotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        notes={notes}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onClearAllNotes={handleClearAllNotes}
        onSelectDateFromNote={handleSelectDateFromNote}
        currentSelectedDate={selectedDate}
      />

      <DayDetailModal
        isOpen={isDayDetailModalOpen}
        onClose={() => setIsDayDetailModalOpen(false)}
        dateString={selectedDate}
        record={records[selectedDate]}
        settings={settings}
        notesForDate={notesByDate[selectedDate] || []}
        onSaveRecord={handleSaveDayRecord}
        onDeleteRecord={handleDeleteDayRecord}
        onAddNoteFromDay={(dateStr, noteTitle, noteContent) => {
          handleAddNote({
            title: noteTitle,
            content: noteContent,
            date: dateStr,
            category: 'general',
            isPinned: false,
          });
        }}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        year={year}
        monthIndex={monthIndex}
        records={records}
        settings={settings}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <FactoryHRModal
        isOpen={isFactoryHRModalOpen}
        onClose={() => setIsFactoryHRModalOpen(false)}
        defaultHourlyOt={settings.hourlyOt}
      />
    </div>
  );
}
