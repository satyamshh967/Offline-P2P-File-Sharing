import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  X, 
  Check, 
  Pause, 
  Play, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Transfer } from '../types';

interface TransferWidgetProps {
  transfers: Transfer[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onDownload: (tx: Transfer) => void;
}

export const TransferWidget: React.FC<TransferWidgetProps> = ({
  transfers,
  onPause,
  onResume,
  onCancel,
  onDownload
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // If no transfers or dismissed
  if (transfers.length === 0 || isDismissed) return null;

  const activeCount = transfers.filter(t => t.status === 'transferring' || t.status === 'pending').length;
  const completedCount = transfers.filter(t => t.status === 'completed').length;

  const formatSpeed = (bytesPerSec: number) => {
    if (!bytesPerSec || bytesPerSec === 0) return '0 KB/s';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  };

  const getTitle = () => {
    if (activeCount > 0) {
      return `Transferring ${activeCount} item${activeCount > 1 ? 's' : ''}`;
    }
    return `${completedCount} transfer${completedCount > 1 ? 's' : ''} complete`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden select-none animate-in slide-in-from-bottom-6 duration-200">
      {/* Google Drive Widget Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-bold">
          {activeCount > 0 ? (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          )}
          <span>{getTitle()}</span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Transfers List */}
      {isExpanded && (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
          {transfers.slice(0, 8).map((tx) => {
            const isDone = tx.status === 'completed';
            const isPaused = tx.status === 'paused';
            const isFailed = tx.status === 'failed';
            const isUpload = tx.direction === 'upload';

            return (
              <div key={tx.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {isUpload ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 truncate" title={tx.fileName}>
                      {tx.fileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : isPaused ? (
                      <button
                        onClick={() => onResume(tx.id)}
                        className="p-1 rounded text-slate-500 hover:text-blue-600 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onPause(tx.id)}
                        className="p-1 rounded text-slate-500 hover:text-amber-600 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    {!isDone && (
                      <button
                        onClick={() => onCancel(tx.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isDone && !isUpload && tx.blobUrl && (
                      <button
                        onClick={() => onDownload(tx)}
                        className="p-1 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        title="Save to Disk"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{tx.progressPercent}% • {tx.transferredChunks}/{tx.totalChunks} chunks</span>
                  {!isDone && !isPaused && !isFailed && (
                    <span className="text-blue-600 font-semibold">{formatSpeed(tx.speed)}</span>
                  )}
                  {isDone && <span className="text-emerald-600 font-bold">P2P Verified</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
