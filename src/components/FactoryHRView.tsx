import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Phone, IndianRupee, Trash2, Calendar, FileText, X, Check, Award, Briefcase, ChevronRight, Printer, Percent, Building2, Camera, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { Worker } from './FactoryHRModal';

interface FactoryHRViewProps {
  defaultHourlyOt: number;
}

const STORAGE_KEY_WORKERS = 'attendance_factory_workers_v4';

export const FactoryHRView: React.FC<FactoryHRViewProps> = ({ defaultHourlyOt }) => {
  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'payroll'>('list');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

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

  // New Worker Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Operator / Worker');
  const [newMonthlyGross, setNewMonthlyGross] = useState('15000');
  const [newPfPercent, setNewPfPercent] = useState('12');
  const [newEsiPercent, setNewEsiPercent] = useState('0.75');
  const [newOtRate, setNewOtRate] = useState(String(defaultHourlyOt || 60));
  const [newAdvance, setNewAdvance] = useState('0');
  const [newPresentDays, setNewPresentDays] = useState('26');

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

    alert(`✅ Face Punch Successful for ${punchingWorker.name} at ${nowTimeStr}! Present day updated.`);
    setPunchingWorker(null);
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const worker: Worker = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim() || 'N/A',
      role: newRole.trim() || 'Worker',
      monthlyGross: Number(newMonthlyGross) || 15000,
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
    setNewMonthlyGross('15000');
    setNewAdvance('0');
    setActiveTab('list');
  };

  const handleDeleteWorker = (id: string) => {
    if (window.confirm('Kya aap is worker ko permanent delete karna chahte hain?')) {
      setWorkers(workers.filter((w) => w.id !== id));
      if (selectedWorker?.id === id) setSelectedWorker(null);
    }
  };

  const handleUpdateWorkerStats = (id: string, field: keyof Worker, value: number | string) => {
    setWorkers(
      workers.map((w) => {
        if (w.id === id) {
          const updated = { ...w, [field]: value };
          if (selectedWorker?.id === id) setSelectedWorker(updated);
          return updated;
        }
        return w;
      })
    );
  };

  const calculateWorkerSalary = (w: Worker) => {
    const totalDays = Number(w.totalDaysInMonth) || 26;
    const present = Number(w.presentDays) || 0;
    const gross = Number(w.monthlyGross) || 0;
    
    const earnedGross = totalDays > 0 ? (gross / totalDays) * present : gross;
    const otAmount = (Number(w.overtimeHours) || 0) * (Number(w.hourlyOtRate) || 60);
    const totalEarnings = earnedGross + otAmount;

    const pfDeduction = Math.round(totalEarnings * ((Number(w.pfPercent) || 0) / 100));
    const esiDeduction = Math.round(totalEarnings * ((Number(w.esiPercent) || 0) / 100));
    const advance = Number(w.advanceGiven) || 0;

    const totalDeductions = pfDeduction + esiDeduction + advance;
    const netSalary = Math.round(totalEarnings - totalDeductions);

    return {
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print salary slip.');
      return;
    }
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
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; border-bottom: 1px dotted #cbd5e1; padding-bottom: 6px; }
    .bold { font-weight: bold; }
    .total { font-size: 16px; font-weight: 900; margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 12px; display: flex; justify-content: space-between; color: #047857; }
    .sign { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="company-header">
    <h1>${companyName}</h1>
    <p>Factory License No: <b>${licenseNumber}</b> | GSTIN: <b>${gstNumber}</b></p>
  </div>
  <h2>Monthly Salary Slip</h2>
  
  <div class="row"><span class="bold">Worker Name:</span> <span>${w.name}</span></div>
  <div class="row"><span class="bold">Role / Designation:</span> <span>${w.role}</span></div>
  <div class="row"><span class="bold">Phone Number:</span> <span>${w.phone}</span></div>
  <div class="row"><span class="bold">Monthly Gross Salary:</span> <span>₹${w.monthlyGross.toLocaleString('en-IN')}</span></div>
  <div class="row"><span class="bold">Attendance Period:</span> <span>${w.presentDays} / ${w.totalDaysInMonth} Days Worked</span></div>
  <div class="row"><span class="bold">Earned Gross Salary:</span> <span>₹${s.earnedGross.toLocaleString('en-IN')}</span></div>
  <div class="row"><span class="bold">Overtime (${w.overtimeHours} hrs @ ₹${w.hourlyOtRate}/h):</span> <span>₹${s.otAmount.toLocaleString('en-IN')}</span></div>
  <div class="row"><span class="bold">Total Monthly Earnings:</span> <span>₹${s.totalEarnings.toLocaleString('en-IN')}</span></div>
  <div class="row"><span class="bold">PF Deduction (${w.pfPercent}%):</span> <span style="color:#b91c1c;">-₹${s.pfDeduction}</span></div>
  <div class="row"><span class="bold">ESI Deduction (${w.esiPercent}%):</span> <span style="color:#b91c1c;">-₹${s.esiDeduction}</span></div>
  <div class="row"><span class="bold">Advance / Cash Taken:</span> <span style="color:#b91c1c;">-₹${s.advance}</span></div>
  <div class="total"><span>Final Net Payable Salary:</span> <span>₹${s.netSalary.toLocaleString('en-IN')}</span></div>

  <div class="sign">
    <div>Worker Signature: ___________________</div>
    <div>Authorized Signatory: ___________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); window.close(); }
  </script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintFullPayrollSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print payroll sheet.');
      return;
    }

    const rowsHtml = workers.map((w, idx) => {
      const s = calculateWorkerSalary(w);
      return `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${w.name}</b><br/><small>${w.role} | 📞 ${w.phone}</small></td>
          <td>₹${w.monthlyGross}</td>
          <td>${w.presentDays}/${w.totalDaysInMonth}</td>
          <td>₹${s.earnedGross}</td>
          <td>${w.overtimeHours}h (₹${s.otAmount})</td>
          <td>-₹${s.pfDeduction + s.esiDeduction}</td>
          <td>-₹${s.advance}</td>
          <td><b>₹${s.netSalary}</b></td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Factory Master Roll & Total Payroll Sheet</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 900; }
    .header p { margin: 4px 0; font-size: 11px; color: #475569; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #0f172a; color: white; font-weight: bold; }
    .total-box { margin-top: 20px; text-align: right; font-size: 16px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 10px; color: #047857; }
    .signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${companyName}</h1>
    <p>Factory License No: <b>${licenseNumber}</b> | GSTIN: <b>${gstNumber}</b></p>
    <p style="text-transform: uppercase; font-size: 14px; margin-top: 8px; color: #0f172a;">Monthly Master Roll & Worker Wise Payout Sheet</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Worker Name & Details</th>
        <th>Gross (₹)</th>
        <th>Attendance</th>
        <th>Earned (₹)</th>
        <th>Overtime</th>
        <th>PF/ESI Ded.</th>
        <th>Advance</th>
        <th>Net Payout (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="9" style="text-align:center;">No workers added yet.</td></tr>'}
    </tbody>
  </table>

  <div class="total-box">
    Total Factory Net Payout: ₹${totalFactoryPayroll.toLocaleString('en-IN')}
  </div>

  <div class="signatures">
    <div>Prepared By (HR Manager): ___________________</div>
    <div>Authorized Signatory / Owner: ___________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); window.close(); }
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto my-1 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden relative">
      {/* Company Details Bar */}
      <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between border-b border-slate-800 shrink-0 text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-black truncate">{companyName}</span>
        </div>
        <button
          onClick={() => setShowCompanySettings(!showCompanySettings)}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2 py-1 rounded-lg border border-slate-700 shrink-0"
        >
          {showCompanySettings ? 'Close Details' : '🏢 Company / GST'}
        </button>
      </div>

      {/* Collapsible Company Details Edit Form */}
      {showCompanySettings && (
        <div className="bg-slate-50 p-3 border-b border-slate-200 space-y-2 text-xs shrink-0">
          <h4 className="font-black text-slate-800 uppercase text-[11px]">Edit Company & License Details (For Print Slips)</h4>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Company / Factory Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Factory License No.</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200 shrink-0 text-xs font-bold">
        <button
          onClick={() => { setActiveTab('list'); setSelectedWorker(null); }}
          className={`py-2 rounded-xl transition-all ${activeTab === 'list' && !selectedWorker ? 'bg-white text-blue-700 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Workers ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`py-2 rounded-xl transition-all ${activeTab === 'add' ? 'bg-white text-blue-700 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          + Add Worker
        </button>
        <button
          onClick={() => { setActiveTab('payroll'); setSelectedWorker(null); }}
          className={`py-2 rounded-xl transition-all ${activeTab === 'payroll' ? 'bg-white text-blue-700 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Payroll Summary
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 app-scrollable">
        {selectedWorker ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                {selectedWorker.facePunchPhoto ? (
                  <img src={selectedWorker.facePunchPhoto} alt="Punch" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                    {selectedWorker.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-slate-900">{selectedWorker.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold">{selectedWorker.role} • {selectedWorker.punchTime ? `Punch: ${selectedWorker.punchTime}` : 'No Punch Today'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPunchingWorker(selectedWorker)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow-xs"
                  title="Face Punch Biometric"
                >
                  <Camera className="w-3.5 h-3.5" /> Face Punch
                </button>
                <button
                  onClick={() => handlePrintSlip(selectedWorker)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300"
                >
                  ← Back
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Monthly HR Calculation Parameters</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Gross Salary (₹)</label>
                  <input
                    type="number"
                    value={selectedWorker.monthlyGross}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'monthlyGross', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Days</label>
                  <input
                    type="number"
                    value={selectedWorker.totalDaysInMonth}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'totalDaysInMonth', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Present Days</label>
                  <input
                    type="number"
                    value={selectedWorker.presentDays}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'presentDays', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Overtime Hours</label>
                  <input
                    type="number"
                    value={selectedWorker.overtimeHours}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'overtimeHours', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">OT Rate / Hr (₹)</label>
                  <input
                    type="number"
                    value={selectedWorker.hourlyOtRate}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'hourlyOtRate', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">PF % [12% / 13%]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedWorker.pfPercent}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'pfPercent', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ESI % [0.75%]</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedWorker.esiPercent}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'esiPercent', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-rose-700"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Advance Taken (₹)</label>
                  <input
                    type="number"
                    value={selectedWorker.advanceGiven}
                    onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'advanceGiven', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-amber-700"
                  />
                </div>
              </div>

              {(() => {
                const s = calculateWorkerSalary(selectedWorker);
                return (
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1.5 text-xs shadow-md">
                    <div className="flex justify-between text-slate-300">
                      <span>Earned Gross:</span>
                      <span className="font-bold">₹{s.earnedGross.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Overtime Pay:</span>
                      <span className="font-bold">₹{s.otAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                      <span>Total Earnings:</span>
                      <span>₹{s.totalEarnings.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>PF ({selectedWorker.pfPercent}%) & ESI ({selectedWorker.esiPercent}%):</span>
                      <span className="font-bold">-₹{s.pfDeduction + s.esiDeduction}</span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>Advance Deduction:</span>
                      <span className="font-bold">-₹{s.advance}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-black text-sm border-t border-slate-800 pt-2">
                      <span>Net Payable Salary:</span>
                      <span>₹{s.netSalary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={() => handleDeleteWorker(selectedWorker.id)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Worker Permanently
              </button>
            </div>
          </div>
        ) : activeTab === 'add' ? (
          <form onSubmit={handleAddWorker} className="space-y-3">
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-blue-900 text-xs font-bold">
              💡 Naya worker jodne ke liye Monthly Gross, PF, ESI, OT & Advance enter karein.
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Worker Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                placeholder="10 digit mobile"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role / Designation</label>
              <input
                type="text"
                placeholder="e.g. Machinist, Helper"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Gross (₹) *</label>
                <input
                  type="number"
                  required
                  value={newMonthlyGross}
                  onChange={(e) => setNewMonthlyGross(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Present Days</label>
                <input
                  type="number"
                  value={newPresentDays}
                  onChange={(e) => setNewPresentDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-700 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PF % [12/13]</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPfPercent}
                  onChange={(e) => setNewPfPercent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-rose-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ESI % [0.75]</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEsiPercent}
                  onChange={(e) => setNewEsiPercent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-rose-700 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OT Rate / Hr (₹)</label>
                <input
                  type="number"
                  value={newOtRate}
                  onChange={(e) => setNewOtRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-purple-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Advance (₹)</label>
                <input
                  type="number"
                  value={newAdvance}
                  onChange={(e) => setNewAdvance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-amber-700 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Save Worker to Storage
            </button>
          </form>
        ) : activeTab === 'payroll' ? (
          <div className="space-y-3">
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-2">
              <div className="text-xs text-slate-300 font-bold">Total Workers: <span className="text-white font-black">{workers.length}</span></div>
              <div className="text-xs text-slate-300 font-bold">Total Factory Net Payout:</div>
              <div className="text-2xl font-black text-emerald-400">₹{totalFactoryPayroll.toLocaleString('en-IN')}</div>
              <button
                onClick={handlePrintFullPayrollSheet}
                className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print Complete Factory Payout Sheet
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase">Worker Wise Net Salary</h4>
              {workers.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold">No workers added yet.</div>
              ) : (
                workers.map((w) => {
                  const s = calculateWorkerSalary(w);
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorker(w)}
                      className="bg-slate-50 hover:bg-blue-50/50 p-3 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        {w.facePunchPhoto ? (
                          <img src={w.facePunchPhoto} alt="Punch" className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-2xs" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                            {w.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-black text-slate-900">{w.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{w.role} • {w.punchTime ? `Punch: ${w.punchTime}` : 'No Punch'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-700">₹{s.netSalary.toLocaleString('en-IN')}</div>
                        <div className="text-[9px] text-slate-500 font-bold">Gross: ₹{w.monthlyGross}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {workers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
                <p>Koi worker add nahi kiya gaya hai.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl shadow-xs"
                >
                  + Add First Worker Now
                </button>
              </div>
            ) : (
              workers.map((w) => {
                const s = calculateWorkerSalary(w);
                return (
                  <div
                    key={w.id}
                    className="bg-slate-50 hover:bg-blue-50/50 p-3 rounded-xl border border-slate-200 flex items-center justify-between transition-all"
                  >
                    <div 
                      onClick={() => setSelectedWorker(w)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
                    >
                      {w.facePunchPhoto ? (
                        <img src={w.facePunchPhoto} alt="Punch" className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-2xs shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                          {w.name.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <h4 className="text-xs font-black text-slate-900 truncate">{w.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{w.role} • {w.punchTime ? `Punch: ${w.punchTime}` : 'No Punch Today'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPunchingWorker(w)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg shadow-xs flex items-center gap-1 active:scale-95"
                        title="Take Face Punch Attendance"
                      >
                        <Camera className="w-3.5 h-3.5" /> Punch
                      </button>
                      <button
                        onClick={() => setSelectedWorker(w)}
                        className="p-1.5 text-slate-400 hover:text-slate-700"
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
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black">Biometric Face Punch</h3>
                <p className="text-[10px] text-emerald-400 font-bold">{punchingWorker.name} ({punchingWorker.role})</p>
              </div>
              <button
                onClick={() => setPunchingWorker(null)}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold"
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
                <div className="text-sm font-black text-slate-900">{currentTime || 'Loading time...'}</div>
                <div className="text-[10px] text-slate-500 font-bold">Position face inside frame & capture attendance</div>
              </div>

              <div className="w-full flex items-center gap-2">
                {capturedPhoto ? (
                  <>
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retake
                    </button>
                    <button
                      onClick={handleSaveFacePunch}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Save Punch
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
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
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
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
    </div>
  );
};
