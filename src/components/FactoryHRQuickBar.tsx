import React from 'react';
import { Users, ChevronRight, Calculator, IndianRupee } from 'lucide-react';

interface FactoryHRQuickBarProps {
  onOpenFactoryHR: () => void;
  workerCount: number;
}

export const FactoryHRQuickBar: React.FC<FactoryHRQuickBarProps> = ({
  onOpenFactoryHR,
  workerCount,
}) => {
  return (
    <div className="w-full max-w-md mx-auto my-1 px-0.5">
      <div
        onClick={onOpenFactoryHR}
        className="bg-white text-[#1F2937] rounded-xl p-2.5 shadow-xs border border-gray-300 flex items-center justify-between cursor-pointer hover:border-gray-400 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 text-[#1F2937] border border-green-200 flex items-center justify-center font-black text-xs shadow-xs">
            🏭
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-[#1F2937] flex items-center gap-1.5">
              <span>Factory HR & Manpower</span>
              <span className="bg-green-100 text-[#16A34A] text-[9px] px-1.5 py-0.5 rounded-full border border-green-200 font-bold">
                {workerCount} Workers
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Gross, PF, ESI, OT & Salary Slip Calculator</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#16A34A] hover:bg-green-700 text-white text-xs font-black px-2.5 py-1.5 rounded-lg shadow-xs transition-all">
          <span>Open Portal</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
