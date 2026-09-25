import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Radio, 
  ShieldCheck, 
  FileText,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Device, SharedFileItem } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  localDevice: Device;
  file?: SharedFileItem | null;
  isEncrypted: boolean;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  localDevice,
  file,
  isEncrypted
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Build pairing/share payload
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;
    
    let url = `${protocol}//${host}${port}/?peer=${localDevice.id}`;
    if (file) {
      url += `&file=${file.id}&name=${encodeURIComponent(file.name)}&size=${file.size}`;
    }

    setShareUrl(url);

    // Generate high-resolution QR Code
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    }).then((dataUri) => {
      setQrDataUrl(dataUri);
    }).catch(err => {
      console.error('[QR] Failed to generate QR:', err);
    });
  }, [isOpen, file, localDevice]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = file ? `drive-p2p-qr-${file.name}.png` : 'drive-p2p-device-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {file ? 'Direct File QR' : 'Pair via QR Code'}
              </h3>
              <p className="text-[10px] text-slate-400">Offline P2P Instant Transfer</p>
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
          {/* File or Device Info */}
          {file ? (
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center uppercase shrink-0">
                {file.extension.substring(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              {isEncrypted && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  AES-256
                </span>
              )}
            </div>
          ) : (
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs text-slate-600 flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Scan to pair with <strong>{localDevice.name}</strong></span>
            </div>
          )}

          {/* QR Code Canvas Card */}
          <div className="p-4 bg-white rounded-3xl border-2 border-slate-100 shadow-lg relative group">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Direct P2P QR Code" 
                className="w-56 h-56 rounded-xl object-contain mx-auto"
              />
            ) : (
              <div className="w-56 h-56 rounded-xl bg-slate-50 flex items-center justify-center">
                <Radio className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Point any phone camera or another laptop's Drive P2P scanner at this code to begin instant transfer on this Wi-Fi.
          </p>

          {/* URL text */}
          <div className="w-full flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pl-3">
            <span className="text-[11px] font-mono text-slate-500 truncate flex-1 text-left">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleDownloadQR}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR Image</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
