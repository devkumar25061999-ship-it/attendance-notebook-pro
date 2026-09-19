import React from 'react';
import { CalendarDay } from '../utils/dateUtils';
import { AttendanceRecord, AttendanceStatus, NoteItem } from '../types';
import { TOOLS_CONFIG } from '../data/defaultData';
import { Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

interface CalendarGridProps {
  days: CalendarDay[];
  records: Record<string, AttendanceRecord>;
  notesByDate: Record<string, NoteItem[]>;
  selectedDate: string;
  selectedTool: AttendanceStatus;
  onDayClick: (day: CalendarDay) => void;
  onOpenDayDetails: (dateString: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  records,
  notesByDate,
  selectedDate,
  selectedTool,
  onDayClick,
  onOpenDayDetails,
}) => {
  const dayNames = [
    { name: 'SUN', isWeekend: true, bg: 'bg-rose-600 text-white font-black' },
    { name: 'MON', isWeekend: false, bg: 'bg-slate-900 text-slate-100 font-extrabold' },
    { name: 'TUE', isWeekend: false, bg: 'bg-slate-900 text-slate-100 font-extrabold' },
    { name: 'WED', isWeekend: false, bg: 'bg-slate-900 text-slate-100 font-extrabold' },
    { name: 'THU', isWeekend: false, bg: 'bg-slate-900 text-slate-100 font-extrabold' },
    { name: 'FRI', isWeekend: false, bg: 'bg-slate-900 text-slate-100 font-extrabold' },
    { name: 'SAT', isWeekend: true, bg: 'bg-amber-500 text-slate-950 font-black' },
  ];

  const activeToolConfig = TOOLS_CONFIG.find((t) => t.id === selectedTool);
  const isClearToolActive = selectedTool === 'clear';

  // Calculate month metrics for the engaging header
  const currentMonthDays = days.filter((d) => d.isCurrentMonth);
  const totalDaysInMonth = currentMonthDays.length || 30;
  const currentMonthRecords = currentMonthDays
    .map((d) => records[d.dateString])
    .filter(Boolean);

  const workDaysCount = currentMonthRecords.filter((r) => r.status === 'work').length;
  const halfDaysCount = currentMonthRecords.filter((r) => r.status === 'half_duty').length;
  const totalOtHours = currentMonthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  
  // Working duty percentage (assuming ~26 working days)
  const estimatedWorkingDays = Math.max(1, totalDaysInMonth - 4); // minus ~4 Sundays
  const dutyPercentage = Math.min(100, Math.round(((workDaysCount + halfDaysCount * 0.5) / estimatedWorkingDays) * 100));

  // Format selected date nicely (e.g., "18 Sep")
  const selectedDateParts = selectedDate.split('-');
  const selectedDayNum = selectedDateParts[2] || '';
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
    Number(selectedDateParts[1]) - 1
  ] || '';

  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 space-y-1">
      {/* Main Calendar Card */}
      <div className="bg-white rounded-xl overflow-hidden border-2 border-indigo-950 shadow-md ring-1 ring-black/5">
        {/* Header: SUN - SAT with vivid jewel badges */}
        <div className="grid grid-cols-7 border-b-2 border-indigo-950 text-center text-[10px] sm:text-xs tracking-wider">
          {dayNames.map((d) => (
            <div key={d.name} className={`py-1 ${d.bg}`}>
              {d.name}
            </div>
          ))}
        </div>

        {/* Days 7x5 or 7x6 Matrix */}
        <div className="grid grid-cols-7 border-collapse bg-slate-100/40">
          {days.map((day, idx) => {
            const record = records[day.dateString];
            const hasNotes = Boolean(notesByDate[day.dateString]?.length || record?.note);
            const isSelected = selectedDate === day.dateString;
            const toolConfig = record ? TOOLS_CONFIG.find((t) => t.id === record.status) : null;

            // Border styling to create clean grid
            const isRightCol = (idx + 1) % 7 === 0;
            const isBottomRow = idx >= days.length - 7;

            return (
              <div
                key={`${day.dateString}-${idx}`}
                onClick={() => onDayClick(day)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onOpenDayDetails(day.dateString);
                }}
                className={`h-[38px] xs:h-[42px] sm:h-[46px] p-0.5 xs:p-1 flex flex-col justify-between relative cursor-pointer select-none transition-all active:scale-95 overflow-hidden ${
                  !isRightCol ? 'border-r border-slate-200' : ''
                } ${!isBottomRow ? 'border-b border-slate-200' : ''} ${
                  isSelected
                    ? 'bg-blue-600 text-white font-black ring-2 ring-blue-400 ring-offset-1 z-20 shadow-md'
                    : !day.isCurrentMonth
                    ? 'bg-slate-50/60 text-slate-300'
                    : record
                    ? `${toolConfig?.bgColor || 'bg-blue-50/90'} text-slate-900`
                    : day.isToday
                    ? 'bg-amber-100/90 text-slate-950 ring-2 ring-inset ring-amber-400 font-extrabold'
                    : day.isSunday
                    ? 'bg-rose-50/40 text-slate-900 hover:bg-rose-100/50'
                    : day.isSaturday
                    ? 'bg-amber-50/30 text-slate-900 hover:bg-amber-100/40'
                    : 'bg-white hover:bg-blue-50/40 text-slate-900'
                }`}
              >
                {/* Top row: Date Number & Badges */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      isSelected
                        ? 'text-white drop-shadow-xs'
                        : !day.isCurrentMonth
                        ? day.isSunday
                          ? 'text-rose-300'
                          : 'text-slate-300'
                        : day.isSunday
                        ? 'text-rose-600'
                        : day.isToday
                        ? 'text-amber-950 font-black'
                        : 'text-slate-900'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Photo or Notebook indicator */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {record?.punchPhoto && (
                      <div
                        className="w-4 h-4 rounded-full overflow-hidden border-2 border-purple-500 shadow-xs shrink-0"
                        title={`Camera photo: ${record.punchTime || record.inTime || ''}`}
                      >
                        <img
                          src={record.punchPhoto}
                          alt="Punch Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {hasNotes && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDayDetails(day.dateString);
                        }}
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 transition-transform active:scale-90 ${
                          isSelected
                            ? 'bg-amber-300 text-slate-950 font-black ring-1 ring-white'
                            : 'bg-amber-500 text-white shadow-xs'
                        }`}
                        title="Has note / work diary entry"
                      >
                        📝
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom row: Status Tag / Badge */}
                <div className="w-full">
                  {record && !isSelected && (
                    <div
                      className={`text-[8.5px] sm:text-[9.5px] font-black px-1 py-0.5 rounded leading-none text-center truncate shadow-xs border border-black/5 ${
                        toolConfig?.badgeBg || 'bg-slate-700'
                      } ${toolConfig?.badgeText || 'text-white'}`}
                    >
                      {toolConfig?.icon} {record.overtimeHours ? `+${record.overtimeHours}h` : toolConfig?.name}
                    </div>
                  )}

                  {record && isSelected && (
                    <div className="text-[8.5px] sm:text-[9.5px] font-black px-1 py-0.5 rounded leading-none text-center bg-white text-blue-900 truncate shadow-xs">
                      {toolConfig?.icon} {record.overtimeHours ? `+${record.overtimeHours}h` : toolConfig?.name}
                    </div>
                  )}

                  {!record && day.isCurrentMonth && day.isToday && !isSelected && (
                    <div className="text-[8.5px] sm:text-[9px] text-center text-slate-950 bg-amber-400 font-black px-1 py-0.5 rounded leading-none shadow-xs">
                      Today
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Status indicator pill & Day Details Button */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Active Tool indicator pill */}
        <div
          className={`flex items-center gap-2 min-w-0 flex-1 border-2 rounded-xl px-3 py-1.5 shadow-xs transition-colors ${
            isClearToolActive
              ? 'bg-rose-50 border-rose-400 text-rose-950'
              : 'bg-white border-indigo-200 text-slate-900'
          }`}
        >
          <span className="text-base shrink-0">{activeToolConfig?.icon || '💼'}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[11px] sm:text-xs font-black truncate flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Active:</span>
              <span className={isClearToolActive ? 'text-rose-700 font-black' : 'text-blue-900 font-black'}>
                {activeToolConfig?.name || selectedTool}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              {isClearToolActive ? 'Tap date to erase attendance' : 'Tap date on calendar to mark'}
            </div>
          </div>
        </div>

        {/* Day Details Button */}
        <button
          id="btn-open-day-details-main"
          type="button"
          onClick={() => onOpenDayDetails(selectedDate)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-black px-3.5 py-2.5 rounded-xl shadow-md transition-all shrink-0 border border-blue-400"
          title={`View and edit full details for ${selectedDate}`}
        >
          <Calendar className="w-4 h-4 text-amber-300" />
          <span>{selectedDayNum} {monthShort} Details</span>
        </button>
      </div>
    </div>
  );
};
