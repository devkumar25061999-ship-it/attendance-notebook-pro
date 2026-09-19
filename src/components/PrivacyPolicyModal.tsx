import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1F2937] text-white border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
            <h2 className="text-base font-black text-white">
              Privacy Policy & Data Security
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-[#1F2937] leading-relaxed bg-white">
          <div className="bg-[#F3F4F6] border border-gray-200 p-3.5 rounded-2xl text-[#1F2937] font-medium">
            <strong className="text-[#16A34A]">Attendance Notebook Pro</strong> is committed to user privacy. We do not sell or transmit your personal attendance or notebook records to any third-party server.
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-[#1F2937] text-sm">
              1. Local Storage (Offline & Local Data)
            </h4>
            <p className="text-gray-600">
              All calendar markings, daily wages, overtime hours, notes, and work diary items are stored exclusively in your browser's local sandbox storage (LocalStorage). You retain complete control to backup (JSON) or wipe your records at any time.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-[#1F2937] text-sm">
              2. Camera & Face Punch Permissions
            </h4>
            <p className="text-gray-600">
              When optional Face Punch is enabled, camera permission is utilized strictly on-device to capture your verification selfie and stamp the entry time. No biometric facial recognition data or camera streams are uploaded to any external server.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-[#1F2937] text-sm">
              3. Google AdMob & Advertising
            </h4>
            <p className="text-gray-600">
              This app conforms strictly to Google Play Developer Policies and Google AdMob Partner Guidelines. Any displayed promotional units adhere to standard advertising disclosures and user consent guidelines.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-[#1F2937] text-sm">
              4. Contact & Support
            </h4>
            <p className="text-gray-600">
              For support or inquiries regarding Attendance Notebook Pro, users may contact the developer via Google Play Console listing or in-app support channels.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F3F4F6] border-t border-gray-200 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
