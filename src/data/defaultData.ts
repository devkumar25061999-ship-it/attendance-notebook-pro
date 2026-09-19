import { AppSettings, AttendanceRecord, NoteItem, AttendanceStatus } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  dailyWage: 800,
  hourlyOt: 150,
  monthlyGrossSalary: 18000,
  basicSalary: 0,
  hraAmount: 0,
  pfPercent: 12,
  esiPercent: 0.75,
  monthlyAdvance: 1000,
  companyName: 'General Works',
  employeeName: 'Self',
  employeeId: 'EMP-001',
  department: 'Operations',
  shiftStart: '09:00',
  shiftEnd: '18:00',
  facePunchEnabled: true,
  autoSaveNoteToDiary: true,
};

export const INITIAL_ATTENDANCE: Record<string, AttendanceRecord> = {};

export const INITIAL_NOTES: NoteItem[] = [];

export const DEMO_ATTENDANCE: Record<string, AttendanceRecord> = {
  '2026-09-01': {
    date: '2026-09-01',
    status: 'work',
    inTime: '09:00',
    outTime: '18:00',
    overtimeHours: 0,
    note: 'Shift completed on time',
    updatedAt: Date.now() - 86400000 * 17,
  },
  '2026-09-02': {
    date: '2026-09-02',
    status: 'work',
    inTime: '09:00',
    outTime: '20:00',
    overtimeHours: 2,
    note: 'Site overtime 2 hours with supervisor check',
    updatedAt: Date.now() - 86400000 * 16,
  },
  '2026-09-06': {
    date: '2026-09-06',
    status: 'holiday',
    inTime: '',
    outTime: '',
    overtimeHours: 0,
    note: 'Weekly Sunday Off',
    updatedAt: Date.now() - 86400000 * 12,
  },
  '2026-09-10': {
    date: '2026-09-10',
    status: 'half_duty',
    inTime: '09:00',
    outTime: '13:30',
    overtimeHours: 0,
    note: 'Half day duty due to clinic visit',
    updatedAt: Date.now() - 86400000 * 8,
  },
  '2026-09-15': {
    date: '2026-09-15',
    status: 'work',
    inTime: '08:45',
    outTime: '18:00',
    overtimeHours: 0,
    note: 'Regular work day',
    updatedAt: Date.now() - 86400000 * 3,
  },
};

export const DEMO_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Site Material & Advance Received',
    content: 'Received ₹2,000 cash advance from contractor for local transport and cement tools. Verified on September site log.',
    date: '2026-09-02',
    category: 'khata',
    isPinned: true,
    amount: 2000,
    createdAt: Date.now() - 86400000 * 16,
    updatedAt: Date.now() - 86400000 * 16,
  },
  {
    id: 'note-2',
    title: 'Safety Helmet & ID Card Issued',
    content: 'Collected new safety helmet and biometric ID card EMP-001 from Operations gate.',
    date: '2026-09-01',
    category: 'general',
    isPinned: false,
    createdAt: Date.now() - 86400000 * 17,
    updatedAt: Date.now() - 86400000 * 17,
  },
  {
    id: 'note-3',
    title: 'Overtime Policy & Next Sunday Duty',
    content: 'Supervisor confirmed overtime rate is ₹150/hr flat. If required next Sunday, full holiday allowance applies.',
    date: '2026-09-15',
    category: 'site_log',
    isPinned: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  }
];

export interface ToolConfig {
  id: AttendanceStatus;
  name: string;
  nameHi: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  calendarDot: string;
}

export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: 'work',
    name: 'Work',
    nameHi: 'Full Day Work',
    icon: '💼',
    bgColor: 'bg-blue-100/90 hover:bg-blue-200/90',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-950',
    badgeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    badgeText: 'text-white',
    calendarDot: 'bg-blue-600',
  },
  {
    id: 'half_duty',
    name: 'Half Duty',
    nameHi: 'Half Day Duty',
    icon: '🌓',
    bgColor: 'bg-purple-100/90 hover:bg-purple-200/90',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-950',
    badgeBg: 'bg-gradient-to-r from-purple-600 to-fuchsia-600',
    badgeText: 'text-white',
    calendarDot: 'bg-purple-600',
  },
  {
    id: 'overtime',
    name: 'Overtime',
    nameHi: 'Overtime Hours',
    icon: '⏱️',
    bgColor: 'bg-emerald-100/90 hover:bg-emerald-200/90',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-950',
    badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    badgeText: 'text-white',
    calendarDot: 'bg-emerald-600',
  },
  {
    id: 'holiday',
    name: 'Holiday',
    nameHi: 'Holiday (Day Off)',
    icon: '🎉',
    bgColor: 'bg-amber-100/90 hover:bg-amber-200/90',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    badgeText: 'text-slate-950',
    calendarDot: 'bg-amber-500',
  },
  {
    id: 'vacation',
    name: 'Vacation',
    nameHi: 'Vacation / Leave',
    icon: '🏖️',
    bgColor: 'bg-cyan-100/90 hover:bg-cyan-200/90',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-950',
    badgeBg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
    badgeText: 'text-white',
    calendarDot: 'bg-cyan-600',
  },
  {
    id: 'sick',
    name: 'Sick',
    nameHi: 'Medical / Sick Leave',
    icon: '💊',
    bgColor: 'bg-rose-100/90 hover:bg-rose-200/90',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-950',
    badgeBg: 'bg-gradient-to-r from-rose-600 to-pink-600',
    badgeText: 'text-white',
    calendarDot: 'bg-rose-600',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    nameHi: 'Emergency Leave',
    icon: '🚨',
    bgColor: 'bg-orange-100/90 hover:bg-orange-200/90',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-950',
    badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-600',
    badgeText: 'text-white',
    calendarDot: 'bg-orange-600',
  },
  {
    id: 'note',
    name: 'Note',
    nameHi: 'Work Diary Note',
    icon: '📝',
    bgColor: 'bg-teal-100/90 hover:bg-teal-200/90',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-950',
    badgeBg: 'bg-gradient-to-r from-teal-600 to-cyan-700',
    badgeText: 'text-white',
    calendarDot: 'bg-teal-600',
  },
  {
    id: 'clear',
    name: 'Clear',
    nameHi: 'Erase Attendance',
    icon: '🧹',
    bgColor: 'bg-red-100/90 hover:bg-red-200/90',
    borderColor: 'border-red-400',
    textColor: 'text-red-950',
    badgeBg: 'bg-gradient-to-r from-red-600 to-rose-600',
    badgeText: 'text-white',
    calendarDot: 'bg-red-600',
  },
];
