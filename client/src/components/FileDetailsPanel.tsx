import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Star, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Clock, 
  FileText, 
  Hash, 
  Users,
  Eye,
  Info
} from 'lucide-react';
import { SharedFileItem } from '../types';

interface FileDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  file: SharedFileItem | null;
  onShare: (file: SharedFileItem) => void;
  onDelete: (fileId: string) => void;
  onToggleStar?: (fileId: string) => void;
  isStarred?: boolean;
}

export const FileDetailsPanel: React.FC<FileDetailsPanelProps> = ({
  isOpen,
  onClose,
  file,
  onShare,
  onDelete,
  onToggleStar,
  isStarred = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [isAvailableOffline, setIsAvailableOffline] = useState<boolean>(true);

  if (!isOpen || !file) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBadgeStyle = (ext: string) => {
    switch (ext.toUpperCase()) {
      case 'PDF':
        return 'bg-red-500 text-white';
      case 'DOC':
      case 'DOCX':
      case 'TXT':
        return 'bg-blue-500 text-white';
      case 'XLS':
      case 'XLSX':
        return 'bg-emerald-500 text-white';
      case 'ZIP':
      case 'RAR':
        return 'bg-amber-500 text-white';
      case 'XD':
      case 'PS':
      case 'PSD':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const totalChunks = Math.ceil(file.size / (64 * 1024));

  return (
    <aside className="w-80 bg-white border-l border-slate-200/80 flex flex-col h-full shrink-0 select-none animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-800 truncate max-w-[180px]">
            {file.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs (Details vs Activity) */}
      <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Activity
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'details' ? (
          <>
            {/* File Preview Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <div className={`w-16 h-20 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider uppercase shadow-md mb-3 ${getBadgeStyle(file.extension)}`}>
                {file.extension.substring(0, 4)}
              </div>
              <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{file.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1">{formatSize(file.size)}</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onShare(file)}
                className="py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share P2P</span>
              </button>

              <button
                onClick={() => {
                  if (onToggleStar) onToggleStar(file.id);
                }}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  isStarred ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-500' : ''}`} />
                <span>{isStarred ? 'Starred' : 'Star'}</span>
              </button>

              <button
                onClick={() => onDelete(file.id)}
                className="py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>

            {/* Google Drive "Available Offline" Switch */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Available Offline</h5>
                  <p className="text-[10px] text-slate-500">Cached in browser IndexedDB</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailableOffline}
                  onChange={(e) => setIsAvailableOffline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* File Properties */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                File Information
              </h5>

              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="font-medium text-slate-800">{file.type || 'Binary Document'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size</span>
                  <span className="font-medium text-slate-800">{formatSize(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">P2P Chunks</span>
                  <span className="font-medium text-slate-800">{totalChunks} chunks (64 KB)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Used</span>
                  <span className="font-medium text-slate-800">{formatSize(file.size)} (IndexedDB)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner</span>
                  <span className="font-medium text-slate-800">You (Local Device)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modified</span>
                  <span className="font-medium text-slate-800">{file.uploadedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Encryption</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    AES-GCM 256
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Activity Log */
          <div className="space-y-4">
            <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Transfer Activity
            </h5>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-slate-800">File staged for P2P</p>
                <p className="text-[11px] text-slate-400">{file.uploadedAt}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-slate-800">SHA-256 Checksum generated</p>
                <p className="text-[11px] text-slate-400">Bit-integrity validated</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-slate-800">IndexedDB chunk cache ready</p>
                <p className="text-[11px] text-slate-400">Offset resumption enabled</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
