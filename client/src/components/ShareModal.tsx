import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Link, 
  Check, 
  ShieldCheck, 
  Send, 
  Radio, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Lock, 
  Globe,
  Share2,
  Copy
} from 'lucide-react';
import { Device, SharedFileItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: SharedFileItem | null;
  devices: Device[];
  onSendToPeers: (file: SharedFileItem, peerIds: string[], isEncrypted: boolean) => void;
  isEncrypted: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  file,
  devices,
  onSendToPeers,
  isEncrypted: defaultEncrypted
}) => {
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [encrypted, setEncrypted] = useState<boolean>(defaultEncrypted);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [broadcastMode, setBroadcastMode] = useState<boolean>(false);

  if (!isOpen || !file) return null;

  const togglePeer = (id: string) => {
    setSelectedPeers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBroadcastToggle = () => {
    if (!broadcastMode) {
      setSelectedPeers(devices.map(d => d.id));
      setBroadcastMode(true);
    } else {
      setSelectedPeers([]);
      setBroadcastMode(false);
    }
  };

  const handleSend = () => {
    if (selectedPeers.length === 0) return;
    onSendToPeers(file, selectedPeers, encrypted);
    onClose();
  };

  const handleCopyLink = () => {
    const directUrl = `${window.location.origin}/#file=${file.id}&hash=${file.size}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-purple-600" />;
      default:
        return <Laptop className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Google Drive Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-800 truncate">
                Share "{file.name}"
              </h3>
              <p className="text-xs text-slate-400">Offline P2P Local Network Direct Share</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Add Nearby Devices (Google Drive People Input) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Discovered Devices on Wi-Fi ({devices.length})
              </label>
              {devices.length > 0 && (
                <button
                  type="button"
                  onClick={handleBroadcastToggle}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  {broadcastMode ? 'Deselect All' : 'Broadcast to All Nearby'}
                </button>
              )}
            </div>

            {devices.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-3">
                <Radio className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                <div>
                  <p className="font-semibold">No nearby devices detected</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Open Drive P2P on another laptop, phone, or tablet connected to this Wi-Fi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {devices.map((device) => {
                  const isChecked = selectedPeers.includes(device.id);
                  return (
                    <div
                      key={device.id}
                      onClick={() => togglePeer(device.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/60 font-semibold text-blue-900 shadow-2xs'
                          : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{device.name}</p>
                          <p className="text-[11px] text-slate-400 capitalize">{device.os} • {device.browser}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {device.ip ? device.ip.replace('::ffff:', '') : 'Local IP'}
                        </span>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Google Drive "General Access" Card */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              General Access
            </label>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Local Network (Zero Cloud)</h4>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                    Offline Direct
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Anyone on this Wi-Fi / hotspot can receive direct encrypted chunks via WebRTC Data Channels.
                </p>
              </div>
            </div>

            {/* End-to-End Encryption Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  encrypted ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">End-to-End Encryption</h4>
                  <p className="text-[11px] text-slate-400">Web Crypto AES-GCM 256-Bit zero-trust</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={encrypted}
                  onChange={(e) => setEncrypted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Google Drive Footer: Copy Link & Send Button */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link copied!' : 'Copy offline link'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={selectedPeers.length === 0}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send P2P ({selectedPeers.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
