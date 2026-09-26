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
  Info,
  Camera,
  LogOut,
  UserPlus,
  Shield,
  Laptop
} from 'lucide-react';
import { Device, User } from '../types';

interface HeaderProps {
  localDevice: Device;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSignalingConnected: boolean;
  isEncrypted: boolean;
  openEncryptionModal: () => void;
  openDirectConnectModal: () => void;
  openUploadModal: () => void;
  openQRModal?: () => void;
  openQRScanner?: () => void;
  toggleInfoPanel?: () => void;
  isInfoPanelOpen?: boolean;
  user?: User | null;
  isGuest?: boolean;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  localDevice,
  searchQuery,
  setSearchQuery,
  isSignalingConnected,
  isEncrypted,
  openEncryptionModal,
  openDirectConnectModal,
  openQRModal,
  openQRScanner,
  toggleInfoPanel,
  isInfoPanelOpen,
  user,
  isGuest,
  onLogout,
  onOpenAuth
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
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

        {/* Show My Device QR */}
        {openQRModal && (
          <button
            onClick={openQRModal}
            title="Show Device Pairing QR Code"
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
          </button>
        )}

        {/* Scan QR Code Button */}
        {openQRScanner && (
          <button
            onClick={openQRScanner}
            title="Scan QR Code to Receive File"
            className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Scan QR</span>
          </button>
        )}

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

        {/* Google Drive User Account Menu */}
        <div className="relative pl-2">
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-4 hover:ring-slate-100 transition-all cursor-pointer"
            title={user ? `${user.name} (${user.email})` : 'Account menu'}
          >
            <div 
              style={{ backgroundColor: user?.avatarColor || '#2563eb' }}
              className="w-9 h-9 rounded-full text-white font-extrabold flex items-center justify-center text-sm shadow-sm"
            >
              {user ? user.name.charAt(0).toUpperCase() : localDevice.name.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Google Drive Account Card Popover */}
          {isAccountMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsAccountMenuOpen(false)}
              ></div>
              <div className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {/* Account Details */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                  <div 
                    style={{ backgroundColor: user?.avatarColor || '#2563eb' }}
                    className="w-16 h-16 rounded-full text-white font-black text-2xl flex items-center justify-center shadow-md mb-3"
                  >
                    {user ? user.name.charAt(0).toUpperCase() : localDevice.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {user ? user.name : 'Offline Guest Device'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user ? user.email : 'Local Wi-Fi Mode'}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span>{localDevice.name}</span>
                  </div>
                </div>

                {/* Account Switcher Options */}
                <div className="py-2 space-y-1">
                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-slate-400" />
                      <span>{user ? 'Switch / Add another account' : 'Sign in with an account'}</span>
                    </button>
                  )}

                  {onLogout && user && !isGuest && (
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign out of Drive P2P</span>
                    </button>
                  )}
                </div>

                {/* Footer Security Badge */}
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Shield className="w-3 h-3" /> P2P Identity Active
                  </span>
                  <span>Zero Cloud</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
