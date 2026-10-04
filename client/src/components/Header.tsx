import React, { useState } from 'react';
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
  Laptop,
  Menu,
  X,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon
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
  openHelpModal?: () => void;
  onOpenMobileMenu?: () => void;
  toggleInfoPanel?: () => void;
  isInfoPanelOpen?: boolean;
  user?: User | null;
  isGuest?: boolean;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  activeFilter?: string;
  setActiveFilter?: (filter: string) => void;
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
  openHelpModal,
  onOpenMobileMenu,
  toggleInfoPanel,
  isInfoPanelOpen,
  user,
  isGuest,
  onLogout,
  onOpenAuth,
  activeFilter = 'all',
  setActiveFilter
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'All files' },
    { id: 'docs', label: 'Documents (PDF, DOCX)', icon: FileText },
    { id: 'sheets', label: 'Spreadsheets (XLSX, CSV)', icon: FileSpreadsheet },
    { id: 'images', label: 'Images (PNG, JPG)', icon: ImageIcon },
    { id: 'archives', label: 'Archives (ZIP, RAR)', icon: FileArchive }
  ];

  return (
    <header className="h-16 bg-[#f8fafc] px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 shrink-0 select-none border-b border-slate-200/60 w-full max-w-full">
      {/* Mobile Hamburger Menu & Mobile Brand */}
      <div className="flex items-center gap-2 md:hidden">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200/80 bg-white flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Drive P2P" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Google Drive Search Bar with Working Filter Dropdown */}
      <div className="flex-1 max-w-2xl relative min-w-0">
        <div className="w-full h-10 sm:h-11 bg-white border border-slate-200 rounded-full flex items-center px-3 sm:px-4 shadow-xs focus-within:shadow-md focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2 sm:mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Drive..."
            className="w-full text-xs bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-800 min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {setActiveFilter && (
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                title="Search and filter options"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  activeFilter !== 'all' || isFilterDropdownOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Working Search Filter Popover */}
              {isFilterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-10 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Filter by Type
                    </div>
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setActiveFilter(opt.id);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          activeFilter === opt.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {activeFilter === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Drive Right Control Icons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Offline Status Checkmark */}
        <div 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold"
          title="Ready for offline file transfers over local Wi-Fi and WebRTC"
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
          <span className="hidden lg:inline text-[11px]">Ready for offline</span>
        </div>

        {/* E2EE Toggle */}
        <button
          onClick={openEncryptionModal}
          title={isEncrypted ? 'AES-256 E2EE Enabled' : 'AES-256 Encryption Disabled'}
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
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>
        )}

        {/* Info / Activity Inspector Toggle `(i)` */}
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

        {/* Help & Support Button */}
        {openHelpModal && (
          <button
            onClick={openHelpModal}
            title="Drive P2P Help, Documentation & Support"
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-blue-600" />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={openEncryptionModal}
          title="Security & Network Settings"
          className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Google Drive User Account Menu */}
        <div className="relative pl-1">
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-4 hover:ring-slate-100 transition-all cursor-pointer"
            title={user ? `${user.name} (${user.email})` : 'Account menu'}
          >
            <div 
              style={{ backgroundColor: user?.avatarColor || '#2563eb' }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white font-extrabold flex items-center justify-center text-xs sm:text-sm shadow-sm"
            >
              {user ? user.name.charAt(0).toUpperCase() : localDevice.name.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Account Card Popover */}
          {isAccountMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsAccountMenuOpen(false)}
              />
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
                  {/* Clickable User Email */}
                  {user ? (
                    <a 
                      href={`mailto:${user.email}`} 
                      className="text-xs text-blue-600 hover:underline mt-0.5"
                      title="Send email"
                    >
                      {user.email}
                    </a>
                  ) : (
                    <a
                      href="mailto:support@drivep2p.local"
                      className="text-xs text-slate-400 hover:text-blue-600 hover:underline mt-0.5"
                    >
                      Local Wi-Fi Mode
                    </a>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span>{localDevice.name}</span>
                  </div>
                </div>

                {/* Account Actions */}
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

                  {openHelpModal && (
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openHelpModal();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Support & Knowledge Base</span>
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
