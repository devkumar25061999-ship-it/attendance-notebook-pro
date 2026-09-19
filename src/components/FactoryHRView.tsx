import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Phone, IndianRupee, Trash2, Calendar, FileText, X, Check, CheckCircle, Award, Briefcase, ChevronRight, ChevronLeft, Printer, Percent, Building2, Camera, RefreshCw, Upload, Sparkles, AlertCircle, Clock, Moon, Sun, Zap, CalendarDays } from 'lucide-react';
import { Worker } from './FactoryHRModal';
import { Language, translations } from '../utils/translations';
import { printOrSaveSlip } from '../utils/fileExport';

export interface DailyDutyRecord {
  status: 'P' | 'HD' | 'A';
  otHours: number;
  shift: 'Day' | 'Night' | 'General';
  inTime?: string;
  outTime?: string;
  note?: string;
  punchPhoto?: string;
}

interface FactoryHRViewProps {
  defaultHourlyOt: number;
  lang?: Language;
}

const STORAGE_KEY_WORKERS = 'attendance_factory_workers_v4';
const STORAGE_KEY_DAILY_DUTIES = 'factory_daily_duties_v2';

export const FactoryHRView: React.FC<FactoryHRViewProps> = ({ defaultHourlyOt, lang = 'en' }) => {
  const t = translations[lang];

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'daily' | 'list' | 'add' | 'payroll'>('daily');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // Daily Duty & Muster Roll State
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [printModalHtml, setPrintModalHtml] = useState<string | null>(null);
  const [printModalTitle, setPrintModalTitle] = useState<string>('Print Preview');

  const [dailyDuties, setDailyDuties] = useState<Record<string, Record<string, DailyDutyRecord>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY_DUTIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [dailyToast, setDailyToast] = useState<string | null>(null);

  const showDailyToast = (msg: string) => {
    setDailyToast(msg);
    setTimeout(() => setDailyToast(null), 2500);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAILY_DUTIES, JSON.stringify(dailyDuties));
    } catch (e) {
      console.error(e);
    }
  }, [dailyDuties]);

  // Company & License Details
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('factory_company_name') || 'SHREE BALAJI INDUSTRIES & FACTORY');
  const [gstNumber, setGstNumber] = useState(() => localStorage.getItem('factory_gst') || '07AABCS1429B1Z8');
  const [licenseNumber, setLicenseNumber] = useState(() => localStorage.getItem('factory_license') || 'LIC-FAC-2026-9912');
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  // Face Punch Modal State for Workers
  const [punchingWorker, setPunchingWorker] = useState<Worker | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [currentTime, setCurrentTime] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Worker Form state (with Basic + HRA breakdown)
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Operator / Worker');
  const [newMonthlyGross, setNewMonthlyGross] = useState('20000');
  const [newBasicSalary, setNewBasicSalary] = useState('15000');
  const [newHraAmount, setNewHraAmount] = useState('5000');
  const [newPfPercent, setNewPfPercent] = useState('12');
  const [newEsiPercent, setNewEsiPercent] = useState('0.75');
  const [newOtRate, setNewOtRate] = useState(String(defaultHourlyOt || 60));
  const [newAdvance, setNewAdvance] = useState('0');
  const [newPresentDays, setNewPresentDays] = useState('26');

  // Helpers for synchronizing Gross = Basic + HRA
  const handleGrossChange = (val: string) => {
    setNewMonthlyGross(val);
    const g = Number(val) || 0;
    const autoBasic = Math.round(g * 0.75); // e.g. 15,000 out of 20,000
    setNewBasicSalary(String(autoBasic));
    setNewHraAmount(String(Math.max(0, g - autoBasic)));
  };

  const handleBasicChange = (val: string) => {
    setNewBasicSalary(val);
    const b = Number(val) || 0;
    const g = Number(newMonthlyGross) || 0;
    if (g >= b) {
      setNewHraAmount(String(g - b));
    } else {
      const h = Number(newHraAmount) || 0;
      setNewMonthlyGross(String(b + h));
    }
  };

  const handleHraChange = (val: string) => {
    setNewHraAmount(val);
    const h = Number(val) || 0;
    const b = Number(newBasicSalary) || 0;
    setNewMonthlyGross(String(b + h));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers));
    } catch (e) {
      console.error(e);
    }
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('factory_company_name', companyName);
    localStorage.setItem('factory_gst', gstNumber);
    localStorage.setItem('factory_license', licenseNumber);
  }, [companyName, gstNumber, licenseNumber]);

  // Time ticker for Face Punch
  useEffect(() => {
    if (!punchingWorker) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [punchingWorker]);

  // Start Camera Stream for Face Punch
  const startCamera = async (facing: 'user' | 'environment') => {
    try {
      setCameraLoading(true);
      setCameraError(null);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this device/browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      console.warn('Live camera stream error:', err);
      setCameraActive(false);
      setCameraLoading(false);
      setCameraError('Live camera stream blocked or unsupported. Use file upload below.');
    }
  };

  useEffect(() => {
    if (!punchingWorker) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCameraActive(false);
      setCameraError(null);
      setCapturedPhoto(null);
      return;
    }

    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [punchingWorker, facingMode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => setCameraActive(true))
        .catch((err) => console.warn('Video play caught:', err));
    }
  }, [stream]);

  const handleCaptureStream = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 480;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);

        if (facingMode === 'user') {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        const nowStr = new Date().toLocaleDateString('en-IN');
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, height - 44, width, 44);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`PUNCH: ${nowStr} ${currentTime}`, 16, height - 18);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setCameraActive(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedPhoto(result);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setCameraActive(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFacePunch = () => {
    if (!punchingWorker || !capturedPhoto) return;
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
    
    setWorkers(
      workers.map((w) => {
        if (w.id === punchingWorker.id) {
          const updated = {
            ...w,
            facePunchPhoto: capturedPhoto,
            punchTime: nowTimeStr,
            presentDays: Number(w.presentDays || 0) + 1, // Auto increment present day on successful face punch
          };
          if (selectedWorker?.id === w.id) setSelectedWorker(updated);
          return updated;
        }
        return w;
      })
    );

    // Also update daily duty entry for today
    handleSetDailyDuty(punchingWorker.id, {
      status: 'P',
      inTime: nowTimeStr,
      punchPhoto: capturedPhoto,
    });

    alert(`✅ Face Punch Successful for ${punchingWorker.name} at ${nowTimeStr}! Present day updated.`);
    setPunchingWorker(null);
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const g = Number(newMonthlyGross) || 20000;
    const b = Number(newBasicSalary) || Math.round(g * 0.75);
    const h = Number(newHraAmount) || Math.max(0, g - b);

    const worker: Worker = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim() || 'N/A',
      role: newRole.trim() || 'Worker',
      monthlyGross: g,
      basicSalary: b,
      hraAmount: h,
      totalDaysInMonth: 26,
      presentDays: Number(newPresentDays) || 26,
      overtimeHours: 0,
      hourlyOtRate: Number(newOtRate) || 60,
      pfPercent: Number(newPfPercent) || 12,
      esiPercent: Number(newEsiPercent) || 0.75,
      advanceGiven: Number(newAdvance) || 0,
      notes: '',
    };

    setWorkers([...workers, worker]);
    setNewName('');
    setNewPhone('');
    setNewMonthlyGross('20000');
    setNewBasicSalary('15000');
    setNewHraAmount('5000');
    setNewAdvance('0');
    setActiveTab('list');
  };

  const handleDeleteWorker = (id: string) => {
    if (window.confirm(lang === 'hi' ? 'क्या आप इस वर्कर को हटाना चाहते हैं?' : 'Are you sure you want to delete this worker permanently?')) {
      setWorkers(workers.filter((w) => w.id !== id));
      if (selectedWorker?.id === id) setSelectedWorker(null);
    }
  };

  const handleUpdateWorkerStats = (id: string, field: keyof Worker, value: number | string) => {
    setWorkers(
      workers.map((w) => {
        if (w.id === id) {
          let updated = { ...w, [field]: value };
          // If gross is changed, proportionally update basic/hra
          if (field === 'monthlyGross') {
            const newG = Number(value) || 0;
            const newB = Math.round(newG * 0.75);
            updated.basicSalary = newB;
            updated.hraAmount = Math.max(0, newG - newB);
          } else if (field === 'basicSalary') {
            const newB = Number(value) || 0;
            const currentG = Number(w.monthlyGross) || 0;
            if (currentG >= newB) {
              updated.hraAmount = currentG - newB;
            } else {
              updated.monthlyGross = newB + (Number(w.hraAmount) || 0);
            }
          } else if (field === 'hraAmount') {
            const newH = Number(value) || 0;
            const currentB = Number(w.basicSalary) || 0;
            updated.monthlyGross = currentB + newH;
          }
          if (selectedWorker?.id === id) setSelectedWorker(updated);
          return updated;
        }
        return w;
      })
    );
  };

  const handleQuickMarkPresent = (w: Worker) => {
    const currentPresent = Number(w.presentDays) || 0;
    const totalDays = Number(w.totalDaysInMonth) || 26;
    const nextPresent = Math.min(totalDays, currentPresent + 1);
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
    setWorkers(
      workers.map((item) => {
        if (item.id === w.id) {
          const updated = {
            ...item,
            presentDays: nextPresent,
            punchTime: nowTimeStr,
          };
          if (selectedWorker?.id === item.id) setSelectedWorker(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleShiftDailyDate = (offsetDays: number) => {
    const d = new Date(selectedDailyDate + 'T00:00:00');
    d.setDate(d.getDate() + offsetDays);
    setSelectedDailyDate(d.toISOString().split('T')[0]);
  };

  const handleSetDailyDuty = (
    workerId: string,
    updates: Partial<DailyDutyRecord>
  ) => {
    setDailyDuties((prev) => {
      const dayMap = { ...(prev[selectedDailyDate] || {}) };
      const existing: DailyDutyRecord = dayMap[workerId] || {
        status: 'P',
        otHours: 0,
        shift: 'Day',
        inTime: '09:00 AM',
        outTime: '06:00 PM',
      };
      const updated: DailyDutyRecord = {
        ...existing,
        ...updates,
      };
      dayMap[workerId] = updated;
      const nextDuties = {
        ...prev,
        [selectedDailyDate]: dayMap,
      };

      // Auto-sync monthly totals for this worker
      const currentMonthStr = selectedDailyDate.substring(0, 7);
      let totalPresent = 0;
      let totalOt = 0;
      Object.entries(nextDuties).forEach(([dStr, wMap]) => {
        if (dStr.startsWith(currentMonthStr) && wMap[workerId]) {
          const r = wMap[workerId];
          if (r.status === 'P') totalPresent += 1;
          else if (r.status === 'HD') totalPresent += 0.5;
          totalOt += Number(r.otHours) || 0;
        }
      });

      if (totalPresent > 0 || totalOt > 0) {
        setWorkers((prevWorkers) =>
          prevWorkers.map((w) =>
            w.id === workerId
              ? {
                  ...w,
                  presentDays: totalPresent,
                  overtimeHours: totalOt,
                  punchTime: updated.inTime || w.punchTime,
                  facePunchPhoto: updated.punchPhoto || w.facePunchPhoto,
                }
              : w
          )
        );
      }

      return nextDuties;
    });
  };

  const handleMarkAllDailyDuty = (status: 'P' | 'HD' | 'A') => {
    if (workers.length === 0) return;
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
    setDailyDuties((prev) => {
      const dayMap = { ...(prev[selectedDailyDate] || {}) };
      workers.forEach((w) => {
        const existing = dayMap[w.id] || {
          status: 'P',
          otHours: 0,
          shift: 'Day',
          inTime: nowTimeStr,
          outTime: '06:00 PM',
        };
        dayMap[w.id] = {
          ...existing,
          status,
          inTime: status === 'A' ? '-' : (existing.inTime || nowTimeStr),
        };
      });
      const nextDuties = {
        ...prev,
        [selectedDailyDate]: dayMap,
      };

      // Sync all workers
      const currentMonthStr = selectedDailyDate.substring(0, 7);
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) => {
          let totalPresent = 0;
          let totalOt = 0;
          Object.entries(nextDuties).forEach(([dStr, wMap]) => {
            if (dStr.startsWith(currentMonthStr) && wMap[w.id]) {
              const r = wMap[w.id];
              if (r.status === 'P') totalPresent += 1;
              else if (r.status === 'HD') totalPresent += 0.5;
              totalOt += Number(r.otHours) || 0;
            }
          });
          return {
            ...w,
            presentDays: totalPresent > 0 ? totalPresent : (status === 'P' ? Number(w.totalDaysInMonth || 26) : (status === 'A' ? 0 : w.presentDays)),
            overtimeHours: totalOt > 0 ? totalOt : w.overtimeHours,
          };
        })
      );

      return nextDuties;
    });

    const statusName = status === 'P' ? (lang === 'hi' ? 'सबकी पूरी हाजिरी (P)' : 'All Present (P)') : status === 'HD' ? (lang === 'hi' ? 'सबकी हाफ ड्यूटी (HD)' : 'All Half Day (HD)') : (lang === 'hi' ? 'सबको गैरहाजिर (A)' : 'All Absent (A)');
    showDailyToast(`✅ ${statusName} सफलतापूर्वक दर्ज हुई!`);
  };

  const printHtmlContent = async (html: string, title: string = 'Document') => {
    await printOrSaveSlip({ jobName: title, htmlContent: html });
  };

  const handlePrintDailyMusterSheet = () => {
    const dayMap = dailyDuties[selectedDailyDate] || {};
    let pCount = 0;
    let hdCount = 0;
    let aCount = 0;
    let totalOt = 0;

    const rowsHtml = workers.map((w, idx) => {
      const duty = dayMap[w.id] || { status: 'P', otHours: 0, shift: 'Day', inTime: '09:00 AM', outTime: '06:00 PM' };
      if (duty.status === 'P') pCount++;
      else if (duty.status === 'HD') hdCount++;
      else aCount++;
      totalOt += Number(duty.otHours) || 0;

      const statusColor = duty.status === 'P' ? '#047857' : duty.status === 'HD' ? '#b45309' : '#b91c1c';
      const statusText = duty.status === 'P' ? 'PRESENT (P)' : duty.status === 'HD' ? 'HALF DAY (HD)' : 'ABSENT (A)';

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td><b>${w.name}</b><br/><small style="color: #475569;">${w.role} | 📞 ${w.phone}</small></td>
          <td style="text-align: center; font-weight: 900; color: ${statusColor};">${statusText}</td>
          <td style="text-align: center;">${duty.shift || 'Day'}</td>
          <td style="text-align: center;">${duty.inTime || '09:00 AM'}</td>
          <td style="text-align: center;">${duty.outTime || '06:00 PM'}</td>
          <td style="text-align: center; font-weight: bold; color: #7e22ce;">${duty.otHours ? duty.otHours + ' hrs' : '-'}</td>
          <td style="font-size: 10px; color: #334155;">${duty.note || '-'}</td>
          <td style="border: 1px dashed #94a3b8; height: 32px; width: 100px;"></td>
        </tr>
      `;
    }).join('');

    const formattedDate = new Date(selectedDailyDate + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Attendance Muster Roll - ${selectedDailyDate}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 900; }
    .header p { margin: 4px 0; font-size: 11px; color: #475569; font-weight: bold; }
    .date-badge { display: inline-block; background: #0f172a; color: white; padding: 4px 14px; border-radius: 6px; font-size: 13px; font-weight: 900; margin-top: 6px; }
    .stats-bar { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 8px; margin: 12px 0; font-size: 11px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #0f172a; color: white; font-weight: bold; }
    .signatures { display: flex; justify-content: space-between; margin-top: 45px; font-size: 11px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${companyName}</h1>
    <p>Factory License: <b>${licenseNumber}</b> | GSTIN: <b>${gstNumber}</b></p>
    <div class="date-badge">📅 DAILY MUSTER ROLL: ${formattedDate}</div>
  </div>

  <div class="stats-bar">
    <div>Total Workers: <b>${workers.length}</b></div>
    <div style="color: #047857;">Present: <b>${pCount}</b></div>
    <div style="color: #b45309;">Half Day: <b>${hdCount}</b></div>
    <div style="color: #b91c1c;">Absent: <b>${aCount}</b></div>
    <div style="color: #7e22ce;">Total OT: <b>${totalOt} Hours</b></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Worker Name & Role</th>
        <th>Attendance Status</th>
        <th>Shift</th>
        <th>Punch In</th>
        <th>Punch Out</th>
        <th>OT Hours</th>
        <th>Remarks</th>
        <th>Sign / Thumb</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="9" style="text-align:center;">No workers registered.</td></tr>'}
    </tbody>
  </table>

  <div class="signatures">
    <div>Shift Supervisor / Timekeeper: ___________________</div>
    <div>Factory HR / Plant Manager: ___________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    printHtmlContent(html);
  };

  const calculateWorkerSalary = (w: Worker) => {
    const totalDays = Number(w.totalDaysInMonth) || 26;
    const present = Number(w.presentDays) || 0;
    const gross = Number(w.monthlyGross) || 0;
    
    // Basic & HRA Breakdown
    let basic = Number(w.basicSalary);
    let hra = Number(w.hraAmount);

    if (!basic || basic <= 0) {
      basic = Math.round(gross * 0.75);
      hra = gross - basic;
    } else if (hra === undefined || isNaN(hra)) {
      hra = Math.max(0, gross - basic);
    }

    // Earned proportions based on attendance
    const earnedBasic = totalDays > 0 ? (basic / totalDays) * present : basic;
    const earnedHra = totalDays > 0 ? (hra / totalDays) * present : hra;
    const earnedGross = earnedBasic + earnedHra;
    
    const otAmount = (Number(w.overtimeHours) || 0) * (Number(w.hourlyOtRate) || 60);
    const totalEarnings = earnedGross + otAmount;

    // Legal Compliance: PF is calculated strictly on Basic Salary
    const pfDeduction = Math.round(earnedBasic * ((Number(w.pfPercent) || 0) / 100));
    // ESI is calculated on Total Earnings
    const esiDeduction = Math.round(totalEarnings * ((Number(w.esiPercent) || 0) / 100));
    const advance = Number(w.advanceGiven) || 0;

    const totalDeductions = pfDeduction + esiDeduction + advance;
    const netSalary = Math.round(totalEarnings - totalDeductions);

    return {
      basic: Math.round(basic),
      hra: Math.round(hra),
      earnedBasic: Math.round(earnedBasic),
      earnedHra: Math.round(earnedHra),
      earnedGross: Math.round(earnedGross),
      otAmount,
      totalEarnings: Math.round(totalEarnings),
      pfDeduction,
      esiDeduction,
      advance,
      totalDeductions,
      netSalary,
    };
  };

  const totalFactoryPayroll = workers.reduce((acc, w) => acc + calculateWorkerSalary(w).netSalary, 0);

  const handlePrintSlip = (w: Worker) => {
    setSelectedWorker(w);
    const s = calculateWorkerSalary(w);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Salary Slip - ${w.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; max-width: 650px; margin: 0 auto; }
    .company-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .company-header h1 { margin: 0; font-size: 18px; font-weight: 900; }
    .company-header p { margin: 3px 0; font-size: 11px; color: #475569; font-weight: bold; }
    h2 { text-align: center; font-size: 15px; margin: 10px 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .table-section { margin-bottom: 15px; }
    .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; border-bottom: 1px dotted #cbd5e1; padding-bottom: 4px; }
    .bold { font-weight: bold; }
    .total { font-size: 16px; font-weight: 900; margin-top: 18px; border-top: 2px solid #0f172a; padding-top: 10px; display: flex; justify-content: space-between; color: #047857; }
    .sign { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; font-weight: bold; }
    .compliance-tag { font-size: 10px; color: #64748b; font-style: italic; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="company-header">
    <h1>${companyName}</h1>
    <p>Factory License No: <b>${licenseNumber}</b> | GSTIN: <b>${gstNumber}</b></p>
  </div>
  <h2>Monthly Salary Slip & Wage Register</h2>
  
  <div class="table-section">
    <div class="section-title">Employee Information</div>
    <div class="row"><span class="bold">Worker Name:</span> <span>${w.name}</span></div>
    <div class="row"><span class="bold">Role / Designation:</span> <span>${w.role}</span></div>
    <div class="row"><span class="bold">Phone Number:</span> <span>${w.phone}</span></div>
    <div class="row"><span class="bold">Attendance Days:</span> <span>${w.presentDays} / ${w.totalDaysInMonth} Days Worked</span></div>
  </div>

  <div class="table-section">
    <div class="section-title">Earnings Breakdown (Basic + HRA + OT)</div>
    <div class="row">
      <span class="bold">Basic Salary (Fixed: ₹${s.basic.toLocaleString('en-IN')}):</span>
      <span><b>₹${s.earnedBasic.toLocaleString('en-IN')}</b></span>
    </div>
    <div class="row">
      <span class="bold">House Rent Allowance - HRA (Fixed: ₹${s.hra.toLocaleString('en-IN')}):</span>
      <span><b>₹${s.earnedHra.toLocaleString('en-IN')}</b></span>
    </div>
    <div class="row">
      <span class="bold">Earned Gross Wages (Basic + HRA):</span>
      <span>₹${s.earnedGross.toLocaleString('en-IN')}</span>
    </div>
    <div class="row">
      <span class="bold">Overtime (${w.overtimeHours} hrs @ ₹${w.hourlyOtRate}/hr):</span>
      <span>₹${s.otAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="row" style="background:#f8fafc; padding: 4px 6px; border-radius: 4px;">
      <span class="bold">Total Gross Earnings:</span>
      <span class="bold" style="color:#0f172a;">₹${s.totalEarnings.toLocaleString('en-IN')}</span>
    </div>
  </div>

  <div class="table-section">
    <div class="section-title">Statutory Deductions & Advance</div>
    <div class="row">
      <span class="bold">Provident Fund / PF (${w.pfPercent}% on Basic ₹${s.earnedBasic.toLocaleString('en-IN')}):</span>
      <span style="color:#b91c1c; font-weight:bold;">-₹${s.pfDeduction.toLocaleString('en-IN')}</span>
    </div>
    <div class="row">
      <span class="bold">Employee State Insurance / ESI (${w.esiPercent}% on Earnings):</span>
      <span style="color:#b91c1c; font-weight:bold;">-₹${s.esiDeduction.toLocaleString('en-IN')}</span>
    </div>
    <div class="row">
      <span class="bold">Advance / Cash Deductions:</span>
      <span style="color:#b91c1c; font-weight:bold;">-₹${s.advance.toLocaleString('en-IN')}</span>
    </div>
    <div class="row" style="background:#fff1f2; padding: 4px 6px; border-radius: 4px;">
      <span class="bold" style="color:#9f1239;">Total Deductions:</span>
      <span class="bold" style="color:#9f1239;">-₹${s.totalDeductions.toLocaleString('en-IN')}</span>
    </div>
  </div>

  <div class="total">
    <span>Final Net Payable Salary:</span>
    <span>₹${s.netSalary.toLocaleString('en-IN')}</span>
  </div>

  <div class="compliance-tag">
    * Note: PF (12%/13%) is calculated strictly on Basic Salary as per EPFO wage guidelines. HRA is exempted from PF deduction.
  </div>

  <div class="sign">
    <div>Worker Signature / Thumb: ___________________</div>
    <div>Authorized Signatory: ___________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;
    printHtmlContent(html);
  };

  const handlePrintFullPayrollSheet = () => {
    const rowsHtml = workers.map((w, idx) => {
      const s = calculateWorkerSalary(w);
      return `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${w.name}</b><br/><small>${w.role} | 📞 ${w.phone}</small></td>
          <td>₹${s.basic.toLocaleString('en-IN')}</td>
          <td>₹${s.hra.toLocaleString('en-IN')}</td>
          <td>₹${w.monthlyGross.toLocaleString('en-IN')}</td>
          <td>${w.presentDays}/${w.totalDaysInMonth}</td>
          <td>₹${s.earnedGross.toLocaleString('en-IN')}</td>
          <td>${w.overtimeHours}h (₹${s.otAmount})</td>
          <td>-₹${s.pfDeduction}</td>
          <td>-₹${s.esiDeduction}</td>
          <td>-₹${s.advance}</td>
          <td><b>₹${s.netSalary.toLocaleString('en-IN')}</b></td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Factory Master Roll & Complete Wage Register</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 900; }
    .header p { margin: 4px 0; font-size: 11px; color: #475569; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10.5px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; }
    th { background: #0f172a; color: white; font-weight: bold; }
    .total-box { margin-top: 18px; text-align: right; font-size: 15px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 10px; color: #047857; }
    .signatures { display: flex; justify-content: space-between; margin-top: 45px; font-size: 11px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${companyName}</h1>
    <p>Factory License No: <b>${licenseNumber}</b> | GSTIN: <b>${gstNumber}</b></p>
    <p style="text-transform: uppercase; font-size: 13px; margin-top: 6px; color: #0f172a; font-weight:900;">Monthly Master Roll & Worker Wage Register (Basic + HRA Compliant)</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Worker Name & Role</th>
        <th>Basic (₹)</th>
        <th>HRA (₹)</th>
        <th>Gross (₹)</th>
        <th>Duty</th>
        <th>Earned (₹)</th>
        <th>OT (₹)</th>
        <th>PF Ded.</th>
        <th>ESI Ded.</th>
        <th>Advance</th>
        <th>Net Payout (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="12" style="text-align:center;">No workers added yet.</td></tr>'}
    </tbody>
  </table>

  <div class="total-box">
    Total Factory Net Wage Payout: ₹${totalFactoryPayroll.toLocaleString('en-IN')}
  </div>

  <div class="signatures">
    <div>Prepared By (HR Manager): ___________________</div>
    <div>Factory Authorized Signatory / Owner: ___________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    printHtmlContent(html);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto my-1 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative">
      {/* Company Details Bar */}
      <div className="bg-[#1F2937] text-white px-3 py-2 flex items-center justify-between border-b border-gray-700 shrink-0 text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span className="font-black truncate">{companyName}</span>
        </div>
        <button
          onClick={() => setShowCompanySettings(!showCompanySettings)}
          className="text-[10px] bg-gray-700 hover:bg-gray-600 text-white font-bold px-2 py-1 rounded-lg border border-gray-600 shrink-0"
        >
          {showCompanySettings ? 'Close Details' : '🏢 Company / GST'}
        </button>
      </div>

      {/* Collapsible Company Details Edit Form */}
      {showCompanySettings && (
        <div className="bg-gray-50 p-3 border-b border-gray-200 space-y-2 text-xs shrink-0">
          <h4 className="font-black text-[#1F2937] uppercase text-[11px]">Edit Company & License Details (For Print Slips)</h4>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Company / Factory Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-bold text-[#1F2937] text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Factory License No.</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-bold text-[#1F2937] text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-bold text-[#1F2937] text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 bg-[#F3F4F6] p-1 border-b border-gray-200 shrink-0 text-xs font-bold gap-1">
        <button
          onClick={() => { setActiveTab('daily'); setSelectedWorker(null); }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'daily' && !selectedWorker ? 'bg-white text-[#16A34A] font-black shadow-xs' : 'text-gray-600 hover:text-[#1F2937]'}`}
        >
          <span>📋</span>
          <span className="truncate">{t.dailyMuster}</span>
        </button>
        <button
          onClick={() => { setActiveTab('list'); setSelectedWorker(null); }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'list' && !selectedWorker ? 'bg-white text-[#16A34A] font-black shadow-xs' : 'text-gray-600 hover:text-[#1F2937]'}`}
        >
          <span>👥</span>
          <span className="truncate">{t.workerList} ({workers.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('payroll'); setSelectedWorker(null); }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'payroll' ? 'bg-white text-[#16A34A] font-black shadow-xs' : 'text-gray-600 hover:text-[#1F2937]'}`}
        >
          <span>💰</span>
          <span className="truncate">{t.payrollRegister}</span>
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'add' ? 'bg-white text-[#16A34A] font-black shadow-xs' : 'text-gray-600 hover:text-[#1F2937]'}`}
        >
          <span>+</span>
          <span className="truncate">{t.addWorker}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 app-scrollable">
        {selectedWorker ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2.5">
                {selectedWorker.facePunchPhoto ? (
                  <img src={selectedWorker.facePunchPhoto} alt="Punch" className="w-10 h-10 rounded-full object-cover border-2 border-[#16A34A] shadow-xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
                    {selectedWorker.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-[#1F2937]">{selectedWorker.name}</h3>
                  <p className="text-[10px] text-gray-500 font-bold">{selectedWorker.role} • {selectedWorker.punchTime ? `Punch: ${selectedWorker.punchTime}` : (lang === 'hi' ? 'आज कोई पंच नहीं' : 'No Punch Today')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPunchingWorker(selectedWorker)}
                  className="flex items-center gap-1 bg-[#16A34A] hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow-xs"
                  title="Face Punch Biometric"
                >
                  <Camera className="w-3.5 h-3.5" /> {lang === 'hi' ? 'फेस हाजिरी' : 'Punch'}
                </button>
                <button
                  onClick={() => handlePrintSlip(selectedWorker)}
                  className="flex items-center gap-1 bg-[#1F2937] hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> {lang === 'hi' ? 'स्लिप' : 'Print'}
                </button>
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="text-xs font-bold text-[#1F2937] bg-white px-2.5 py-1.5 rounded-lg border border-gray-300"
                >
                  ← {lang === 'hi' ? 'वापस' : 'Back'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {lang === 'hi' ? 'मासिक वेतन व हाजिरी पैरामीटर्स' : 'Monthly HR Calculation Parameters'}
                </h4>
              </div>

              {/* Statutory Note on Basic + HRA */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{lang === 'hi' ? 'बेसिक + HRA नियम:' : 'Basic + HRA Rule:'}</span>{' '}
                  {t.basicHraNote}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.monthlyGross}
                  </label>
                  <input
                    type="number"
                    value={selectedWorker.monthlyGross}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'monthlyGross', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-700 mb-1">
                    {t.monthlyBasic}
                  </label>
                  <input
                    type="number"
                    value={selectedWorker.basicSalary ?? Math.round((Number(selectedWorker.monthlyGross) || 0) * 0.75)}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'basicSalary', Number(e.target.value))}
                    className="w-full bg-white border border-indigo-300 rounded-lg p-2 font-black text-indigo-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-teal-700 mb-1">
                    {t.hraAmount}
                  </label>
                  <input
                    type="number"
                    value={selectedWorker.hraAmount ?? Math.max(0, (Number(selectedWorker.monthlyGross) || 0) - (Number(selectedWorker.basicSalary) || Math.round((Number(selectedWorker.monthlyGross) || 0) * 0.75)))}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'hraAmount', Number(e.target.value))}
                    className="w-full bg-white border border-teal-300 rounded-lg p-2 font-black text-teal-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {lang === 'hi' ? 'महीने के कुल दिन' : 'Total Days'}
                  </label>
                  <input
                    type="number"
                    value={selectedWorker.totalDaysInMonth}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'totalDaysInMonth', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.presentDays}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateWorkerStats(selectedWorker.id, 'presentDays', Math.max(0, (Number(selectedWorker.presentDays) || 0) - 1))}
                      className="w-7 h-8 bg-slate-200 hover:bg-slate-300 font-black text-slate-700 rounded-lg text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={selectedWorker.presentDays}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'presentDays', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-black text-emerald-700 text-center text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateWorkerStats(selectedWorker.id, 'presentDays', (Number(selectedWorker.presentDays) || 0) + 1)}
                      className="w-7 h-8 bg-emerald-600 hover:bg-emerald-700 font-black text-white rounded-lg text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-800 mb-1">
                    {lang === 'hi' ? 'ओवरटाइम घंटे (0.5 = 30 मिनट)' : 'Overtime Hours (0.5 = 30m)'}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateWorkerStats(selectedWorker.id, 'overtimeHours', Math.max(0, Number(((Number(selectedWorker.overtimeHours) || 0) - 0.5).toFixed(1))))}
                      className="w-8 h-8 bg-slate-200 hover:bg-slate-300 font-black text-slate-800 rounded-lg text-xs shrink-0"
                      title="-0.5 hr"
                    >
                      -0.5
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={selectedWorker.overtimeHours}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'overtimeHours', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-black text-purple-700 text-center text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateWorkerStats(selectedWorker.id, 'overtimeHours', Number(((Number(selectedWorker.overtimeHours) || 0) + 0.5).toFixed(1)))}
                      className="w-8 h-8 bg-purple-600 hover:bg-purple-700 font-black text-white rounded-lg text-xs shrink-0"
                      title="+0.5 hr"
                    >
                      +0.5
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.otRate}
                  </label>
                  <input
                    type="number"
                    value={selectedWorker.hourlyOtRate}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'hourlyOtRate', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.pfPercent}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedWorker.pfPercent}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'pfPercent', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.esiPercent}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedWorker.esiPercent}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'esiPercent', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-rose-700"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.advanceTaken}
                  </label>
                  <input
                    type="number"
                    value={selectedWorker.advanceGiven}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'advanceGiven', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-amber-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    🕒 {lang === 'hi' ? 'पंच / ड्यूटी टाइमिंग (मैन्युअल सेट करें)' : 'Manual Punch / Duty Time'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="उदा. 09:15 AM - 06:00 PM"
                      value={selectedWorker.punchTime || ''}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'punchTime', e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs"
                      title="हाजिरी का समय मैन्युअल रूप से टाइप करें"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
                        handleUpdateWorkerStats(selectedWorker.id, 'punchTime', nowStr);
                      }}
                      className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg shrink-0 active:scale-95"
                      title="वर्तमान समय सेट करें"
                    >
                      🕒 {lang === 'hi' ? 'अभी' : 'Now'}
                    </button>
                  </div>
                </div>
              </div>

              {(() => {
                const s = calculateWorkerSalary(selectedWorker);
                return (
                  <div className="bg-[#1F2937] text-white p-3.5 rounded-xl space-y-1.5 text-xs shadow-md">
                    <div className="flex justify-between text-gray-200">
                      <span>{lang === 'hi' ? 'अर्जित बेसिक (Earned Basic):' : 'Earned Basic:'}</span>
                      <span className="font-bold">₹{s.earnedBasic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span>{lang === 'hi' ? 'अर्जित मकान किराया (Earned HRA):' : 'Earned HRA:'}</span>
                      <span className="font-bold">₹{s.earnedHra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-300 border-t border-gray-700 pt-1">
                      <span>{lang === 'hi' ? 'अर्जित ग्रॉस सैलरी (Earned Gross):' : 'Earned Gross Wages:'}</span>
                      <span className="font-bold">₹{s.earnedGross.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span>{lang === 'hi' ? 'ओवरटाइम कमाई:' : 'Overtime Pay:'}</span>
                      <span className="font-bold">₹{s.otAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#16A34A] font-bold border-t border-gray-700 pt-1">
                      <span>{lang === 'hi' ? 'कुल मासिक कमाई (Gross Total):' : 'Total Earnings:'}</span>
                      <span>₹{s.totalEarnings.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-300">
                      <span>{lang === 'hi' ? `PF (${selectedWorker.pfPercent}% बेसिक पर):` : `PF (${selectedWorker.pfPercent}% on Basic):`}</span>
                      <span className="font-bold">-₹{s.pfDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-300">
                      <span>{lang === 'hi' ? `ESI (${selectedWorker.esiPercent}%):` : `ESI (${selectedWorker.esiPercent}%):`}</span>
                      <span className="font-bold">-₹{s.esiDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>{lang === 'hi' ? 'एडवांस कटौती:' : 'Advance Deduction:'}</span>
                      <span className="font-bold">-₹{s.advance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#16A34A] font-black text-sm border-t border-gray-700 pt-2">
                      <span>{lang === 'hi' ? 'नेट देय वेतन (Net Payable):' : 'Net Payable Salary:'}</span>
                      <span>₹{s.netSalary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={() => handleDeleteWorker(selectedWorker.id)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> {lang === 'hi' ? 'वर्कर को हटाएं' : 'Delete Worker Permanently'}
              </button>
            </div>
          </div>
        ) : activeTab === 'add' ? (
          <form onSubmit={handleAddWorker} className="space-y-3">
            <div className="bg-green-50 p-2.5 rounded-xl border border-green-200 text-[#1F2937] text-xs font-bold space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{lang === 'hi' ? '💡 नया वर्कर जोड़ें (Basic + HRA सुविधा सहित)' : '💡 Add New Worker (Basic + HRA compliant)'}</span>
              </div>
              <p className="text-[11px] font-normal text-gray-700">
                {t.basicHraNote}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t.workerName} *</label>
              <input
                type="text"
                required
                placeholder={lang === 'hi' ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-[#1F2937] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t.phoneNumber}</label>
              <input
                type="tel"
                placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10 digit mobile'}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-[#1F2937] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t.roleDesignation}</label>
              <input
                type="text"
                placeholder={lang === 'hi' ? 'उदा. ऑपरेटर, हेल्पर, कारीगर' : 'e.g. Machinist, Helper'}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-[#1F2937] text-xs"
              />
            </div>

            {/* Gross, Basic, HRA Triple Row */}
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.monthlyGross} *
                </label>
                <input
                  type="number"
                  required
                  value={newMonthlyGross}
                  onChange={(e) => handleGrossChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 font-black text-[#1F2937] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    {t.monthlyBasic}
                  </label>
                  <input
                    type="number"
                    value={newBasicSalary}
                    onChange={(e) => handleBasicChange(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2 font-black text-[#1F2937] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    {t.hraAmount}
                  </label>
                  <input
                    type="number"
                    value={newHraAmount}
                    onChange={(e) => handleHraChange(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2 font-black text-[#1F2937] text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.presentDays}</label>
                <input
                  type="number"
                  value={newPresentDays}
                  onChange={(e) => setNewPresentDays(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-[#16A34A] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.otRate}</label>
                <input
                  type="number"
                  value={newOtRate}
                  onChange={(e) => setNewOtRate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-purple-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.pfPercent}</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPfPercent}
                  onChange={(e) => setNewPfPercent(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-[#DC2626] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.esiPercent}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEsiPercent}
                  onChange={(e) => setNewEsiPercent(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-[#DC2626] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t.advanceTaken}</label>
              <input
                type="number"
                value={newAdvance}
                onChange={(e) => setNewAdvance(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-amber-700 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#16A34A] hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> {t.saveWorker}
            </button>
          </form>
        ) : activeTab === 'payroll' ? (
          <div className="space-y-3">
            <div className="bg-[#1F2937] text-white p-4 rounded-2xl shadow-md space-y-2">
              <div className="text-xs text-gray-300 font-bold">
                {lang === 'hi' ? 'कुल रजिस्टर्ड वर्कर:' : 'Total Workers:'}{' '}
                <span className="text-white font-black">{workers.length}</span>
              </div>
              <div className="text-xs text-gray-300 font-bold">{t.totalCompanyPayout}:</div>
              <div className="text-2xl font-black text-[#16A34A]">₹{totalFactoryPayroll.toLocaleString('en-IN')}</div>
              <button
                onClick={handlePrintFullPayrollSheet}
                className="w-full mt-2 py-2.5 bg-[#16A34A] hover:bg-green-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> {t.printFullPayroll}
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-[#1F2937] uppercase">
                {lang === 'hi' ? 'वर्कर वार नेट सैलरी' : 'Worker Wise Net Salary'}
              </h4>
              {workers.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs font-bold">
                  {lang === 'hi' ? 'अभी तक कोई वर्कर नहीं जोड़ा गया है।' : 'No workers added yet.'}
                </div>
              ) : (
                workers.map((w) => {
                  const s = calculateWorkerSalary(w);
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorker(w)}
                      className="bg-white hover:bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {w.facePunchPhoto ? (
                          <img src={w.facePunchPhoto} alt="Punch" className="w-8 h-8 rounded-full object-cover border border-[#16A34A] shadow-2xs" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
                            {w.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-black text-[#1F2937]">{w.name}</div>
                          <div className="text-[10px] text-gray-500 font-bold">
                            {w.role} • {w.punchTime ? `Punch: ${w.punchTime}` : (lang === 'hi' ? 'हाजिरी नहीं' : 'No Punch')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[#16A34A]">₹{s.netSalary.toLocaleString('en-IN')}</div>
                        <div className="text-[9px] text-gray-500 font-bold">
                          Basic: ₹{s.basic} | HRA: ₹{s.hra}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'daily' ? (
          <div className="space-y-3">
            {/* Daily Toast */}
            {dailyToast && (
              <div className="bg-[#1F2937] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md text-center flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{dailyToast}</span>
              </div>
            )}

            {/* Date Picker Bar & Quick Navigation */}
            <div className="bg-[#1F2937] text-white p-2.5 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleShiftDailyDate(-1)}
                  className="p-1.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 rounded-lg transition-all"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 text-center">
                  <div className="text-[11px] font-black text-amber-400 uppercase tracking-wide">
                    {new Date(selectedDailyDate + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <input
                    type="date"
                    value={selectedDailyDate}
                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                    className="bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-gray-600 mt-0.5 cursor-pointer text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleShiftDailyDate(1)}
                  className="p-1.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 rounded-lg transition-all"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDailyDate(new Date().toISOString().split('T')[0])}
                  className="text-[10px] font-black bg-[#16A34A] hover:bg-green-700 text-white px-2 py-1.5 rounded-lg shrink-0 transition-all active:scale-95"
                >
                  {lang === 'hi' ? 'आज (Today)' : 'Today'}
                </button>
              </div>

              {/* Mass 1-Click Action Bar */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => handleMarkAllDailyDuty('P')}
                  className="py-1.5 px-1 bg-[#16A34A] hover:bg-green-700 text-white font-black text-[10px] rounded-lg text-center flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <Check className="w-3 h-3 text-white shrink-0" />
                  <span>{lang === 'hi' ? 'सबकी हाजिरी (All P)' : 'All Present (P)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAllDailyDuty('HD')}
                  className="py-1.5 px-1 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] rounded-lg text-center flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <span>{lang === 'hi' ? 'सब हाफ डे (HD)' : 'All Half Day'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAllDailyDuty('A')}
                  className="py-1.5 px-1 bg-[#DC2626] hover:bg-red-700 text-white font-black text-[10px] rounded-lg text-center flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <span>{lang === 'hi' ? 'सब गैरहाजिर (A)' : 'All Absent'}</span>
                </button>
              </div>
            </div>

            {/* Daily Stats & Print Bar */}
            {(() => {
              const dayMap = dailyDuties[selectedDailyDate] || {};
              let pCount = 0;
              let hdCount = 0;
              let aCount = 0;
              let totalOt = 0;
              workers.forEach((w) => {
                const d = dayMap[w.id];
                if (!d || d.status === 'P') pCount++;
                else if (d.status === 'HD') hdCount++;
                else if (d.status === 'A') aCount++;
                totalOt += Number(d?.otHours) || 0;
              });

              return (
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 text-[10px] shadow-2xs">
                  <div className="flex items-center gap-2 font-black">
                    <span className="text-[#16A34A]">🟢 P: {pCount}</span>
                    <span className="text-amber-700">🟡 HD: {hdCount}</span>
                    <span className="text-[#DC2626]">🔴 A: {aCount}</span>
                    {totalOt > 0 && <span className="text-purple-700">🟣 OT: {totalOt}h</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintDailyMusterSheet}
                    className="flex items-center gap-1 font-black bg-gray-100 hover:bg-gray-200 text-[#1F2937] px-2 py-1 rounded-lg border border-gray-300 shadow-2xs active:scale-95 transition-all"
                  >
                    <Printer className="w-3 h-3 text-gray-600" />
                    <span>{lang === 'hi' ? 'शीट प्रिंट' : 'Print'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Worker List for Daily Duty */}
            {workers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs font-bold space-y-2">
                <p>{lang === 'hi' ? 'कोई वर्कर अभी तक नहीं जोड़ा गया है।' : 'No workers added yet.'}</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-[#16A34A] text-white font-black rounded-xl shadow-xs hover:bg-green-700"
                >
                  + {t.addWorker}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {workers.map((w) => {
                  const dayMap = dailyDuties[selectedDailyDate] || {};
                  const duty = dayMap[w.id] || {
                    status: 'P',
                    otHours: 0,
                    shift: 'Day',
                    inTime: '09:00 AM',
                    outTime: '06:00 PM',
                  };

                  return (
                    <div
                      key={w.id}
                      className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-gray-300 transition-all"
                    >
                      {/* Top Row: Worker info & Face Punch */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {duty.punchPhoto || w.facePunchPhoto ? (
                            <img
                              src={duty.punchPhoto || w.facePunchPhoto}
                              alt="Punch"
                              className="w-8 h-8 rounded-full object-cover border-2 border-[#16A34A] shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-black text-xs shrink-0">
                              {w.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-[#1F2937] truncate">{w.name}</h4>
                            <p className="text-[10px] text-gray-500 font-bold truncate">
                              {w.role} {duty.inTime && `• ⏰ ${duty.inTime}`}
                            </p>
                          </div>
                        </div>

                        {/* Camera punch & shift buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Shift Selector */}
                          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-[9px] font-bold">
                            <button
                              type="button"
                              onClick={() => handleSetDailyDuty(w.id, { shift: 'Day' })}
                              className={`px-1.5 py-1 ${duty.shift === 'Day' ? 'bg-amber-500 text-white font-black' : 'bg-gray-50 text-gray-600'}`}
                              title="Day Shift"
                            >
                              ☀️ {lang === 'hi' ? 'डे' : 'Day'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDailyDuty(w.id, { shift: 'Night' })}
                              className={`px-1.5 py-1 ${duty.shift === 'Night' ? 'bg-[#1F2937] text-white font-black' : 'bg-gray-50 text-gray-600'}`}
                              title="Night Shift"
                            >
                              🌙 {lang === 'hi' ? 'रात' : 'Night'}
                            </button>
                          </div>

                          {/* Quick Camera Face Punch */}
                          <button
                            type="button"
                            onClick={() => setPunchingWorker(w)}
                            className="p-1 bg-green-50 hover:bg-green-100 text-[#16A34A] border border-green-200 rounded-lg active:scale-95 transition-all"
                            title="Face Punch Camera"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Row: 3 Duty Status Pills & OT Hours Counter */}
                      <div className="grid grid-cols-12 gap-1.5 items-center">
                        {/* Status Pills (Col 7) */}
                        <div className="col-span-7 grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetDailyDuty(w.id, { status: 'P' })}
                            className={`py-1.5 rounded-lg text-center font-black text-xs transition-all active:scale-95 border ${
                              duty.status === 'P'
                                ? 'bg-[#16A34A] text-white border-green-700 shadow-xs'
                                : 'bg-green-50 text-[#16A34A] border-green-200 hover:bg-green-100'
                            }`}
                          >
                            P
                            <span className="block text-[8px] font-normal leading-none mt-0.5">
                              {lang === 'hi' ? 'पूरी' : 'Full'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetDailyDuty(w.id, { status: 'HD' })}
                            className={`py-1.5 rounded-lg text-center font-black text-xs transition-all active:scale-95 border ${
                              duty.status === 'HD'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            HD
                            <span className="block text-[8px] font-normal leading-none mt-0.5">
                              {lang === 'hi' ? 'हाफ' : 'Half'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetDailyDuty(w.id, { status: 'A' })}
                            className={`py-1.5 rounded-lg text-center font-black text-xs transition-all active:scale-95 border ${
                              duty.status === 'A'
                                ? 'bg-[#DC2626] text-white border-red-700 shadow-xs'
                                : 'bg-red-50 text-[#DC2626] border-red-200 hover:bg-red-100'
                            }`}
                          >
                            A
                            <span className="block text-[8px] font-normal leading-none mt-0.5">
                              {lang === 'hi' ? 'गैर' : 'Abs'}
                            </span>
                          </button>
                        </div>

                        {/* Overtime Counter (Col 5) with 0.5h support */}
                        <div className="col-span-5 flex items-center justify-end gap-1 bg-purple-50/70 p-1 rounded-lg border border-purple-200">
                          <span className="text-[10px] font-black text-purple-900 shrink-0">OT:</span>
                          <button
                            type="button"
                            onClick={() => handleSetDailyDuty(w.id, { otHours: Math.max(0, Number(((duty.otHours || 0) - 0.5).toFixed(1))) })}
                            className="w-5 h-5 bg-white border border-purple-300 text-purple-800 rounded font-black text-[11px] flex items-center justify-center active:scale-95"
                            title="-0.5 hr (30 mins)"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={duty.otHours || 0}
                            onChange={(e) => handleSetDailyDuty(w.id, { otHours: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-10 text-center font-black text-xs text-purple-900 bg-white border border-purple-200 rounded py-0.5"
                          />
                          <span className="text-[10px] font-bold text-purple-800">h</span>
                          <button
                            type="button"
                            onClick={() => handleSetDailyDuty(w.id, { otHours: Number(((duty.otHours || 0) + 0.5).toFixed(1)) })}
                            className="w-5 h-5 bg-purple-600 text-white rounded font-black text-[11px] flex items-center justify-center active:scale-95"
                            title="+0.5 hr (30 mins)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Quick Remarks & Time stamp */}
                      <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                        <input
                          type="text"
                          placeholder={lang === 'hi' ? 'टिप्पणी (उदा. लेट / गेट पास / ओवरटाइम काम)' : 'Remarks / Note'}
                          value={duty.note || ''}
                          onChange={(e) => handleSetDailyDuty(w.id, { note: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 text-[#1F2937] text-[10px]"
                        />
                      </div>

                      {/* Quick 0.5h / 1h / 1.5h / 2h OT Shortcut Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[9px]">
                        <span className="font-bold text-purple-900 shrink-0">{lang === 'hi' ? 'त्वरित OT:' : 'Quick OT:'}</span>
                        {[
                          { label: '0.5h (आधा घंटा)', val: 0.5 },
                          { label: '1h', val: 1 },
                          { label: '1.5h', val: 1.5 },
                          { label: '2h', val: 2 },
                          { label: '0h', val: 0 },
                        ].map((ot) => (
                          <button
                            key={ot.label}
                            type="button"
                            onClick={() => handleSetDailyDuty(w.id, { otHours: ot.val })}
                            className={`px-1.5 py-0.5 rounded font-bold border shrink-0 transition-all active:scale-95 ${
                              duty.otHours === ot.val
                                ? 'bg-purple-700 text-white border-purple-800 shadow-2xs font-black'
                                : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                            }`}
                          >
                            {ot.label}
                          </button>
                        ))}
                      </div>

                      {/* Manual Time In & Out Setting Row */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                        <div className="flex items-center gap-1 flex-1 min-w-[130px]">
                          <span className="font-bold text-gray-700 shrink-0">🕒 In:</span>
                          <input
                            type="text"
                            value={duty.inTime || ''}
                            placeholder="09:00 AM"
                            onChange={(e) => handleSetDailyDuty(w.id, { inTime: e.target.value })}
                            className="w-full min-w-[65px] max-w-[85px] bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[#1F2937] font-bold text-[10px]"
                            title={lang === 'hi' ? 'आने का समय (मैन्युअल लिखें)' : 'In Time (type manually)'}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
                              handleSetDailyDuty(w.id, { inTime: nowStr });
                            }}
                            className="px-1.5 py-0.5 bg-gray-200 hover:bg-gray-300 text-[#1F2937] rounded font-bold text-[9px] shrink-0 active:scale-95"
                            title="Set In Time to Current Time"
                          >
                            {lang === 'hi' ? 'अभी' : 'Now'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1 flex-1 min-w-[130px]">
                          <span className="font-bold text-gray-700 shrink-0">Out:</span>
                          <input
                            type="text"
                            value={duty.outTime || ''}
                            placeholder="06:00 PM"
                            onChange={(e) => handleSetDailyDuty(w.id, { outTime: e.target.value })}
                            className="w-full min-w-[65px] max-w-[85px] bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[#1F2937] font-bold text-[10px]"
                            title={lang === 'hi' ? 'जाने का समय (मैन्युअल लिखें)' : 'Out Time (type manually)'}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
                              handleSetDailyDuty(w.id, { outTime: nowStr });
                            }}
                            className="px-1.5 py-0.5 bg-gray-200 hover:bg-gray-300 text-[#1F2937] rounded font-bold text-[9px] shrink-0 active:scale-95"
                            title="Set Out Time to Current Time"
                          >
                            {lang === 'hi' ? 'अभी' : 'Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Quick How-To Attendance Banner */}
            <div className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-[#1F2937] shadow-2xs space-y-1.5">
              <div className="font-black flex items-center gap-1.5 text-[#1F2937]">
                <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{lang === 'hi' ? 'हाजिरी लगाने के 3 आसान तरीके:' : '3 Easy Ways to Mark Attendance:'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-gray-700">
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="font-bold text-[#16A34A]">1. +1 P बटन</div>
                  <div className="text-[9px] text-gray-500 leading-tight">{lang === 'hi' ? 'सीधे 1-क्लिक हाजिरी' : '1-tap quick present'}</div>
                </div>
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="font-bold text-[#16A34A]">2. 📷 पंच</div>
                  <div className="text-[9px] text-gray-500 leading-tight">{lang === 'hi' ? 'कैमरा फेस बायोमेट्रिक' : 'Camera face punch'}</div>
                </div>
                <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="font-bold text-purple-700">3. 📝 रजिस्टर</div>
                  <div className="text-[9px] text-gray-500 leading-tight">{lang === 'hi' ? 'क्लिक कर दिन/OT भरें' : 'Click to edit days/OT'}</div>
                </div>
              </div>
            </div>

            {workers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-bold space-y-2">
                <p>{lang === 'hi' ? 'कोई वर्कर अभी तक नहीं जोड़ा गया है।' : 'No workers added yet.'}</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-black rounded-xl shadow-xs"
                >
                  + {t.addWorker}
                </button>
              </div>
            ) : (
              workers.map((w) => {
                const s = calculateWorkerSalary(w);
                const isFullMonth = (Number(w.presentDays) || 0) >= (Number(w.totalDaysInMonth) || 26);
                return (
                  <div
                    key={w.id}
                    className="bg-white hover:bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-2 transition-all shadow-2xs"
                  >
                    <div 
                      onClick={() => setSelectedWorker(w)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
                    >
                      {w.facePunchPhoto ? (
                        <img src={w.facePunchPhoto} alt="Punch" className="w-10 h-10 rounded-full object-cover border-2 border-[#16A34A] shadow-2xs shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-black text-xs shrink-0">
                          {w.name.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-[#1F2937] truncate">{w.name}</h4>
                          <span className="bg-green-50 text-[#16A34A] border border-green-200 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            {w.presentDays || 0}/{w.totalDaysInMonth || 26} {lang === 'hi' ? 'दिन' : 'D'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold truncate">
                          {w.role} • Basic: ₹{s.basic.toLocaleString('en-IN')} | HRA: ₹{s.hra.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[9px] text-[#16A34A] font-semibold truncate">
                          {w.punchTime ? `Punch: ${w.punchTime}` : (lang === 'hi' ? 'आज कोई पंच नहीं' : 'No punch today')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* 1-Tap Quick Present Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickMarkPresent(w)}
                        title={lang === 'hi' ? '1-क्लिक में आज की हाजिरी दर्ज करें' : 'Quick Mark Present (+1 Day)'}
                        className={`px-2 py-1.5 text-[11px] font-black rounded-lg border flex items-center gap-0.5 active:scale-95 transition-all ${
                          isFullMonth
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-green-50 hover:bg-green-100 text-[#16A34A] border-green-300 shadow-2xs'
                        }`}
                      >
                        <span className="text-xs font-black">+1 P</span>
                      </button>

                      {/* Biometric Face Punch Button */}
                      <button
                        type="button"
                        onClick={() => setPunchingWorker(w)}
                        className="px-2 py-1.5 bg-[#16A34A] hover:bg-green-700 text-white text-[11px] font-black rounded-lg shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                        title={lang === 'hi' ? 'कैमरे से फोटो खींचकर फेस हाजिरी लगाएं' : 'Take Face Punch Attendance'}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'पंच' : 'Punch'}</span>
                      </button>

                      {/* Open Full Register / Edit Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedWorker(w)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                        title={lang === 'hi' ? 'रजिस्टर व सैलरी विवरण देखें' : 'View / Edit Full Details'}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Face Punch Biometric Camera Modal for Worker */}
      {punchingWorker && (
        <div className="absolute inset-0 z-50 bg-[#1F2937]/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
            <div className="bg-[#1F2937] text-white p-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black">Biometric Face Punch</h3>
                <p className="text-[10px] text-[#16A34A] font-bold">{punchingWorker.name} ({punchingWorker.role})</p>
              </div>
              <button
                onClick={() => setPunchingWorker(null)}
                className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 flex flex-col items-center space-y-3">
              <div className="relative w-full aspect-square max-h-[260px] bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                    />
                    <div className="absolute inset-0 border-2 border-emerald-400/50 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-36 h-36 border border-dashed border-white/60 rounded-full animate-pulse"></div>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {cameraError && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 font-bold text-center">
                  {cameraError}
                </div>
              )}

              <div className="text-center">
                <div className="text-sm font-black text-[#1F2937]">{currentTime || 'Loading time...'}</div>
                <div className="text-[10px] text-gray-500 font-bold">Position face inside frame & capture attendance</div>
              </div>

              <div className="w-full flex items-center gap-2">
                {capturedPhoto ? (
                  <>
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1F2937] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retake
                    </button>
                    <button
                      onClick={handleSaveFacePunch}
                      className="flex-1 py-2.5 bg-[#16A34A] hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Save Punch
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-[#1F2937] font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      title="Upload from Gallery"
                    >
                      <Upload className="w-4 h-4" /> Gallery
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={handleCaptureStream}
                      disabled={!cameraActive}
                      className="flex-1 py-2.5 bg-[#16A34A] hover:bg-green-700 disabled:bg-gray-300 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Capture Face Punch
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Print Preview Modal */}
      {printModalHtml && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#1F2937] text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#16A34A]" /> {printModalTitle}
              </h3>
              <button
                onClick={() => setPrintModalHtml(null)}
                className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 p-2 overflow-hidden flex flex-col min-h-[400px]">
              <iframe
                srcDoc={printModalHtml}
                title="Print Preview Frame"
                className="w-full flex-1 bg-white rounded-xl border border-gray-300 shadow-inner"
              />
            </div>
            <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setPrintModalHtml(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-[#1F2937] font-bold text-xs rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const iframe = document.querySelector('iframe[title="Print Preview Frame"]') as HTMLIFrameElement;
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                  }
                }}
                className="px-5 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
