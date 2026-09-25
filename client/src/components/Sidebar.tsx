import React from 'react';
import { 
  Folder, 
  Image, 
  FileText, 
  Layers, 
  Palette, 
  FolderArchive, 
  Radio, 
  ArrowLeftRight, 
  Plus, 
  HardDrive,
  ShieldCheck,
  Server
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
  const folders = [
    { id: 'files', label: 'All Files', icon: Folder, color: 'text-blue-500 bg-blue-50' },
    { id: 'images', label: 'Images', icon: Image, color: 'text-rose-500 bg-rose-50' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'text-sky-500 bg-sky-50' },
    { id: 'projects', label: 'Projects', icon: Layers, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'design', label: 'Design', icon: Palette, color: 'text-amber-500 bg-amber-50' },
    { id: 'other', label: 'Other', icon: FolderArchive, color: 'text-slate-500 bg-slate-50' },
  ];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="m12 12 4 4" />
              <path d="M12 12v9" />
              <path d="m8 16 4-4" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">FILE<span className="text-blue-600">UP</span></span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-blue-50 text-blue-600 border border-blue-200/60">P2P</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-4">
          <button
            onClick={openUploadModal}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="px-4 py-2 space-y-6">
          {/* Network & Transfer Views */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2">
              Network & Transfers
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentTab('radar')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'radar'
                    ? 'bg-blue-50/80 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <span>Device Radar</span>
                </div>
                {discoveredCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                    {discoveredCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('transfers')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'transfers'
                    ? 'bg-blue-50/80 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <span>Active Transfers</span>
                </div>
                {activeTransfersCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white animate-pulse">
                    {activeTransfersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Folders (from Reference 2) */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2">
              Folders
            </div>
            <div className="space-y-1">
              {folders.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50/80 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Storage & Security Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs mb-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              IndexedDB Cache
            </span>
            <span className="font-semibold text-slate-900">{formatSize(totalTransferredBytes)}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: '30%' }}></div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Offline-Ready</span>
            <span>Zero Cloud</span>
          </div>
        </div>

        <button
          onClick={openEncryptionModal}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200/80 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isEncrypted ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>AES-256 E2EE</span>
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isEncrypted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {isEncrypted ? 'Active' : 'Off'}
          </span>
        </button>
      </div>
    </aside>
  );
};
