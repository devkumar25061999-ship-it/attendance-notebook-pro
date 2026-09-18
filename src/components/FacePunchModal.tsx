import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RefreshCw, AlertCircle, SwitchCamera, Upload, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FacePunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  existingPhoto?: string;
  onPunchSuccess: (photoDataUrl: string, timeStr: string) => void;
}

export const FacePunchModal: React.FC<FacePunchModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingPhoto,
  onPunchSuccess,
}) => {
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

  // Time ticker
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  // Initial photo setup when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingPhoto) {
        setCapturedPhoto(existingPhoto);
      } else {
        setCapturedPhoto(null);
      }
    }
  }, [isOpen, existingPhoto]);

  // Start Camera Stream
  const startCamera = async (facing: 'user' | 'environment') => {
    try {
      setCameraLoading(true);
      setCameraError(null);

      // Stop any existing stream
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
      setCameraError(
        'Live camera stream blocked or unsupported. Use "Take Photo with Phone Camera" below.'
      );
    }
  };

  // Trigger camera on open
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCameraActive(false);
      setCameraError(null);
      return;
    }

    if (!existingPhoto) {
      startCamera(facingMode);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Attach stream to video element whenever stream changes or video element mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => {
          setCameraActive(true);
        })
        .catch((err) => {
          console.warn('Video play caught:', err);
        });
    }
  }, [stream]);

  if (!isOpen) return null;

  // Toggle front/back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Capture from live video stream
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
        // If front camera, flip horizontally to match mirror preview
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);

        // Reset transform
        if (facingMode === 'user') {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // Add biometric timestamp banner on the photo
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, height - 44, width, 44);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`PUNCH: ${selectedDate} ${currentTime}`, 16, height - 18);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);

        // Stop stream to save battery and show captured photo
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
          setCameraActive(false);
        }
      }
    }
  };

  // Direct native camera shutter handler via <input type="file" capture="user">
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);

          // Stamp date & time
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.fillRect(0, h - 44, w, 44);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(`PUNCH: ${selectedDate} ${currentTime}`, 16, h - 18);

          const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedPhoto(photoUrl);

          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            setCameraActive(false);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm punch and send to App state
  const handleConfirmPunch = () => {
    if (!capturedPhoto) return;
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    onPunchSuccess(capturedPhoto, currentTime);
    onClose();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] text-white rounded-3xl w-full max-w-sm max-h-[94vh] flex flex-col shadow-2xl border-2 border-purple-500/60 overflow-hidden">
        {/* Header */}
        <div className="bg-[#18112e] px-4 py-3 flex items-center justify-between border-b border-purple-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/80 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white leading-tight">
                Face Punch Verification
              </h3>
              <span className="text-[10px] text-purple-300 font-medium">
                Camera Selfie Attendance
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950 hover:bg-purple-900 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="p-4 flex flex-col items-center justify-center bg-[#06080e] overflow-y-auto">
          {/* Real-time Clock */}
          <div className="text-center mb-2.5">
            <div className="text-2xl font-mono font-black text-amber-400 tracking-wider drop-shadow-xs">
              {currentTime}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {selectedDate} • GPS Biometric Log
            </div>
          </div>

          {/* Biometric Circular Frame */}
          <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_28px_rgba(168,85,247,0.45)] flex items-center justify-center bg-slate-900 shrink-0">
            {/* Captured Photo View */}
            {capturedPhoto ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedPhoto}
                  alt="Captured Selfie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap">
                  <Check className="w-3 h-3" />
                  <span>Photo Captured</span>
                </div>
              </div>
            ) : (
              <>
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  } ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* Loading / Placeholder State */}
                {!cameraActive && (
                  <div className="p-4 text-center text-xs text-slate-300 flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-purple-400 mb-2 animate-pulse" />
                    {cameraLoading ? (
                      <span className="font-semibold text-purple-300">
                        Starting camera...
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-white mb-1">
                          Camera View
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Align face inside circle
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Target Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-300/40 rounded-full m-3"></div>
              </>
            )}

            {/* Switch Camera Button (Front/Back) */}
            {!capturedPhoto && cameraActive && (
              <button
                type="button"
                onClick={handleToggleCamera}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-purple-400/50 shadow-md transition-all active:scale-95"
                title="Switch Camera (Flip front/back)"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden File Input for Native Camera Shutter */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleNativeCameraCapture}
          />

          {/* Fallback Notice if live stream is blocked */}
          {cameraError && !capturedPhoto && (
            <div className="mt-2.5 text-[11px] text-amber-200 text-center px-3 py-1.5 bg-amber-950/50 rounded-xl border border-amber-700/50 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Use device camera button below to snap your photo.</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-3.5 bg-[#121726] border-t border-slate-800 space-y-2 shrink-0">
          {!capturedPhoto ? (
            <div className="space-y-2">
              {/* If camera stream is active, show Snap Shutter Button */}
              {cameraActive ? (
                <button
                  type="button"
                  onClick={handleCaptureStream}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              ) : null}

              {/* Native Device Camera Shutter (Works 100% on all mobile devices & iframe) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
                  cameraActive
                    ? 'bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/40'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3'
                }`}
              >
                <Camera className="w-4 h-4 text-purple-300" />
                <span>
                  {cameraActive ? 'Or Take with Device Camera' : '📸 Open Device Camera'}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmPunch}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Punch Attendance</span>
              </button>

              <button
                type="button"
                onClick={handleRetake}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
