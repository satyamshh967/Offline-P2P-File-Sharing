import React from 'react';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Laptop, 
  Smartphone, 
  Globe, 
  Bell, 
  QrCode,
  Link
} from 'lucide-react';
import { Device } from '../types';

interface HeaderProps {
  localDevice: Device;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSignalingConnected: boolean;
  isEncrypted: boolean;
  openEncryptionModal: () => void;
  openDirectConnectModal: () => void;
  openUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  localDevice,
  searchQuery,
  setSearchQuery,
  isSignalingConnected,
  isEncrypted,
  openEncryptionModal,
  openDirectConnectModal,
  openUploadModal
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between gap-6 shrink-0 select-none">
      {/* Search Input (matching Reference 1 & 2) */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your files, devices, or transfers..."
          className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Signaling Network Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-600">
          {isSignalingConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 font-semibold">LAN Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-amber-700 font-semibold">Offline Direct</span>
            </>
          )}
        </div>

        {/* E2EE Toggle Badge */}
        <button
          onClick={openEncryptionModal}
          title="Toggle End-to-End Encryption"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isEncrypted
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          {isEncrypted ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isEncrypted ? 'E2EE AES-256' : 'Unencrypted'}</span>
        </button>

        {/* Direct Connect / LAN IP */}
        <button
          onClick={openDirectConnectModal}
          title="Connect via IP or Direct Code"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/70"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* User / Local Device Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {localDevice.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
              <span>{localDevice.name}</span>
              <span className="text-[10px] font-normal text-slate-400">({localDevice.browser})</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              ID: {localDevice.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
