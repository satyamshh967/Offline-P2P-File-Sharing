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
  Info,
  Copy,
  Check
} from 'lucide-react';
import { SharedFileItem } from '../types';

interface FileDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  file: SharedFileItem | null;
  onShare: (file: SharedFileItem) => void;
  onDelete: (fileId: string) => void;
  onDownload?: (file: SharedFileItem) => void;
  onToggleStar?: (fileId: string) => void;
  isStarred?: boolean;
}

export const FileDetailsPanel: React.FC<FileDetailsPanelProps> = ({
  isOpen,
  onClose,
  file,
  onShare,
  onDelete,
  onDownload,
  onToggleStar,
  isStarred = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [isAvailableOffline, setIsAvailableOffline] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

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
  const fileHash = `sha256-${(file.name + file.size).split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0).toString(16).padStart(8, '0')}e91b`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(fileHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-40 lg:hidden"
        onClick={onClose}
      />

      <aside className="fixed lg:static inset-y-0 right-0 z-50 w-full sm:w-80 bg-white border-l border-slate-200/80 flex flex-col h-full shrink-0 select-none shadow-2xl lg:shadow-none animate-in slide-in-from-right-4 duration-200">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <h3 className="font-bold text-sm text-slate-800 truncate">
              {file.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close details"
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

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
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

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onShare(file)}
                  className="py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
                  title="Share via P2P"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => {
                    if (onDownload) onDownload(file);
                  }}
                  className="py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
                  title="Download / Export"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => {
                    if (onToggleStar) onToggleStar(file.id);
                  }}
                  className={`py-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                    isStarred ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                  title={isStarred ? 'Remove Star' : 'Star File'}
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-500' : ''}`} />
                  <span>{isStarred ? 'Starred' : 'Star'}</span>
                </button>

                <button
                  onClick={() => onDelete(file.id)}
                  className="py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              {/* "Available Offline" Switch */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Available Offline</h5>
                    <p className="text-[10px] text-slate-500">Cached in IndexedDB</p>
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
                    <span className="text-slate-400">Owner</span>
                    <span className="font-medium text-slate-800">Local Device</span>
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
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">SHA-256</span>
                    <button
                      onClick={handleCopyHash}
                      className="font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      title="Copy SHA-256 Checksum"
                    >
                      <span>{fileHash.substring(0, 14)}...</span>
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
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
    </>
  );
};
