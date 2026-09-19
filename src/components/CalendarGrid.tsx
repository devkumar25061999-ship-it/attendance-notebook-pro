import React from 'react';
import { CalendarDay } from '../utils/dateUtils';
import { AttendanceRecord, AttendanceStatus, NoteItem } from '../types';
import { TOOLS_CONFIG } from '../data/defaultData';
import { Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { DAY_NAMES_HI } from '../utils/dateUtils';
import { Language } from '../utils/translations';

interface CalendarGridProps {
  days: CalendarDay[];
  records: Record<string, AttendanceRecord>;
  notesByDate: Record<string, NoteItem[]>;
  selectedDate: string;
  selectedTool: AttendanceStatus;
  lang?: Language;
  onDayClick: (day: CalendarDay) => void;
  onOpenDayDetails: (dateString: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  records,
  notesByDate,
  selectedDate,
  selectedTool,
  lang = 'en',
  onDayClick,
  onOpenDayDetails,
}) => {
  const dayNamesEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayNames = (lang === 'hi' ? DAY_NAMES_HI : dayNamesEn).map((name, idx) => ({
    name,
    isWeekend: idx === 0 || idx === 6,
    bg: idx === 0 ? 'bg-[#DC2626] text-white font-black' : 'bg-[#1F2937] text-white font-extrabold',
  }));

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
      <div className="bg-white rounded-xl overflow-hidden border border-gray-300 shadow-xs">
        {/* Header: SUN - SAT with vivid jewel badges */}
        <div className="grid grid-cols-7 border-b border-gray-300 text-center text-[10px] sm:text-xs tracking-wider">
          {dayNames.map((d) => (
            <div key={d.name} className={`py-1 ${d.bg}`}>
              {d.name}
            </div>
          ))}
        </div>

        {/* Days 7x5 or 7x6 Matrix */}
        <div className="grid grid-cols-7 border-collapse bg-[#F3F4F6]">
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
                  !isRightCol ? 'border-r border-gray-200' : ''
                } ${!isBottomRow ? 'border-b border-gray-200' : ''} ${
                  isSelected
                    ? 'bg-[#16A34A] text-white font-black ring-2 ring-[#16A34A] ring-offset-1 z-20 shadow-xs'
                    : !day.isCurrentMonth
                    ? 'bg-gray-100 text-gray-300'
                    : record
                    ? `${toolConfig?.bgColor || 'bg-green-50'} text-[#1F2937]`
                    : day.isToday
                    ? 'bg-amber-100 text-[#1F2937] ring-2 ring-inset ring-amber-400 font-extrabold'
                    : day.isSunday
                    ? 'bg-red-50/40 text-[#1F2937] hover:bg-red-100/50'
                    : day.isSaturday
                    ? 'bg-gray-50 text-[#1F2937] hover:bg-gray-100'
                    : 'bg-white hover:bg-gray-50 text-[#1F2937]'
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
                          ? 'text-red-300'
                          : 'text-gray-300'
                        : day.isSunday
                        ? 'text-[#DC2626]'
                        : day.isToday
                        ? 'text-[#1F2937] font-black'
                        : 'text-[#1F2937]'
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
          className={`flex items-center gap-2 min-w-0 flex-1 border rounded-xl px-3 py-1.5 shadow-xs transition-colors ${
            isClearToolActive
              ? 'bg-red-50 border-[#DC2626] text-[#DC2626]'
              : 'bg-white border-gray-300 text-[#1F2937]'
          }`}
        >
          <span className="text-base shrink-0">{activeToolConfig?.icon || '💼'}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[11px] sm:text-xs font-black truncate flex items-center gap-1.5">
              <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Active:</span>
              <span className={isClearToolActive ? 'text-[#DC2626] font-black' : 'text-[#16A34A] font-black'}>
                {activeToolConfig?.name || selectedTool}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 font-medium truncate">
              {isClearToolActive ? 'Tap date to erase attendance' : 'Tap date on calendar to mark'}
            </div>
          </div>
        </div>

        {/* Day Details Button */}
        <button
          id="btn-open-day-details-main"
          type="button"
          onClick={() => onOpenDayDetails(selectedDate)}
          className="flex items-center gap-1.5 bg-[#16A34A] hover:bg-green-700 active:scale-95 text-white text-xs sm:text-sm font-black px-3.5 py-2.5 rounded-xl shadow-xs transition-all shrink-0 border border-green-600"
          title={`View and edit full details for ${selectedDate}`}
        >
          <Calendar className="w-4 h-4 text-white" />
          <span>{selectedDayNum} {monthShort} Details</span>
        </button>
      </div>
    </div>
  );
};
