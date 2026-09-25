import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  X, 
  Camera, 
  Upload, 
  AlertCircle, 
  Check, 
  RefreshCw,
  Zap,
  Radio
} from 'lucide-react';

interface ScannedResult {
  peerId?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  rawUrl: string;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanned: (result: ScannedResult) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanned
}) => {
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [detectedText, setDetectedText] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    setIsScanning(true);
    setDetectedText('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser/environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanLoop();
      }
    } catch (err: any) {
      console.warn('[QR Scanner] Camera start error:', err);
      setHasCamera(false);
      setCameraError(err.message || 'Unable to access camera');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleCodeDetected(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  };

  const handleCodeDetected = (urlOrPayload: string) => {
    setIsScanning(false);
    setDetectedText(urlOrPayload);
    stopCamera();

    // Parse URL params if applicable
    let peerId: string | undefined;
    let fileId: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;

    try {
      const url = new URL(urlOrPayload);
      peerId = url.searchParams.get('peer') || undefined;
      fileId = url.searchParams.get('file') || undefined;
      fileName = url.searchParams.get('name') || undefined;
      const sizeStr = url.searchParams.get('size');
      if (sizeStr) fileSize = parseInt(sizeStr);
    } catch (e) {
      // Raw string payload fallback
    }

    setTimeout(() => {
      onScanned({
        peerId,
        fileId,
        fileName,
        fileSize,
        rawUrl: urlOrPayload
      });
      onClose();
    }, 600);
  };

  // Image Upload Fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleCodeDetected(code.data);
        } else {
          alert('No valid QR code found in the selected image. Please try another.');
        }
      }
    };
    img.src = URL.createObjectURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Scan QR Code</h3>
              <p className="text-[10px] text-slate-400">Pair & Receive Files Instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Scanner Viewport */}
          <div className="relative w-64 h-64 bg-slate-950 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-100">
            {hasCamera ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Reticle & Laser */}
                <div className="absolute inset-6 border-2 border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-blue-500 shadow-lg shadow-blue-500/80 animate-bounce"></div>
                  {/* Corner marks */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                </div>

                {detectedText && (
                  <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-4">
                    <Check className="w-10 h-10 mb-2 stroke-[3]" />
                    <span className="font-bold text-sm">QR Code Detected!</span>
                    <span className="text-xs text-emerald-100">Connecting via WebRTC...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs">{cameraError || 'Camera unavailable'}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Image</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Position the QR code inside the frame to connect directly and begin receiving the file.
          </p>

          {/* Hidden File Input for QR Image Upload fallback */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload an image with a QR code instead</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
