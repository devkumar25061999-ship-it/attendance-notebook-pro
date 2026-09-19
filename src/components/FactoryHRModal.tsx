import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, IndianRupee, Trash2, Calendar, FileText, X, Check, Award, Briefcase, ChevronRight, Printer, Percent } from 'lucide-react';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: string;
  monthlyGross: number;      // Fixed Monthly Gross Salary
  totalDaysInMonth: number;  // e.g., 26 or 30 days
  presentDays: number;       // Days worked in month
  overtimeHours: number;     // Overtime hours
  hourlyOtRate: number;      // Overtime hourly rate
  pfPercent: number;         // e.g. 12% or 13% chosen by HR
  esiPercent: number;        // e.g. 0.75% or custom chosen by HR
  advanceGiven: number;      // Advance taken by worker
  notes: string;
  facePunchPhoto?: string;
  punchTime?: string;
}

interface FactoryHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHourlyOt: number;
}

const STORAGE_KEY_WORKERS = 'attendance_factory_workers_v4';

export const FactoryHRModal: React.FC<FactoryHRModalProps> = ({
  isOpen,
  onClose,
  defaultHourlyOt,
}) => {
  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return []; // Start completely empty so user adds real workers
  });

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'payroll'>('list');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // New Worker Form state including OT, Advance, PF, ESI
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

  if (!isOpen) return null;

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
    if (window.confirm('Kya aap is worker ko permanent delete karna chahte hain? Data local storage se hat jayega.')) {
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

  // Professional Monthly HR Salary Calculation
  const calculateWorkerSalary = (w: Worker) => {
    const totalDays = Number(w.totalDaysInMonth) || 26;
    const present = Number(w.presentDays) || 0;
    const gross = Number(w.monthlyGross) || 0;
    
    // Pro-rata basic/gross earned based on present days vs total days
    const earnedGross = totalDays > 0 ? (gross / totalDays) * present : gross;
    
    // Overtime amount
    const otAmount = (Number(w.overtimeHours) || 0) * (Number(w.hourlyOtRate) || 60);
    
    const totalEarnings = earnedGross + otAmount;

    // PF & ESI calculation
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
    h2 { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; border-bottom: 1px dotted #cbd5e1; padding-bottom: 6px; }
    .bold { font-weight: bold; }
    .total { font-size: 16px; font-weight: 900; margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 12px; display: flex; justify-content: space-between; color: #047857; }
  </style>
</head>
<body>
  <h2>FACTORY WORKER SALARY SLIP</h2>
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
  <script>
    window.onload = function() { window.print(); window.close(); }
  </script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              📊
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">Factory HR Monthly Salary & PF/ESI Portal</h2>
              <p className="text-[10px] text-slate-300 font-bold">Gross Salary • PF (12%/13%) • ESI • OT • Advance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('list'); setSelectedWorker(null); }}
            className={`py-2 rounded-xl transition-all ${activeTab === 'list' && !selectedWorker ? 'bg-white text-blue-700 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Workers List ({workers.length})
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
            Total Payroll
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 app-scrollable">
          
          {selectedWorker ? (
            /* WORKER DETAILED MONTHLY CALCULATION & SLIP */
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{selectedWorker.name}</h3>
                  <p className="text-xs text-slate-500 font-bold">{selectedWorker.role} • 📞 {selectedWorker.phone}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePrintSlip(selectedWorker)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-black shadow-xs"
                    title="Print Salary Slip"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Slip
                  </button>
                  <button
                    onClick={() => setSelectedWorker(null)}
                    className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* Monthly Salary Parameters Form */}
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
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Days in Month</label>
                    <input
                      type="number"
                      value={selectedWorker.totalDaysInMonth}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'totalDaysInMonth', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Present Days Worked</label>
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
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">OT Rate / Hour (₹)</label>
                    <input
                      type="number"
                      value={selectedWorker.hourlyOtRate}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'hourlyOtRate', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">PF Deduction (%) [e.g. 12% / 13%]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedWorker.pfPercent}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'pfPercent', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-rose-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ESI Deduction (%) [e.g. 0.75%]</label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedWorker.esiPercent}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'esiPercent', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-rose-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Advance Taken / Cash Given (₹)</label>
                    <input
                      type="number"
                      value={selectedWorker.advanceGiven}
                      onChange={(e) => handleUpdateWorkerStats(selectedWorker.id, 'advanceGiven', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-amber-700"
                    />
                  </div>
                </div>

                {/* Calculation Breakdown Card */}
                {(() => {
                  const s = calculateWorkerSalary(selectedWorker);
                  return (
                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs shadow-md">
                      <div className="flex justify-between text-slate-300">
                        <span>Earned Gross ({selectedWorker.presentDays}/{selectedWorker.totalDaysInMonth} days):</span>
                        <span className="font-bold">₹{s.earnedGross.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Overtime Pay ({selectedWorker.overtimeHours} hrs @ ₹{selectedWorker.hourlyOtRate}/h):</span>
                        <span className="font-bold">₹{s.otAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                        <span>Total Monthly Earnings:</span>
                        <span>₹{s.totalEarnings.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-rose-300">
                        <span>PF Deduction ({selectedWorker.pfPercent}%):</span>
                        <span className="font-bold">-₹{s.pfDeduction}</span>
                      </div>
                      <div className="flex justify-between text-rose-300">
                        <span>ESI Deduction ({selectedWorker.esiPercent}%):</span>
                        <span className="font-bold">-₹{s.esiDeduction}</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>Advance Deduction:</span>
                        <span className="font-bold">-₹{s.advance}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-black text-sm border-t border-slate-800 pt-2">
                        <span>Final Net Salary Payable:</span>
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
            /* ADD NEW WORKER FORM WITH ALL FIELDS (GROSS, PF, ESI, OT, ADVANCE) */
            <form onSubmit={handleAddWorker} className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900 text-xs font-bold">
                💡 Naya worker jodne ke liye Monthly Gross Salary, OT Rate, Advance aur PF/ESI percentages enter karein. Data user storage mein surakshit save rahega.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Worker Full Name *</label>
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
                  placeholder="10 digit mobile number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Supervisor, Operator, Helper"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Present Days / 26</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">PF % (12% / 13%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPfPercent}
                    onChange={(e) => setNewPfPercent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-rose-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ESI % (e.g. 0.75%)</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">OT Rate / Hour (₹)</label>
                  <input
                    type="number"
                    value={newOtRate}
                    onChange={(e) => setNewOtRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-purple-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Advance (₹)</label>
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
            /* TOTAL FACTORY PAYROLL */
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-2">
                <div className="text-xs text-slate-300 font-bold">Total Active Manpower: <span className="text-white font-black">{workers.length} Workers</span></div>
                <div className="text-xs text-slate-300 font-bold">Total Factory Net Payout:</div>
                <div className="text-2xl font-black text-emerald-400">₹{totalFactoryPayroll.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-400">Monthly Gross salary after PF, ESI, OT & Advance deductions.</p>
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
                        <div>
                          <div className="font-black text-slate-900">{w.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{w.role} • Gross: ₹{w.monthlyGross}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-emerald-700">₹{s.netSalary.toLocaleString('en-IN')}</div>
                          <div className="text-[9px] text-slate-500 font-bold">PF: {w.pfPercent}% | ESI: {w.esiPercent}%</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* WORKERS LIST */
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
                      onClick={() => setSelectedWorker(w)}
                      className="bg-slate-50 hover:bg-blue-50/50 p-3 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{w.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold">{w.role} • Gross: ₹{w.monthlyGross}/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-700">₹{s.netSalary.toLocaleString('en-IN')}</span>
                          <span className="block text-[9px] text-slate-400 font-bold">Net Payable</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold">💾 Storage: Saved Locally (Delete on Demand)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
};
