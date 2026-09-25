import React from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  HelpCircle, 
  Settings, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Wifi, 
  WifiOff,
  Info
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
  toggleInfoPanel?: () => void;
  isInfoPanelOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  localDevice,
  searchQuery,
  setSearchQuery,
  isSignalingConnected,
  isEncrypted,
  openEncryptionModal,
  openDirectConnectModal,
  toggleInfoPanel,
  isInfoPanelOpen
}) => {
  return (
    <header className="h-16 bg-[#f8fafc] px-6 flex items-center justify-between gap-6 shrink-0 select-none border-b border-slate-200/60">
      {/* Google Drive Iconic Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <div className="w-full h-11 bg-white border border-slate-200 rounded-full flex items-center px-4 shadow-xs focus-within:shadow-md focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Drive (files, peers, or checksums)..."
            className="w-full text-xs bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-800"
          />
          <button 
            type="button" 
            title="Search options"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Google Drive Right Control Icons */}
      <div className="flex items-center gap-2">
        {/* Offline Status Checkmark (Google Drive offline ready badge) */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold"
          title="Ready for offline file transfers"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Ready for offline</span>
        </div>

        {/* E2EE Toggle */}
        <button
          onClick={openEncryptionModal}
          title="Toggle AES-256 Encryption"
          className={`p-2 rounded-full border transition-all cursor-pointer ${
            isEncrypted 
              ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
          }`}
        >
          {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* LAN Direct Connect QR */}
        <button
          onClick={openDirectConnectModal}
          title="Connect via IP or Direct Code"
          className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Info Panel Toggle `(i)` (Google Drive inspector) */}
        {toggleInfoPanel && (
          <button
            onClick={toggleInfoPanel}
            title="View Details"
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isInfoPanelOpen
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        {/* Settings */}
        <button
          onClick={openEncryptionModal}
          title="Drive P2P Settings"
          className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User / Local Device Avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
              {localDevice.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
