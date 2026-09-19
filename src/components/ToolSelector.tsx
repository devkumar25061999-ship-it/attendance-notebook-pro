import React from 'react';
import { TOOLS_CONFIG } from '../data/defaultData';
import { AttendanceStatus } from '../types';
import { Language } from '../utils/translations';

interface ToolSelectorProps {
  selectedTool: AttendanceStatus;
  onSelectTool: (tool: AttendanceStatus) => void;
  lang?: Language;
}

const TOOL_NAMES_HI: Record<string, string> = {
  work: 'हाजिरी (P)',
  half_duty: 'हाफ ड्यूटी',
  overtime: 'ओवरटाइम',
  holiday: 'छुट्टी (H)',
  absent: 'गैरहाजिर (A)',
  advance: 'एडवांस',
  extra_pay: 'बोनस',
  note: 'नोट',
  clear: 'मिटाएं (Clear)',
};

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  selectedTool,
  onSelectTool,
  lang = 'en',
}) => {
  const statusTools = TOOLS_CONFIG.filter((t) => t.id !== 'clear');
  const clearTool = TOOLS_CONFIG.find((t) => t.id === 'clear');
  const isClearSelected = selectedTool === 'clear';

  return (
    <div className="w-full px-1 sm:px-2 max-w-md mx-auto my-0.5 shrink-0">
      {/* Attendance Tools Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {statusTools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          const displayName = lang === 'hi' ? (TOOL_NAMES_HI[tool.id] || tool.name) : tool.name;

          return (
            <button
              key={tool.id}
              id={`tool-btn-${tool.id}`}
              onClick={() => onSelectTool(tool.id)}
              className={`h-[35px] xs:h-[38px] sm:h-[42px] flex flex-col items-center justify-center p-0.5 rounded-lg transition-all active:scale-95 text-center overflow-hidden relative shadow-2xs ${
                tool.bgColor
              } ${
                isSelected
                  ? 'ring-2 ring-[#1F2937] border-2 border-[#1F2937] shadow-xs font-black scale-[1.02]'
                  : 'border border-gray-300 hover:border-gray-400 font-bold'
              }`}
            >
              {isSelected && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#1F2937]"></span>
              )}
              <span className="text-xs xs:text-sm leading-none mb-0.5">
                {tool.icon}
              </span>
              <span className="text-[9.5px] xs:text-[10px] text-[#1F2937] font-black leading-none truncate w-full px-0.5">
                {displayName}
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
                ? 'bg-[#DC2626] border-red-700 text-white ring-2 ring-red-500 shadow-xs'
                : 'bg-red-50 hover:bg-red-100 border-[#DC2626] text-[#DC2626]'
            }`}
          >
            <span className="text-xs">🧹</span>
            <span>
              {isClearSelected
                ? (lang === 'hi' ? 'मिटाने का मोड चालू है (तारीख दबाकर हटाएं)' : 'Clear Mode ON (Tap date to erase)')
                : (lang === 'hi' ? 'हटाएं / क्लियर मोड' : 'Clear / Erase Mode')}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
