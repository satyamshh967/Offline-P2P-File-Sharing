import React, { useState } from 'react';
import { 
  Folder, 
  Home, 
  Monitor, 
  Users, 
  Clock, 
  Star, 
  Trash2, 
  HardDrive, 
  Plus, 
  ShieldCheck, 
  Radio, 
  ArrowLeftRight,
  Upload,
  FolderPlus,
  Archive,
  ChevronDown,
  Camera,
  QrCode,
  X,
  HelpCircle,
  Github
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openUploadModal: () => void;
  openEncryptionModal: () => void;
  openQRModal?: () => void;
  openQRScanner?: () => void;
  openHelpModal?: () => void;
  discoveredCount: number;
  activeTransfersCount: number;
  isEncrypted: boolean;
  totalTransferredBytes: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openUploadModal,
  openEncryptionModal,
  openQRModal,
  openQRScanner,
  openHelpModal,
  discoveredCount,
  activeTransfersCount,
  isEncrypted,
  totalTransferredBytes,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-drive', label: 'My Drive', icon: HardDrive },
    { id: 'computers', label: 'Nearby Devices (LAN)', icon: Monitor, badge: discoveredCount },
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'transfers', label: 'Offline Transfers', icon: ArrowLeftRight, badge: activeTransfersCount, isHighlight: true },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  const handleTabSelect = (tabId: string) => {
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#f8fafc] border-r border-slate-200/80 flex flex-col justify-between h-screen shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Clickable Brand Header / Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60 bg-white">
            <button
              onClick={() => handleTabSelect('my-drive')}
              title="Drive P2P Home - Go to My Drive"
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0 border border-slate-100 bg-white group-hover:scale-105 transition-transform">
                <img 
                  src="/logo.png" 
                  alt="Drive P2P Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                  Drive
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md bg-amber-50 text-amber-700 border border-amber-200/70">
                  P2P
                </span>
              </div>
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* "+ New" Action Button */}
          <div className="p-4 relative">
            <div className="relative">
              <button
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                className="w-40 h-12 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg border border-slate-200/90 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-sm">New</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isNewMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsNewMenuOpen(false)}
                  />
                  <div className="absolute top-14 left-0 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        openUploadModal();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>File upload</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        openUploadModal();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-amber-500" />
                      <span>Folder upload</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    {openQRScanner && (
                      <button
                        onClick={() => {
                          setIsNewMenuOpen(false);
                          openQRScanner();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>Scan QR to receive file</span>
                      </button>
                    )}
                    {openQRModal && (
                      <button
                        onClick={() => {
                          setIsNewMenuOpen(false);
                          openQRModal();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span>Show pairing QR code</span>
                      </button>
                    )}
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setIsNewMenuOpen(false);
                        handleTabSelect('computers');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <Radio className="w-4 h-4 text-emerald-600" />
                      <span>Scan nearby devices</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-100/70 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-700 stroke-[2.5]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isHighlight 
                        ? 'bg-blue-600 text-white animate-pulse' 
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Storage & Footer Links */}
        <div className="p-4 border-t border-slate-200/80 bg-white space-y-3">
          {/* Storage Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Offline Cache</span>
              </span>
              <span className="font-bold text-slate-900">{formatSize(totalTransferredBytes)}</span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(15, (totalTransferredBytes / (1024 * 1024 * 1024)) * 10))}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>IndexedDB Cache</span>
              <span className="text-emerald-600 font-bold">100% Offline</span>
            </div>
          </div>

          {/* E2EE Toggle Button */}
          <button
            onClick={openEncryptionModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isEncrypted ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>AES-256 E2EE</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isEncrypted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-200 text-slate-600'
            }`}>
              {isEncrypted ? 'Secured' : 'Off'}
            </span>
          </button>

          {/* Functional Footer Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            {openHelpModal && (
              <button
                onClick={openHelpModal}
                className="hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help & Docs</span>
              </button>
            )}

            <a
              href="https://github.com/satyamshh967/Offline-P2P-File-Sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 flex items-center gap-1 transition-colors"
              title="Open GitHub repository"
            >
              <Github className="w-3.5 h-3.5" />
              <span>v1.0</span>
            </a>
          </div>

          {/* Dynamic Copyright Year */}
          <div className="text-[10px] text-slate-400 text-center">
            &copy; {new Date().getFullYear()} Drive P2P
          </div>
        </div>
      </aside>
    </>
  );
};
