export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_HI = [
  'जनवरी',
  'फरवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

export const DAY_NAMES_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];


export interface CalendarDay {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  isToday: boolean;
}

export function getCalendarGrid(year: number, monthIndex: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  
  // First day of current month (0: Sunday, 1: Monday, ... 6: Saturday)
  const firstDay = new Date(year, monthIndex, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
  
  // Days in current month
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  // Days in previous month
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  // Current real date
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Previous month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(prevYear, prevMonth, dayNum);
    const dayOfWeek = dateObj.getDay();
    days.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
      isToday: dateString === todayStr,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(year, monthIndex, dayNum);
    const dayOfWeek = dateObj.getDay();
    days.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
      isToday: dateString === todayStr,
    });
  }

  // Next month padding to fill out rows (multiple of 7)
  const totalDaysSoFar = days.length;
  const remainingDays = (7 - (totalDaysSoFar % 7)) % 7;
  for (let dayNum = 1; dayNum <= remainingDays; dayNum++) {
    const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(nextYear, nextMonth, dayNum);
    const dayOfWeek = dateObj.getDay();
    days.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
      isToday: dateString === todayStr,
    });
  }

  return days;
}

export function formatDateDisplay(dateString: string): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  if (!y || !m || !d) return dateString;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getMonthlyGross(rawSalary: number = 16000): number {
  if (rawSalary > 200000) {
    return rawSalary / 12;
  }
  return rawSalary;
}

export function calculateSalaryBreakdown(
  settings: {
    monthlyGrossSalary?: number;
    basicSalary?: number;
    hraAmount?: number;
    pfPercent?: number;
    esiPercent?: number;
    monthlyAdvance?: number;
    hourlyOt?: number;
  },
  workDays: number,
  halfDays: number,
  totalOtHours: number
) {
  const rawGross = settings.monthlyGrossSalary ?? 16000;
  const monthlyGross = getMonthlyGross(rawGross);
  const rawBasic = settings.basicSalary ?? 0;
  // If basic is explicitly entered (>0), use it; otherwise default basic = gross
  const monthlyBasic = rawBasic > 0 ? getMonthlyGross(rawBasic) : monthlyGross;

  // HRA is explicitly configured or automatically the difference between Gross and Basic
  const rawHra = settings.hraAmount ?? 0;
  const monthlyHra = rawHra > 0 ? getMonthlyGross(rawHra) : Math.max(0, monthlyGross - monthlyBasic);

  const pfPct = settings.pfPercent ?? 12;
  const esiPct = settings.esiPercent ?? 0.75;

  // PF & ESI are calculated on Basic Salary (or Gross if Basic isn't separate)
  const deductionBase = monthlyBasic > 0 ? monthlyBasic : monthlyGross;
  const pfDeduction = Math.round(deductionBase * (pfPct / 100));
  const esiDeduction = Math.round(deductionBase * (esiPct / 100));
  const monthlyNetGross = monthlyGross - pfDeduction - esiDeduction;

  const totalDaysInMonth = 26;
  const dutyDays = workDays + halfDays * 0.5;

  // Per Day Rates
  const basicPerDay = totalDaysInMonth > 0 ? monthlyBasic / totalDaysInMonth : 0;
  const hraPerDay = totalDaysInMonth > 0 ? monthlyHra / totalDaysInMonth : 0;
  const grossPerDay = totalDaysInMonth > 0 ? monthlyGross / totalDaysInMonth : 0;

  const perDayWage = totalDaysInMonth > 0 ? monthlyNetGross / totalDaysInMonth : 0;
  // Keep exact floating perDayWage or rounded to 2 decimals for display
  const perDayWageRounded = Math.round(perDayWage * 100) / 100;

  // Earned Components for days worked
  const earnedBasic = Math.round(basicPerDay * dutyDays);
  const earnedHra = Math.round(hraPerDay * dutyDays);
  const baseSalary = perDayWage * workDays;
  const halfDaySalary = perDayWage * 0.5 * halfDays;
  const earnedBaseNet = baseSalary + halfDaySalary;

  const otSalary = totalOtHours * (settings.hourlyOt || 150);
  const advanceDeduction = settings.monthlyAdvance || 0;
  const totalGrossEarnings = earnedBasic + earnedHra + otSalary;
  const totalNetSalary = Math.max(0, Math.round(earnedBaseNet + otSalary - advanceDeduction));

  return {
    monthlyGross,
    monthlyBasic,
    monthlyHra,
    basicPerDay: Math.round(basicPerDay * 100) / 100,
    hraPerDay: Math.round(hraPerDay * 100) / 100,
    grossPerDay: Math.round(grossPerDay * 100) / 100,
    dutyDays,
    earnedBasic,
    earnedHra,
    totalGrossEarnings,
    pfDeduction,
    esiDeduction,
    monthlyNetGross,
    perDayWage: perDayWageRounded,
    exactPerDayWage: perDayWage,
    baseSalary: Math.round(baseSalary),
    halfDaySalary: Math.round(halfDaySalary),
    earnedBaseNet,
    otSalary,
    advanceDeduction,
    totalNetSalary,
  };
}

