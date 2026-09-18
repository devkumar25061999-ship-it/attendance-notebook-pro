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
import { FacePunchModal } from './components/FacePunchModal';
import { ReportModal } from './components/ReportModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { getCalendarGrid, CalendarDay } from './utils/dateUtils';
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

export default function App() {
  // App state
  const [year, setYear] = useState<number>(2026);
  const [monthIndex, setMonthIndex] = useState<number>(8); // September (0-indexed: 8 is Sep)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [selectedTool, setSelectedTool] = useState<AttendanceStatus>('work');

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
  const [isFacePunchModalOpen, setIsFacePunchModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Auto-sync storage
  useEffect(() => {
    scheduleDailyReminders().catch((err) => console.log('Notification setup error:', err));
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

  // Current month stats calculation
  const currentMonthStats = useMemo(() => {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthRecords = Object.values(records).filter((r) => r.date.startsWith(prefix));

    const workDays = monthRecords.filter((r) => r.status === 'work').length;
    const halfDays = monthRecords.filter((r) => r.status === 'half_duty').length;
    const otHours = monthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    const basePay = workDays * settings.dailyWage + halfDays * (settings.dailyWage / 2);
    const otPay = otHours * settings.hourlyOt;
    const totalEarnings = basePay + otPay;

    return {
      workDays,
      halfDays,
      overtimeHours: otHours,
      totalEarnings,
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

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonthIndex(now.getMonth());
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
      let dayPay = 0;
      if (selectedTool === 'work') dayPay = settings.dailyWage;
      else if (selectedTool === 'half_duty') dayPay = settings.dailyWage / 2;
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

  // Face punch handler
  const handleFacePunchSuccess = (photoDataUrl: string, punchTime: string) => {
    setRecords((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {
          date: selectedDate,
          status: 'work',
          inTime: punchTime,
          outTime: settings.shiftEnd,
          overtimeHours: 0,
        }),
        status: 'work',
        punchPhoto: photoDataUrl,
        punchTime,
        inTime: punchTime,
        updatedAt: Date.now(),
      },
    }));
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
    <div className="w-full h-full h-[100dvh] max-h-[100dvh] flex flex-col bg-[#f8fafc] font-sans overflow-hidden select-none overscroll-none">
      {/* Top Header - Fixed & Pinned */}
      <div className="shrink-0 z-30 shadow-md">
        <Header
          year={year}
          onOpenYearModal={() => setIsYearModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenNotebookModal={() => setIsNotebookModalOpen(true)}
          onOpenReferModal={() => setIsReferModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenManageDataModal={() => setIsManageDataModalOpen(true)}
          notesCount={notes.length}
        />
      </div>

      {/* Main Screen Content - Perfectly Fitted Single-Screen Layout (No Sliding/Scrolling) */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between px-2 sm:px-3 py-1 overflow-hidden">
        {/* Dark Pill Month Navigation */}
        <MonthNavigation
          currentMonthIndex={monthIndex}
          year={year}
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
          dailyWage={settings.dailyWage}
          onViewSalaryDetails={() => setIsReportModalOpen(true)}
        />

        {/* Action Row: Face Punch, Work Diary, Salary Slip & Print */}
        <ActionButtonsRow
          onOpenFacePunch={() => setIsFacePunchModalOpen(true)}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenNotebook={() => setIsNotebookModalOpen(true)}
          onOpenReport={() => setIsReportModalOpen(true)}
          facePunchEnabled={settings.facePunchEnabled}
          punchPhoto={records[selectedDate]?.punchPhoto}
          punchTime={records[selectedDate]?.punchTime || records[selectedDate]?.inTime}
        />

        {/* Calendar Grid 7-column SUN-SAT with badges and note indicators */}
        <div className="flex-1 min-h-0 flex flex-col justify-center my-0.5">
          <CalendarGrid
            days={calendarDays}
            records={records}
            notesByDate={notesByDate}
            selectedDate={selectedDate}
            selectedTool={selectedTool}
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
          onSelectTool={(tool) => {
            setSelectedTool(tool);
            if (tool === 'note') {
              // Quick open notebook
              setIsNotebookModalOpen(true);
            }
          }}
        />

        {/* Quick Footer Links: Refer to Friend • Privacy Policy • How to Use */}
        <footer className="w-full shrink-0 pt-1 pb-0.5 px-2 flex items-center justify-center gap-3 text-[10.5px] font-semibold text-slate-500 border-t border-slate-200/80 mt-0.5">
          <button
            id="btn-footer-refer"
            onClick={() => setIsReferModalOpen(true)}
            className="text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-1 active:scale-95 transition-transform"
            title="Refer App to Friends & Coworkers"
          >
            <span>🎁</span>
            <span>Refer to Friend</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            id="btn-footer-privacy"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-slate-600 hover:text-slate-900 font-bold active:scale-95 transition-transform"
            title="Privacy Policy & Offline Data Security"
          >
            Privacy Policy
          </button>
          <span className="text-slate-300">•</span>
          <button
            id="btn-footer-guide"
            onClick={() => setIsGuideModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-900 font-bold active:scale-95 transition-transform"
            title="How to Use App Guide"
          >
            How to Use
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
        onOpenFacePunch={() => {
          setIsDayDetailModalOpen(false);
          setIsFacePunchModalOpen(true);
        }}
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

      <FacePunchModal
        isOpen={isFacePunchModalOpen}
        onClose={() => setIsFacePunchModalOpen(false)}
        selectedDate={selectedDate}
        existingPhoto={records[selectedDate]?.punchPhoto}
        onPunchSuccess={handleFacePunchSuccess}
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
    </div>
  );
}
