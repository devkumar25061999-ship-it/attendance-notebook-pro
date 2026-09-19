import React from 'react';
import { Camera, BookOpen, Printer } from 'lucide-react';

interface ActionButtonsRowProps {
  onOpenFacePunch: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenNotebook: () => void;
  onOpenReport?: () => void;
  facePunchEnabled: boolean;
  punchPhoto?: string;
  punchTime?: string;
}

export const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  onOpenFacePunch,
  onOpenNotebook,
  onOpenSettings,
  onOpenReport,
  facePunchEnabled,
  punchPhoto,
  punchTime,
}) => {
  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      <div className="grid grid-cols-3 gap-1.5">
        {/* 1. Face Punch / Camera Attendance */}
        {facePunchEnabled ? (
          <button
            id="btn-action-face-punch"
            onClick={onOpenFacePunch}
            className={`font-black p-1.5 rounded-xl min-h-[40px] xs:min-h-[42px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all overflow-hidden border ${
              punchPhoto
                ? 'bg-purple-800 border-amber-400 text-white shadow-xs'
                : 'bg-purple-700 hover:bg-purple-800 border-purple-500 text-white'
            }`}
            title={
              punchPhoto
                ? `Camera photo recorded (${punchTime || 'Verified'}) - Click to view`
                : 'Face Punch (Selfie Camera Attendance)'
            }
          >
            {punchPhoto ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-300 shadow-2xs shrink-0">
                <img
                  src={punchPhoto}
                  alt="Punch Selfie"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-slate-950"></span>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className="flex flex-col text-left leading-tight min-w-0">
              <span className="text-xs font-black tracking-tight truncate">
                {punchPhoto ? 'Done' : 'Face Punch'}
              </span>
              <span className="text-[9px] text-purple-200 font-semibold truncate">
                {punchPhoto ? punchTime || 'Photo OK' : 'Selfie'}
              </span>
            </div>
          </button>
        ) : (
          <button
            id="btn-action-face-punch-disabled"
            onClick={onOpenSettings}
            className="bg-slate-200 text-slate-700 font-bold p-1.5 rounded-xl min-h-[40px] xs:min-h-[42px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all overflow-hidden border border-slate-300"
            title="Enable Face Punch in Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-300 flex items-center justify-center shrink-0">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="flex flex-col text-left leading-tight min-w-0">
              <span className="text-xs font-black text-slate-800 tracking-tight truncate">
                Face Punch
              </span>
              <span className="text-[9px] text-slate-600 truncate">Settings</span>
            </div>
          </button>
        )}

        {/* 2. Work Diary & Notes */}
        <button
          id="btn-action-notebook"
          onClick={onOpenNotebook}
          className="bg-teal-700 hover:bg-teal-800 border border-teal-500 text-white font-black p-1.5 rounded-xl min-h-[40px] xs:min-h-[42px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all overflow-hidden"
          title="Notebook (Daily Notes, Advances, Site Diary)"
        >
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-teal-100" />
          </div>
          <div className="flex flex-col text-left leading-tight min-w-0">
            <span className="text-xs font-black tracking-tight truncate">
              Work Diary
            </span>
            <span className="text-[9px] text-teal-200 font-semibold truncate">
              Notes / Khata
            </span>
          </div>
        </button>

        {/* 3. Salary Slip & Print */}
        <button
          id="btn-action-salary-slip"
          onClick={onOpenReport || onOpenSettings}
          className="bg-amber-500 hover:bg-amber-600 border border-amber-400 text-slate-950 font-black p-1.5 rounded-xl min-h-[40px] xs:min-h-[42px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all overflow-hidden"
          title="Open Monthly Salary Slip & Print"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950/15 flex items-center justify-center shrink-0">
            <Printer className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <div className="flex flex-col text-left leading-tight min-w-0">
            <span className="text-xs font-black tracking-tight truncate">
              Salary Slip
            </span>
            <span className="text-[9px] text-slate-900 font-extrabold truncate">
              Print / PDF
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
