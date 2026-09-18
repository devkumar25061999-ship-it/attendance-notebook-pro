import { AppSettings, AttendanceRecord, NoteItem } from '../types';
import { DEFAULT_SETTINGS, INITIAL_ATTENDANCE, INITIAL_NOTES } from '../data/defaultData';

const SETTINGS_KEY = 'attendance_plus_settings_v1';
const ATTENDANCE_KEY = 'attendance_plus_records_v1';
const NOTES_KEY = 'attendance_plus_notebook_v1';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (_) {}
}

export function loadAttendance(): Record<string, AttendanceRecord> {
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (!raw) return INITIAL_ATTENDANCE;
    const parsed = JSON.parse(raw);
    // Purge legacy initial demo attendance dates so user starts completely clean
    const demoDates = ['2026-09-01', '2026-09-02', '2026-09-06', '2026-09-10', '2026-09-15'];
    const keys = Object.keys(parsed);
    if (keys.length > 0 && keys.length <= 5 && keys.every((k) => demoDates.includes(k))) {
      saveAttendance({});
      return {};
    }
    return parsed;
  } catch (_) {
    return INITIAL_ATTENDANCE;
  }
}

export function saveAttendance(records: Record<string, AttendanceRecord>): void {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  } catch (_) {}
}

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return INITIAL_NOTES;
    const parsed: NoteItem[] = JSON.parse(raw);
    // Purge legacy starter pre-notes (note-1, note-2, note-3) so user starts with a clean notebook
    const clean = parsed.filter(
      (n) => n.id !== 'note-1' && n.id !== 'note-2' && n.id !== 'note-3'
    );
    if (clean.length !== parsed.length) {
      saveNotes(clean);
    }
    return clean;
  } catch (_) {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (_) {}
}
