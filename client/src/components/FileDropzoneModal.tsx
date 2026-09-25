import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  File, 
  Trash2, 
  Plus, 
  Send, 
  Check, 
  ShieldCheck, 
  Archive, 
  Users, 
  Radio
} from 'lucide-react';
import { Device, Transfer } from '../types';

interface FileDropzoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  selectedDeviceIds: string[];
  activeTransfers: Transfer[];
  onStartTransfer: (files: File[], targetPeerIds: string[], useCompression: boolean) => void;
  isEncrypted: boolean;
}

export const FileDropzoneModal: React.FC<FileDropzoneModalProps> = ({
  isOpen,
  onClose,
  devices,
  selectedDeviceIds: initialSelectedIds,
  activeTransfers,
  onStartTransfer,
  isEncrypted
}) => {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [selectedPeerIds, setSelectedPeerIds] = useState<string[]>(initialSelectedIds);
  const [usePythonCompression, setUsePythonCompression] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setStagedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setStagedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePeer = (peerId: string) => {
    setSelectedPeerIds((prev) => 
      prev.includes(peerId) ? prev.filter(id => id !== peerId) : [...prev, peerId]
    );
  };

  const selectAllPeers = () => {
    if (selectedPeerIds.length === devices.length) {
      setSelectedPeerIds([]);
    } else {
      setSelectedPeerIds(devices.map(d => d.id));
    }
  };

  const handleSend = () => {
    if (stagedFiles.length === 0 || selectedPeerIds.length === 0) return;
    onStartTransfer(stagedFiles, selectedPeerIds, usePythonCompression);
    setStagedFiles([]);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  // Find active uploading transfers to display in modal (Reference 2 style)
  const uploadingTransfers = activeTransfers.filter(t => t.direction === 'upload' && t.status === 'transferring');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header (matching Reference 2) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Upload File</h2>
            {isEncrypted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> E2EE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Uploading Progress Row (from Reference 2) */}
          {uploadingTransfers.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Transfers in Progress
              </div>
              {uploadingTransfers.map((tx) => (
                <div key={tx.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center">
                        ZIP
                      </div>
                      <span className="font-bold text-xs text-slate-800 truncate">
                        Uploading {tx.fileName}...
                      </span>
                    </div>
                    <span className="font-extrabold text-xs text-blue-600">
                      {tx.progressPercent}%
                    </span>
                  </div>
                  {/* Blue Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${tx.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drag & Drop Zone (Matching Reference 1 & 2) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            {/* Cloud Icon */}
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
              <UploadCloud className="w-9 h-9 stroke-[1.8]" />
            </div>
            <h3 className="font-black text-slate-800 text-sm tracking-wide uppercase mb-1">
              Drag Files Here
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs leading-relaxed">
              Drag and drop files here, or browse your computer
            </p>
            {/* Dark Rounded Browse Button (from Reference 1) */}
            <button
              type="button"
              className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all pointer-events-none"
            >
              Browse Files
            </button>
          </div>

          {/* Staged Files List (Matching Reference 2) */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Selected Files ({stagedFiles.length})</span>
                <span className="text-blue-600 cursor-pointer" onClick={() => setStagedFiles([])}>Clear All</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {stagedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] tracking-wider uppercase shrink-0 ${getFileBadgeColor(file.name)}`}>
                        {file.name.split('.').pop()?.substring(0, 3) || 'DOC'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-400">{formatSize(file.size)}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipient Peer Selector (Multi-Device Broadcast support) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Select Recipients ({selectedPeerIds.length} chosen)
              </span>
              {devices.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllPeers}
                  className="text-blue-600 hover:text-blue-700 text-xs font-bold cursor-pointer"
                >
                  {selectedPeerIds.length === devices.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {devices.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-800 flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span>No other devices discovered yet. Open FILEUP on another device to send files!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                {devices.map((device) => {
                  const isChecked = selectedPeerIds.includes(device.id);
                  return (
                    <div
                      key={device.id}
                      onClick={() => togglePeer(device.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/60 font-semibold text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs truncate">{device.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{device.os}</p>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Python Compression Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Python Compression Service</p>
                <p className="text-[10px] text-slate-400">Pre-compress payload before WebRTC streaming</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={usePythonCompression}
                onChange={(e) => setUsePythonCompression(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Modal Footer (matching Reference 2: light Cancel button, primary Send/Add button) */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={stagedFiles.length === 0 || selectedPeerIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Files ({stagedFiles.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
