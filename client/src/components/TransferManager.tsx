import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Pause, 
  Play, 
  X, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Zap,
  Check
} from 'lucide-react';
import { Transfer } from '../types';

interface TransferManagerProps {
  transfers: Transfer[];
  onPause: (transferId: string) => void;
  onResume: (transferId: string) => void;
  onCancel: (transferId: string) => void;
  onDownload: (transfer: Transfer) => void;
}

export const TransferManager: React.FC<TransferManagerProps> = ({
  transfers,
  onPause,
  onResume,
  onCancel,
  onDownload
}) => {
  const formatSpeed = (bytesPerSec: number) => {
    if (!bytesPerSec || bytesPerSec === 0) return '0 KB/s';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatETA = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m ${seconds % 60}s`;
  };

  const getFileBadgeColor = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || '';
    switch (ext) {
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

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-200 shadow-xs select-none">
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-base mb-1">No Active Transfers</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Files transferred between connected devices will appear here with live speed, ETA, and resume checkpoints.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Active Transfers <span className="text-slate-400 font-semibold text-base">({transfers.length})</span>
        </h2>
      </div>

      <div className="space-y-3">
        {transfers.map((tx) => {
          const isDone = tx.status === 'completed';
          const isPaused = tx.status === 'paused';
          const isFailed = tx.status === 'failed';
          const isUpload = tx.direction === 'upload';

          return (
            <div
              key={tx.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                isDone
                  ? 'border-emerald-200/80 bg-emerald-50/10'
                  : isFailed
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs tracking-wider uppercase shrink-0 shadow-xs ${getFileBadgeColor(tx.fileName)}`}>
                    {tx.fileName.split('.').pop()?.substring(0, 3) || 'FILE'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800 truncate" title={tx.fileName}>
                        {tx.fileName}
                      </h4>
                      {tx.isEncrypted && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> E2EE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        {isUpload ? <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-500" />}
                        {isUpload ? 'Sending' : 'Receiving'}
                      </span>
                      <span>•</span>
                      <span>{formatSize(tx.fileSize)}</span>
                      <span>•</span>
                      <span>{tx.transferredChunks} / {tx.totalChunks} chunks</span>
                    </div>
                  </div>
                </div>

                {/* Percentage & Status Tag */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-slate-900 leading-none">
                    {tx.progressPercent}%
                  </div>
                  <div className="text-[11px] font-bold mt-1">
                    {isDone && <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3 stroke-[3]" /> Completed</span>}
                    {isPaused && <span className="text-amber-600">Paused</span>}
                    {isFailed && <span className="text-rose-600 truncate">{tx.error || 'Failed'}</span>}
                    {!isDone && !isPaused && !isFailed && (
                      <span className="text-blue-600 flex items-center gap-1 justify-end font-semibold">
                        <Zap className="w-3 h-3" /> {formatSpeed(tx.speed)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500'
                      : isFailed
                      ? 'bg-rose-500'
                      : isPaused
                      ? 'bg-amber-400'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${tx.progressPercent}%` }}
                ></div>
              </div>

              {/* Card Footer with Speed, ETA & Controls */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100/80">
                <div className="flex items-center gap-3">
                  {!isDone && !isFailed && (
                    <>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        ETA: <strong className="text-slate-700">{formatETA(tx.eta)}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">
                        Chunk Size: <strong className="text-slate-700">64 KB</strong>
                      </span>
                    </>
                  )}
                  {isDone && tx.checksum && (
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      SHA-256: {tx.checksum.substring(0, 16)}... (Verified)
                    </span>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isDone && !isFailed && (
                    <>
                      {isPaused ? (
                        <button
                          onClick={() => onResume(tx.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => onPause(tx.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                        </button>
                      )}
                      <button
                        onClick={() => onCancel(tx.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Cancel Transfer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {isDone && !isUpload && tx.blobUrl && (
                    <button
                      onClick={() => onDownload(tx)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save to Disk</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
