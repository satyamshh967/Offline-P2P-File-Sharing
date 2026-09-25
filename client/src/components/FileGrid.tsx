import React, { useState } from 'react';
import { 
  Folder, 
  MoreVertical, 
  Check, 
  Share2, 
  Download, 
  Trash2, 
  Grid, 
  List, 
  Calendar,
  Send,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { SharedFileItem } from '../types';

interface FileGridProps {
  files: SharedFileItem[];
  onSendFile: (fileItem: SharedFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  searchQuery: string;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  onSendFile,
  onDeleteFile,
  searchQuery
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const folders = [
    { id: 'f1', name: 'Sketch Templates', size: '8.4 GB', items: 12, date: '12.07.2026' },
    { id: 'f2', name: 'Downloads', size: '25.0 GB', items: 48, date: '12.07.2026' },
    { id: 'f3', name: 'Resource Pack', size: '4.2 GB', items: 19, date: '12.07.2026' },
    { id: 'f4', name: 'Office Sync', size: '1.8 GB', items: 7, date: '12.07.2026' }
  ];

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      case 'CSV':
        return 'bg-emerald-500 text-white';
      case 'ZIP':
      case 'RAR':
      case '7Z':
        return 'bg-amber-500 text-white';
      case 'XD':
      case 'PS':
      case 'PSD':
      case 'FIG':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Header & Toolbar (Reference 2 style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
            <span>File Manager</span>
            <span>&gt;</span>
            <span className="text-slate-600">Files</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Files <span className="text-slate-400 font-semibold text-lg">({filteredFiles.length})</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range filter tag */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01.09.26 / 25.09.26</span>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Section (matching Reference 2) */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 tracking-wide uppercase">Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder) => {
            const isSelected = selectedFolder === folder.id;
            return (
              <div
                key={folder.id}
                onClick={() => setSelectedFolder(isSelected ? null : folder.id)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Selection Checkmark */}
                <div className={`absolute top-4 left-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 group-hover:border-slate-400 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>

                <div className="flex flex-col items-center text-center pt-2 pb-1">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3 shadow-inner">
                    <Folder className="w-8 h-8 fill-amber-400 stroke-amber-500" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{folder.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{folder.size}</span>
                    <span>•</span>
                    <span>{folder.items} items</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Files Section (matching Reference 2) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 tracking-wide uppercase">Files</h2>
          <span className="text-xs text-slate-400">Click send to stream directly to peers</span>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-700">No files staged yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Upload File" or drag & drop files to share over P2P</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative"
              >
                {/* File Type Badge Box */}
                <div className="flex items-center justify-center py-4">
                  <div className={`w-14 h-16 rounded-xl flex items-center justify-center font-black text-xs tracking-wider uppercase shadow-sm ${getBadgeStyle(file.extension)}`}>
                    {file.extension.substring(0, 4)}
                  </div>
                </div>

                {/* File Info */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <span>{formatSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>

                {/* Quick Hover Action Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    onClick={() => onSendFile(file)}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer transition-transform hover:scale-110"
                    title="Send via WebRTC P2P"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg cursor-pointer transition-transform hover:scale-110"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View (Reference 1 style) */
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-[10px] tracking-wider uppercase shrink-0 ${getBadgeStyle(file.extension)}`}>
                    {file.extension.substring(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{formatSize(file.size)} • Uploaded {file.uploadedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSendFile(file)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send P2P</span>
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
