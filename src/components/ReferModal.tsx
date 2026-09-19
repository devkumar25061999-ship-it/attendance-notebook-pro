import React, { useState } from 'react';
import { Share2, X, Check, Copy, MessageSquare, CalendarCheck2, Clock, Camera, BookOpen } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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

  const shareText = `*Attendance Notebook Pro*\n\nTrack daily attendance, overtime, duty shifts, and salary calculations.\n\n📌 *Features:*\n• 1-Tap Attendance (Work, Half Day, Overtime, Leave)\n• Auto Salary & Overtime Calculation\n• Face Punch Attendance Camera\n• Notebook & Work Diary (Khata / Cash Advance)\n• HR Excel/CSV Report\n\n📲 App Link: ${currentUrl}`;

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // Fallback
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      return false;
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleNativeShare = async () => {
    // 1. Android Native Bridge
    if (typeof window !== 'undefined' && (window as any).AndroidNativePrint?.shareText) {
      try {
        (window as any).AndroidNativePrint.shareText(shareText, 'Refer Attendance Notebook Pro');
        return;
      } catch (err) {
        console.warn('AndroidNativePrint.shareText failed:', err);
      }
    }

    // 2. Capacitor Share Plugin
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: 'Attendance Notebook Pro',
          text: shareText,
          url: currentUrl,
          dialogTitle: 'Share App via',
        });
        return;
      } catch (err) {
        console.warn('Capacitor Share failed:', err);
      }
    }

    // 3. Web Share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Attendance Notebook Pro',
          text: shareText,
          url: currentUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    // 4. Fallback: Copy to clipboard
    handleCopy();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white text-[#1F2937] rounded-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#1F2937] px-3.5 py-2.5 flex items-center justify-between border-b border-gray-700 shrink-0 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black tracking-wide text-white leading-tight">
                  Refer to Friend
                </h2>
                <span className="bg-[#16A34A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  Share
                </span>
              </div>
              <p className="text-[10px] text-gray-300 font-medium leading-tight">
                Daily attendance & salary calculator app
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-0.5">
            Key Features:
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-xl p-2 flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1F2937] truncate">1-Tap Attendance</h4>
                <p className="text-[10px] text-gray-500 truncate">Work, Half Duty, Leave</p>
              </div>
            </div>

            <div className="bg-[#F3F4F6] border border-gray-200 rounded-xl p-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1F2937] truncate">Salary & OT</h4>
                <p className="text-[10px] text-gray-500 truncate">Daily wage + Overtime</p>
              </div>
            </div>

            <div className="bg-[#F3F4F6] border border-gray-200 rounded-xl p-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1F2937] truncate">Face Punch</h4>
                <p className="text-[10px] text-gray-500 truncate">Selfie photo log</p>
              </div>
            </div>

            <div className="bg-[#F3F4F6] border border-gray-200 rounded-xl p-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1F2937] truncate">Work Diary / Khata</h4>
                <p className="text-[10px] text-gray-500 truncate">Notes & advance ledger</p>
              </div>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] px-0.5">
              <span className="font-bold text-[#1F2937]">
                Message Preview:
              </span>
              <button
                onClick={handleCopy}
                className="text-[#16A34A] hover:text-green-700 flex items-center gap-1 font-semibold text-[11px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#F3F4F6] border border-gray-200 rounded-xl p-2 text-[11px] text-[#1F2937] font-mono line-clamp-2 leading-tight">
              {shareText}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-[#F3F4F6] border-t border-gray-200 space-y-1.5 shrink-0">
          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Share via WhatsApp</span>
          </button>

          {/* All apps button */}
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1F2937] hover:bg-gray-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via All Apps (Telegram / SMS / More)</span>
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-[#1F2937] font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link & Message Copied!' : 'Copy Link & Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
