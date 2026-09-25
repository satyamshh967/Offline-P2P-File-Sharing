import React, { useState } from 'react';
import { 
  Folder, 
  MoreVertical, 
  Share2, 
  Download, 
  Star, 
  Trash2, 
  Grid, 
  List, 
  ChevronDown, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  FileArchive, 
  File, 
  Image as ImageIcon,
  Send,
  SlidersHorizontal,
  HardDrive
} from 'lucide-react';
import { SharedFileItem } from '../types';

interface FileGridProps {
  files: SharedFileItem[];
  currentTab: string;
  onSelectFile: (file: SharedFileItem) => void;
  selectedFile: SharedFileItem | null;
  onShareFile: (file: SharedFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onToggleStar?: (fileId: string) => void;
  searchQuery: string;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  currentTab,
  onSelectFile,
  selectedFile,
  onShareFile,
  onDeleteFile,
  onToggleStar,
  searchQuery
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');

  const folders = [
    { id: 'f1', name: 'Work Documents', count: 14 },
    { id: 'f2', name: 'Design Assets', count: 8 },
    { id: 'f3', name: 'Offline P2P Shares', count: 23 },
    { id: 'f4', name: 'Project Specs', count: 5 }
  ];

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (ext: string) => {
    switch (ext.toUpperCase()) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'DOC':
      case 'DOCX':
      case 'TXT':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'XLS':
      case 'XLSX':
      case 'CSV':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'ZIP':
      case 'RAR':
      case '7Z':
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'WEBP':
        return <ImageIcon className="w-5 h-5 text-rose-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchSearch) return false;

    if (activeTypeFilter === 'docs') {
      return ['DOC', 'DOCX', 'TXT', 'PDF'].includes(f.extension.toUpperCase());
    } else if (activeTypeFilter === 'sheets') {
      return ['XLS', 'XLSX', 'CSV'].includes(f.extension.toUpperCase());
    } else if (activeTypeFilter === 'archives') {
      return ['ZIP', 'RAR', '7Z', 'TAR'].includes(f.extension.toUpperCase());
    }
    return true;
  });

  const getTitle = () => {
    switch (currentTab) {
      case 'shared':
        return 'Shared with me';
      case 'recent':
        return 'Recent';
      case 'starred':
        return 'Starred';
      case 'trash':
        return 'Trash';
      default:
        return 'My Drive';
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Google Drive Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-xl transition-colors">
            <span>{getTitle()}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills (Google Drive chips) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTypeFilter(activeTypeFilter === 'docs' ? 'all' : 'docs')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeTypeFilter === 'docs'
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Documents ▾
            </button>
            <button
              onClick={() => setActiveTypeFilter(activeTypeFilter === 'sheets' ? 'all' : 'sheets')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeTypeFilter === 'sheets'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Spreadsheets ▾
            </button>
            <button
              onClick={() => setActiveTypeFilter(activeTypeFilter === 'archives' ? 'all' : 'archives')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeTypeFilter === 'archives'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Archives ▾
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested / Priority Row (Google Drive cards) */}
      {currentTab === 'my-drive' || currentTab === 'home' ? (
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Suggested</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {files.slice(0, 4).map((file) => (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative group flex flex-col justify-between h-36 ${
                  selectedFile?.id === file.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file.extension)}
                    <h4 className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareFile(file);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Share via P2P"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 my-2 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                  <span className="font-mono text-[10px] text-slate-400">Preview & P2P Stream Ready</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Offline
                  </span>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Folders Section (Google Drive Pills) */}
      {currentTab === 'my-drive' && (
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {folders.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-xl p-3 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-5 h-5 text-slate-600 group-hover:text-blue-600 fill-slate-100 transition-colors shrink-0" />
                  <span className="font-semibold text-xs text-slate-800 truncate">{f.name}</span>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section: Google Drive Table List or Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Files</h2>

        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-200">
            <HardDrive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">No files found</p>
            <p className="text-xs text-slate-400 mt-1">Upload files or receive them over P2P to view them here.</p>
          </div>
        ) : viewMode === 'list' ? (
          /* Google Drive Table View */
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="col-span-6 sm:col-span-5">Name</span>
              <span className="hidden sm:block col-span-3">Owner</span>
              <span className="hidden sm:block col-span-2">Last modified</span>
              <span className="col-span-6 sm:col-span-2 text-right">File size & Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className={`grid grid-cols-12 px-5 py-3.5 items-center transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    {/* Name */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                      <div className="shrink-0">{getFileIcon(file.extension)}</div>
                      <span className="text-xs font-semibold truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-emerald-600 shrink-0" title="Available offline in IndexedDB">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Owner */}
                    <div className="hidden sm:flex col-span-3 items-center gap-2 text-xs text-slate-500">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center">
                        M
                      </div>
                      <span>me (local)</span>
                    </div>

                    {/* Modified */}
                    <div className="hidden sm:block col-span-2 text-xs text-slate-400">
                      {file.uploadedAt}
                    </div>

                    {/* Size & Action Buttons */}
                    <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2 text-xs text-slate-500">
                      <span className="text-slate-400 mr-2">{formatSize(file.size)}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareFile(file);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="Share via Offline P2P"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Google Drive Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <div className="h-28 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
                    <div className="scale-125">{getFileIcon(file.extension)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareFile(file);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-blue-600 hover:bg-blue-600 hover:text-white shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Share P2P"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3">
                    <h4 className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{formatSize(file.size)}</span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Offline
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
