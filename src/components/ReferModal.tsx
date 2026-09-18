import React, { useState } from 'react';
import { Share2, X, Check, Copy, MessageSquare, Send, CalendarCheck2, Clock, Camera, FileSpreadsheet, BookOpen } from 'lucide-react';

interface ReferModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
}

export const ReferModal: React.FC<ReferModalProps> = ({
  isOpen,
  onClose,
  appName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://attendanceplus.app';

  const shareText = `*Attendance Notebook Pro*\n\nHello! Check out this easy and reliable app to track daily attendance, shifts, overtime, and daily wage calculations.\n\n📌 *Key Features:*\n• 1-Tap Attendance (Work, Half Day, Overtime, Leave)\n• Automated Salary & Overtime Calculator\n• Face Punch Camera Attendance\n• Integrated Notebook & Work Diary (Khata / Cash Advance)\n• HR Excel/CSV Report Export\n\n📲 App Link: ${currentUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Attendance Notebook Pro',
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a2233] text-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border-2 border-emerald-500/40 overflow-hidden">
        {/* Top Banner with Green Header matching screenshot */}
        <div className="bg-[#0f5132] px-5 py-4 flex items-center justify-between border-b border-emerald-600/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wide text-white">
                  Refer to Friend
                </h2>
                <span className="bg-emerald-700/80 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Share App
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Share with colleagues • Simple attendance & salary tracker
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-emerald-700 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#141b29]">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            App Highlights & Features:
          </div>

          {/* Feature Highlights */}
          <div className="space-y-2">
            <div className="bg-[#1f293d] border border-slate-700/70 rounded-2xl p-3 flex items-start gap-3">
              <CalendarCheck2 className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  1-Tap Attendance
                </h4>
                <p className="text-xs text-slate-300">
                  Work, Half Duty, Holiday & Sick Leave
                </p>
              </div>
            </div>

            <div className="bg-[#1f293d] border border-slate-700/70 rounded-2xl p-3 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Salary & OT Calculator
                </h4>
                <p className="text-xs text-slate-300">
                  Daily wage + automated overtime calculation
                </p>
              </div>
            </div>

            <div className="bg-[#1f293d] border border-slate-700/70 rounded-2xl p-3 flex items-start gap-3">
              <Camera className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Face Punch Duty
                </h4>
                <p className="text-xs text-slate-300">
                  Camera selfie with verified timestamp log
                </p>
              </div>
            </div>

            <div className="bg-[#1f293d] border border-slate-700/70 rounded-2xl p-3 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Notebook & Work Diary
                </h4>
                <p className="text-xs text-slate-300">
                  Daily work notes, site log & cash advance ledger
                </p>
              </div>
            </div>

            <div className="bg-[#1f293d] border border-slate-700/70 rounded-2xl p-3 flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  HR Excel Report
                </h4>
                <p className="text-xs text-slate-300">
                  Export CSV/Excel for contractor or HR manager
                </p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-300">
                Referral Message Preview:
              </span>
              <button
                onClick={handleCopy}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#0f141f] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed">
              {shareText}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#111622] border-t border-slate-800 space-y-2">
          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950" />
            <span>Share via WhatsApp</span>
          </button>

          {/* All apps button */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via All Apps</span>
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-[#283247] hover:bg-[#323e59] text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Link & Message Copied!' : 'Copy Link & Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
