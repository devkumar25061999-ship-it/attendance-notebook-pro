export type AttendanceStatus =
  | 'work'
  | 'half_duty'
  | 'overtime'
  | 'holiday'
  | 'vacation'
  | 'sick'
  | 'emergency'
  | 'note'
  | 'clear';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
  overtimeHours?: number;
  note?: string;
  punchPhoto?: string;
  punchTime?: string;
  wageCalculated?: number;
  updatedAt: number;
}

export interface AppSettings {
  dailyWage: number;
  hourlyOt: number;
  companyName: string;
  employeeName: string;
  employeeId: string;
  department: string;
  shiftStart: string;
  shiftEnd: string;
  facePunchEnabled: boolean;
  autoSaveNoteToDiary: boolean;
}

export type NoteCategory = 'general' | 'khata' | 'site_log' | 'task' | 'meeting';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  category: NoteCategory;
  isPinned?: boolean;
  amount?: number; // for advance/khata notes
  createdAt: number;
  updatedAt: number;
}
