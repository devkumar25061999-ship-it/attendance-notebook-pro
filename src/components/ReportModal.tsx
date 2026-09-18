import React, { useState } from 'react';
import {
  BarChart3,
  X,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  User,
  Building,
  Calendar,
  Share2,
  Copy,
  Check,
  Eye,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { AttendanceRecord, AppSettings } from '../types';
import { MONTH_NAMES } from '../utils/dateUtils';
import { exportAndSaveFile, printOrSaveSlip } from '../utils/fileExport';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  monthIndex: number;
  records: Record<string, AttendanceRecord>;
  settings: AppSettings;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  year,
  monthIndex,
  records,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'slip'>('summary');
  const [copied, setCopied] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  if (!isOpen) return null;

  const monthName = MONTH_NAMES[monthIndex];
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  // Filter records for current month
  const monthRecords = Object.values(records).filter((r) => r.date.startsWith(prefix));
  const sortedRecords = [...monthRecords].sort((a, b) => a.date.localeCompare(b.date));

  // Count stats
  const workDays = monthRecords.filter((r) => r.status === 'work').length;
  const halfDays = monthRecords.filter((r) => r.status === 'half_duty').length;
  const holidays = monthRecords.filter((r) => r.status === 'holiday').length;
  const sickDays = monthRecords.filter((r) => r.status === 'sick').length;
  const emergencyDays = monthRecords.filter((r) => r.status === 'emergency').length;
  const vacationDays = monthRecords.filter((r) => r.status === 'vacation').length;
  const totalLeaves = sickDays + emergencyDays + vacationDays;

  const totalOtHours = monthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  // Financials
  const baseSalary = workDays * settings.dailyWage;
  const halfDaySalary = halfDays * (settings.dailyWage / 2);
  const otSalary = totalOtHours * settings.hourlyOt;
  const totalNetSalary = baseSalary + halfDaySalary + otSalary;

  // Generate complete printable A4 HTML Slip
  const generateSlipHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salary Slip - ${settings.employeeName} - ${monthName} ${year}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 12px;
      line-height: 1.4;
    }
    .slip-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      padding: 24px;
      border-radius: 8px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .company-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sub-title {
      font-size: 13px;
      color: #475569;
      margin-top: 2px;
    }
    .slip-badge {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 12px;
      text-align: right;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
    }
    .info-card h4 {
      margin: 0 0 8px 0;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { font-weight: 700; color: #0f172a; }
    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .stats-table th, .stats-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    .stats-table th {
      background: #f1f5f9;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
    }
    .total-box {
      background: #ecfdf5;
      border: 2px solid #059669;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 14px;
      font-weight: 800;
      color: #065f46;
    }
    .total-amount {
      font-size: 24px;
      font-weight: 900;
      color: #064e3b;
      font-family: monospace;
    }
    .daily-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11px;
    }
    .daily-table th, .daily-table td {
      border: 1px solid #e2e8f0;
      padding: 5px 8px;
      text-align: left;
    }
    .daily-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
    }
    .daily-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px dashed #94a3b8;
      text-align: center;
    }
    .sig-line {
      border-top: 1px solid #475569;
      margin-top: 40px;
      padding-top: 6px;
      font-weight: 700;
      font-size: 11px;
      color: #334155;
    }
    .footer-note {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; background: #fff; }
      .slip-container { border: 1px solid #000; box-shadow: none; margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Print / Save Toolbar (Hidden on paper print) -->
  <div class="no-print" style="background: #0f172a; color: #ffffff; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-bottom: 3px solid #f59e0b;">
    <div>
      <div style="font-weight: 900; font-size: 14px; color: #f8fafc;">📄 OFFICIAL SALARY SLIP • ${monthName.toUpperCase()} ${year}</div>
      <div style="font-size: 11px; color: #94a3b8;">Select <strong>"Save as PDF"</strong> or choose your printer in destination.</div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #f59e0b; color: #0f172a; font-size: 13px; font-weight: 900; padding: 9px 18px; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
        🖨️ PRINT / SAVE AS PDF
      </button>
    </div>
  </div>

  <div class="slip-container">
    <div class="header">
      <div>
        <div class="company-title">${settings.companyName || 'ATTENDANCE NOTEBOOK PRO'}</div>
        <div class="sub-title">Department: ${settings.department || 'Operations'}</div>
      </div>
      <div class="slip-badge">
        SALARY SLIP & ATTENDANCE STATEMENT<br>
        <span style="font-size: 13px; font-weight: 900; color: #fbbf24;">${monthName.toUpperCase()} ${year}</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-card">
        <h4>Employee Information</h4>
        <div class="info-row"><span class="info-label">Employee Name:</span><span class="info-value">${settings.employeeName}</span></div>
        <div class="info-row"><span class="info-label">Employee ID:</span><span class="info-value">${settings.employeeId}</span></div>
        <div class="info-row"><span class="info-label">Shift Hours:</span><span class="info-value">${settings.shiftStart} - ${settings.shiftEnd}</span></div>
      </div>

      <div class="info-card">
        <h4>Wage & Rate Standards</h4>
        <div class="info-row"><span class="info-label">Daily Wage Rate:</span><span class="info-value">₹${settings.dailyWage.toLocaleString('en-IN')} / day</span></div>
        <div class="info-row"><span class="info-label">Overtime Rate:</span><span class="info-value">₹${settings.hourlyOt.toLocaleString('en-IN')} / hr</span></div>
        <div class="info-row"><span class="info-label">Generated On:</span><span class="info-value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
      </div>
    </div>

    <table class="stats-table">
      <thead>
        <tr>
          <th>Work Days</th>
          <th>Half Days</th>
          <th>Total OT Hours</th>
          <th>Holidays</th>
          <th>Sick Leaves</th>
          <th>Other Leaves</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${workDays}</strong> days</td>
          <td><strong>${halfDays}</strong> days</td>
          <td><strong>${totalOtHours}</strong> hrs</td>
          <td><strong>${holidays}</strong> days</td>
          <td><strong>${sickDays}</strong> days</td>
          <td><strong>${emergencyDays + vacationDays}</strong> days</td>
        </tr>
      </tbody>
    </table>

    <table class="stats-table" style="margin-bottom: 16px;">
      <thead>
        <tr>
          <th>Earnings Component</th>
          <th>Units / Basis</th>
          <th>Rate</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Base Duty Wages</td>
          <td>${workDays} full days</td>
          <td>₹${settings.dailyWage}</td>
          <td style="text-align: right; font-weight: 700;">₹${baseSalary.toLocaleString('en-IN')}</td>
        </tr>
        ${halfDays > 0 ? `<tr>
          <td>Half Duty Wages</td>
          <td>${halfDays} half days</td>
          <td>₹${settings.dailyWage / 2}</td>
          <td style="text-align: right; font-weight: 700;">₹${halfDaySalary.toLocaleString('en-IN')}</td>
        </tr>` : ''}
        <tr>
          <td>Overtime Compensation</td>
          <td>${totalOtHours} hours</td>
          <td>₹${settings.hourlyOt}/hr</td>
          <td style="text-align: right; font-weight: 700;">₹${otSalary.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div>
        <div class="total-label">TOTAL NET PAYABLE</div>
        <div style="font-size: 11px; color: #047857;">For period ${monthName} 1, ${year} to ${monthName} ${sortedRecords.length > 0 ? '30/31' : ''}, ${year}</div>
      </div>
      <div class="total-amount">₹${totalNetSalary.toLocaleString('en-IN')}</div>
    </div>

    ${sortedRecords.length > 0 ? `
    <h4 style="font-size: 11px; text-transform: uppercase; color: #334155; margin: 16px 0 6px 0;">Itemized Daily Duty Log (${sortedRecords.length} recorded dates)</h4>
    <table class="daily-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Status</th>
          <th>In Time</th>
          <th>Out Time</th>
          <th>OT</th>
          <th>Notes / Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${sortedRecords.map(r => `
          <tr>
            <td><strong>${r.date}</strong></td>
            <td>${r.status.replace('_', ' ').toUpperCase()}</td>
            <td>${r.inTime || '-'}</td>
            <td>${r.outTime || '-'}</td>
            <td>${r.overtimeHours ? `+${r.overtimeHours}h` : '-'}</td>
            <td>${r.note || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="signatures">
      <div><div class="sig-line">Prepared By (Supervisor)</div></div>
      <div><div class="sig-line">Employee Signature</div></div>
      <div><div class="sig-line">Authorized Signatory / HR</div></div>
    </div>

    <div class="footer-note">
      Generated automatically by Attendance Notebook Pro • System Verified Document
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 500);
    };
  </script>
</body>
</html>`;
  };

  // 1. Direct Print Execution with guaranteed Android & Web compatibility
  const handlePrint = async () => {
    setActiveTab('slip');
    const slipHtml = generateSlipHtml();
    const jobName = `Salary_Slip_${settings.employeeName.replace(/\s+/g, '_')}_${monthName}_${year}`;

    setPrintStatus('Opening Print / PDF...');
    const res = await printOrSaveSlip({
      jobName,
      htmlContent: slipHtml,
    });
    setPrintStatus(res.message);
    setTimeout(() => setPrintStatus(null), 5000);
  };

  // 2. Direct Download Printable Slip (PDF / HTML)
  const handleDownloadSlipHtml = async () => {
    const slipHtml = generateSlipHtml();
    const filename = `Salary_Slip_${settings.employeeName.replace(/\s+/g, '_')}_${monthName}_${year}.html`;
    setPrintStatus('Preparing Salary Slip file...');
    const res = await exportAndSaveFile({
      filename,
      content: slipHtml,
      mimeType: 'text/html',
      title: `Salary Slip - ${settings.employeeName} (${monthName} ${year})`,
      dialogTitle: 'Save or Share Salary Slip',
    });
    setPrintStatus(res.message);
    setTimeout(() => setPrintStatus(null), 5000);
  };

  // 3. Open in New Tab for Printing
  const handleOpenInNewTab = () => {
    handlePrint();
  };

  // 4. Export CSV / Excel
  const handleExportCSV = async () => {
    const headers = [
      'Date',
      'Status',
      'In Time',
      'Out Time',
      'OT Hours',
      'Day Wage (INR)',
      'Notes/Remarks',
    ];

    const rows = sortedRecords.map((r) => {
      let wage = 0;
      if (r.status === 'work') wage = settings.dailyWage;
      else if (r.status === 'half_duty') wage = settings.dailyWage / 2;
      wage += (r.overtimeHours || 0) * settings.hourlyOt;

      return [
        r.date,
        r.status.toUpperCase(),
        r.inTime || '',
        r.outTime || '',
        r.overtimeHours || 0,
        wage,
        `"${(r.note || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      `HR ATTENDANCE & SALARY REPORT - ${monthName.toUpperCase()} ${year}\n` +
      `Employee: ${settings.employeeName} (${settings.employeeId})\n` +
      `Company: ${settings.companyName} | Dept: ${settings.department}\n` +
      `Daily Wage: Rs. ${settings.dailyWage} | OT Rate: Rs. ${settings.hourlyOt}/hr\n` +
      `Total Work Days: ${workDays} | Total OT Hours: ${totalOtHours} | Total Net Salary: Rs. ${totalNetSalary}\n\n` +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const filename = `Attendance_Report_${settings.employeeId || 'Staff'}_${monthName}_${year}.csv`;
    setPrintStatus('Exporting Excel / CSV...');
    const res = await exportAndSaveFile({
      filename,
      content: csvContent,
      mimeType: 'text/csv',
      title: `Attendance Report - ${monthName} ${year}`,
      dialogTitle: 'Save or Open Excel Report',
    });
    setPrintStatus(res.message);
    setTimeout(() => setPrintStatus(null), 5000);
  };

  // 4. WhatsApp Share
  const handleShareWhatsApp = () => {
    const text =
      `*SALARY SLIP - ${monthName.toUpperCase()} ${year}*\n` +
      `*Employee:* ${settings.employeeName} (${settings.employeeId})\n` +
      `*Company:* ${settings.companyName}\n` +
      `---------------------------\n` +
      `• Work Days: ${workDays} (₹${baseSalary})\n` +
      (halfDays > 0 ? `• Half Days: ${halfDays} (₹${halfDaySalary})\n` : '') +
      `• Overtime: ${totalOtHours} hrs (₹${otSalary})\n` +
      `• Leaves: ${totalLeaves} days\n` +
      `---------------------------\n` +
      `*TOTAL NET SALARY: ₹${totalNetSalary.toLocaleString('en-IN')}*\n` +
      `_Generated by Attendance Notebook Pro_`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 5. Copy Text Breakdown
  const handleCopySummary = () => {
    const text =
      `SALARY SLIP - ${monthName.toUpperCase()} ${year}\n` +
      `Employee: ${settings.employeeName} (${settings.employeeId})\n` +
      `Company: ${settings.companyName} | Dept: ${settings.department}\n` +
      `Work Days: ${workDays} x ₹${settings.dailyWage} = ₹${baseSalary}\n` +
      (halfDays > 0 ? `Half Days: ${halfDays} x ₹${settings.dailyWage / 2} = ₹${halfDaySalary}\n` : '') +
      `Overtime: ${totalOtHours} hrs x ₹${settings.hourlyOt} = ₹${otSalary}\n` +
      `TOTAL PAYABLE: ₹${totalNetSalary.toLocaleString('en-IN')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#fffdfa] rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                {monthName} {year} • Salary Slip & Report
              </h2>
              <p className="text-[10px] text-amber-300 font-semibold">
                {settings.employeeName} ({settings.employeeId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Switcher Tabs */}
            <div className="flex bg-slate-900/80 p-0.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                  activeTab === 'summary'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('slip')}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'slip'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Paper Slip</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Status Toast Message */}
        {printStatus && (
          <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
            <span>{printStatus}</span>
            <button
              onClick={() => setPrintStatus(null)}
              className="text-amber-800 hover:text-amber-950 text-xs ml-2 font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'summary' ? (
            /* Summary View */
            <div className="space-y-4">
              {/* Employee & Company Header Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                      Company & Employee
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {settings.companyName || 'ATTENDANCE NOTEBOOK PRO'}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Dept: {settings.department || 'Operations'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium">Period:</span>
                    <div className="text-xs sm:text-sm font-black text-amber-300">
                      {monthName} {year}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Daily: ₹{settings.dailyWage} | OT: ₹{settings.hourlyOt}/h
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Total Highlight Box */}
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                      Total Net Salary:
                    </span>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      Base wages + overtime compensation
                    </div>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
                    ₹{totalNetSalary.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span>
                      Basic Work Days ({workDays} × ₹{settings.dailyWage}):
                    </span>
                    <span className="font-bold">
                      ₹{baseSalary.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {halfDays > 0 && (
                    <div className="flex items-center justify-between">
                      <span>
                        Half Days ({halfDays} × ₹{settings.dailyWage / 2}):
                      </span>
                      <span className="font-bold">
                        ₹{halfDaySalary.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>
                      Overtime ({totalOtHours} hrs × ₹{settings.hourlyOt}/hr):
                    </span>
                    <span className="font-bold text-emerald-700">
                      + ₹{otSalary.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Duty Statistics Matrix */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Monthly Duty Count:
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-2xl">
                    <div className="text-xl font-black text-blue-900">{workDays}</div>
                    <div className="text-[10px] text-blue-700 font-bold">Work Days</div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
                    <div className="text-xl font-black text-emerald-900">{totalOtHours}h</div>
                    <div className="text-[10px] text-emerald-700 font-bold">Total OT</div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-2xl">
                    <div className="text-xl font-black text-purple-900">{halfDays}</div>
                    <div className="text-[10px] text-purple-700 font-bold">Half Days</div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl">
                    <div className="text-xl font-black text-amber-900">{holidays}</div>
                    <div className="text-[10px] text-amber-700 font-bold">Holidays</div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl">
                    <div className="text-xl font-black text-rose-900">{sickDays}</div>
                    <div className="text-[10px] text-rose-700 font-bold">Sick Leaves</div>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-200 p-2.5 rounded-2xl">
                    <div className="text-xl font-black text-cyan-900">{vacationDays + emergencyDays}</div>
                    <div className="text-[10px] text-cyan-700 font-bold">Other Leaves</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Paper Slip View - Clean & Compact */
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-white border-2 border-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-sm text-slate-900 text-xs font-sans">
                {/* Paper Header */}
                <div className="border-b-2 border-slate-900 pb-2.5 mb-2.5 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase leading-tight">
                      {settings.companyName || 'ATTENDANCE NOTEBOOK PRO'}
                    </h3>
                    <p className="text-[10px] text-slate-600">Department: {settings.department || 'Operations'}</p>
                  </div>
                  <div className="bg-slate-950 text-white px-2 py-0.5 rounded text-right">
                    <div className="text-[8px] font-bold tracking-wide">SALARY SLIP</div>
                    <div className="text-[11px] font-black text-amber-300">{monthName.toUpperCase()} {year}</div>
                  </div>
                </div>

                {/* Employee Info Box */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-300 p-2 rounded-xl mb-2.5 text-[10px]">
                  <div>
                    <div><strong>Name:</strong> {settings.employeeName}</div>
                    <div><strong>ID:</strong> {settings.employeeId}</div>
                  </div>
                  <div>
                    <div><strong>Daily Wage:</strong> ₹{settings.dailyWage}</div>
                    <div><strong>OT Rate:</strong> ₹{settings.hourlyOt}/hr</div>
                  </div>
                </div>

                {/* Table Summary */}
                <div className="border border-slate-300 rounded-xl mb-2.5 overflow-hidden text-[10px]">
                  <div className="grid grid-cols-4 bg-slate-100 font-bold p-1 border-b border-slate-300 text-center">
                    <div>Work Days</div>
                    <div>Half Days</div>
                    <div>OT Hours</div>
                    <div>Leaves</div>
                  </div>
                  <div className="grid grid-cols-4 p-1 text-center font-black">
                    <div>{workDays}</div>
                    <div>{halfDays}</div>
                    <div>{totalOtHours}h</div>
                    <div>{totalLeaves}</div>
                  </div>
                </div>

                {/* Net Payable Box */}
                <div className="bg-emerald-50 border-2 border-emerald-600 p-2 rounded-xl mb-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-black text-emerald-950">TOTAL NET PAYABLE:</div>
                    <div className="text-[9px] text-emerald-700">Wage + Overtime Total</div>
                  </div>
                  <div className="text-lg font-black text-emerald-950 font-mono">
                    ₹{totalNetSalary.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-2 text-center text-[9px] mt-4 pt-2 border-t border-dashed border-slate-400">
                  <div className="border-t border-slate-700 pt-0.5 font-bold">Supervisor</div>
                  <div className="border-t border-slate-700 pt-0.5 font-bold">Employee</div>
                  <div className="border-t border-slate-700 pt-0.5 font-bold">Authorized Sign</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center shrink-0">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all border border-amber-400"
            title="Print Salary Slip directly"
          >
            <Printer className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Print & PDF Options Modal Dialog */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border-2 border-indigo-950 space-y-3.5 text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-950">
                    Print / Save Salary Slip
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold">
                    {monthName} {year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clear explanation of why iframe may suppress dialog */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-950 flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <span className="leading-snug">
                Browser preview mein direct print dialog block ho sakta hai. Niche diye gaye <strong>"Open in New Tab"</strong> ya <strong>"Save / Download File"</strong> se 100% print ho jayega:
              </span>
            </div>

            <div className="space-y-2">
              {/* Option 1: Open in New Tab */}
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  handleOpenInNewTab();
                }}
                className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold active:scale-98 transition-all flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black truncate">1. Open in New Tab (Best)</div>
                    <div className="text-[10px] text-blue-100 font-normal truncate">
                      Full page khulega aur print dialog turant aayega
                    </div>
                  </div>
                </div>
                <span className="text-[11px] bg-white text-blue-900 font-black px-2 py-0.5 rounded-full shrink-0">
                  Print
                </span>
              </button>

              {/* Option 2: Download File */}
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  handleDownloadSlipHtml();
                }}
                className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold active:scale-98 transition-all flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black truncate">2. Download Slip (Save PDF)</div>
                    <div className="text-[10px] text-emerald-100 font-normal truncate">
                      A4 Slip file download karein, kabhi bhi print karein
                    </div>
                  </div>
                </div>
                <span className="text-[11px] bg-white text-emerald-900 font-black px-2 py-0.5 rounded-full shrink-0">
                  Download
                </span>
              </button>

              {/* Option 3: WhatsApp */}
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  handleShareWhatsApp();
                }}
                className="w-full text-left p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold active:scale-98 transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">3. WhatsApp Par Bhejein</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">
                      Employee ya contractor ko salary details send karein
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                  Share
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowPrintModal(false)}
              className="w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs text-center transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
