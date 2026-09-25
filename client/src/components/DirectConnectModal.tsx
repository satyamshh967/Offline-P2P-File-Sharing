import React, { useState } from 'react';
import { QrCode, Server, X, Check, Globe, Laptop, Smartphone } from 'lucide-react';
import { signalingService } from '../services/signaling';

interface DirectConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
}

export const DirectConnectModal: React.FC<DirectConnectModalProps> = ({
  isOpen,
  onClose,
  localIp
}) => {
  const [customHost, setCustomHost] = useState('');
  const [customPort, setCustomPort] = useState('3001');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConnectCustom = () => {
    if (customHost.trim()) {
      signalingService.setServerHost(customHost.trim(), parseInt(customPort) || 3001);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">Direct Network Connect</h3>
              <p className="text-[11px] text-slate-400">Share with other phones & laptops on Wi-Fi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Share Link */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Access URL for Local Network</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
              />
              <button
                onClick={copyUrl}
                className="px-3.5 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Open this URL on any phone or PC on the same Wi-Fi network.</p>
          </div>

          {/* Connect to Custom Signaling Server */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Connect to Remote Signaling Server</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="192.168.1.X"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                className="col-span-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
              <input
                type="text"
                placeholder="3001"
                value={customPort}
                onChange={(e) => setCustomPort(e.target.value)}
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleConnectCustom}
            disabled={!customHost.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
          >
            Connect Server
          </button>
        </div>
      </div>
    </div>
  );
};
