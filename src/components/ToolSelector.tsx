import React from 'react';
import { TOOLS_CONFIG } from '../data/defaultData';
import { AttendanceStatus } from '../types';

interface ToolSelectorProps {
  selectedTool: AttendanceStatus;
  onSelectTool: (tool: AttendanceStatus) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  selectedTool,
  onSelectTool,
}) => {
  const statusTools = TOOLS_CONFIG.filter((t) => t.id !== 'clear');
  const clearTool = TOOLS_CONFIG.find((t) => t.id === 'clear');
  const isClearSelected = selectedTool === 'clear';

  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      {/* 8 Attendance Tools Grid */}
      <div className="grid grid-cols-4 gap-1">
        {statusTools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              id={`tool-btn-${tool.id}`}
              onClick={() => onSelectTool(tool.id)}
              className={`h-[36px] xs:h-[40px] sm:h-[44px] flex flex-col items-center justify-center p-0.5 rounded-lg transition-all active:scale-95 text-center overflow-hidden relative shadow-2xs ${
                tool.bgColor
              } ${
                isSelected
                  ? 'ring-2 ring-slate-950 border-2 border-slate-950 shadow-xs font-black scale-[1.02]'
                  : 'border border-slate-300 hover:border-slate-400 font-bold'
              }`}
            >
              {isSelected && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-slate-950"></span>
              )}
              <span className="text-xs xs:text-sm leading-none mb-0.5">
                {tool.icon}
              </span>
              <span className="text-[9.5px] xs:text-[10px] text-slate-900 font-black leading-none truncate w-full px-0.5">
                {tool.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clear / Erase Mode Bar */}
      {clearTool && (
        <div className="mt-1">
          <button
            id="tool-btn-clear"
            type="button"
            onClick={() => onSelectTool(isClearSelected ? 'work' : 'clear')}
            className={`w-full py-1 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all active:scale-98 text-[11px] font-black shadow-2xs ${
              isClearSelected
                ? 'bg-rose-600 border-rose-700 text-white ring-2 ring-rose-500 shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
            }`}
          >
            <span className="text-xs">🧹</span>
            <span>
              {isClearSelected
                ? 'Clear Mode ON (Tap date to erase)'
                : 'Clear / Erase Mode'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
