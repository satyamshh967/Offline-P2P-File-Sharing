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
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openUploadModal: () => void;
  openEncryptionModal: () => void;
  discoveredCount: number;
  activeTransfersCount: number;
  isEncrypted: boolean;
  totalTransferredBytes: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openUploadModal,
  openEncryptionModal,
  discoveredCount,
  activeTransfersCount,
  isEncrypted,
  totalTransferredBytes
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

  return (
    <aside className="w-64 bg-[#f8fafc] border-r border-slate-200/80 flex flex-col justify-between h-screen shrink-0 select-none">
      <div>
        {/* Google Drive styled Brand Header with User's custom Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-200/60 bg-white">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0 border border-slate-100 bg-white">
            <img 
              src="/logo.png" 
              alt="Drive P2P Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xl tracking-tight text-slate-800">Drive</span>
            <span className="px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md bg-amber-50 text-amber-700 border border-amber-200/70">
              P2P
            </span>
          </div>
        </div>

        {/* Google Drive Iconic "+ New" Button */}
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

            {/* "+ New" Dropdown Menu */}
            {isNewMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsNewMenuOpen(false)}
                ></div>
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
                  <div className="my-1 border-t border-slate-100"></div>
                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setCurrentTab('computers');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-indigo-600" />
                    <span>Scan nearby devices</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Google Drive Navigation Categories */}
        <div className="px-3 space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
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

      {/* Google Drive Bottom Storage Bar */}
      <div className="p-4 border-t border-slate-200/80 bg-white">
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span>Offline Cache</span>
            </span>
            <span className="font-bold text-slate-900">{formatSize(totalTransferredBytes)}</span>
          </div>

          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(15, (totalTransferredBytes / (1024 * 1024 * 1024)) * 10))}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>IndexedDB Storage</span>
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
      </div>
    </aside>
  );
};
