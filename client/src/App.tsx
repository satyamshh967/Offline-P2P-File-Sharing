import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FileGrid } from './components/FileGrid';
import { DeviceRadar } from './components/DeviceRadar';
import { TransferManager } from './components/TransferManager';
import { FileDropzoneModal } from './components/FileDropzoneModal';
import { EncryptionModal } from './components/EncryptionModal';
import { DirectConnectModal } from './components/DirectConnectModal';
import { WebRTCManager } from './services/webrtc';
import { signalingService } from './services/signaling';
import { Device, Transfer, SharedFileItem } from './types';
import { Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// Generate consistent device info
const getDeviceInfo = (): Device => {
  let id = localStorage.getItem('fileup_device_id');
  if (!id) {
    id = `dev_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('fileup_device_id', id);
  }

  const ua = navigator.userAgent;
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Windows';
  if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  const type = (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) ? 'mobile' : 'desktop';

  let name = localStorage.getItem('fileup_device_name');
  if (!name) {
    name = `${os} ${browser} (${id.substring(4, 7)})`;
    localStorage.setItem('fileup_device_name', name);
  }

  return { id, name, type, browser, os, status: 'online' };
};

export const App: React.FC = () => {
  const [localDevice] = useState<Device>(getDeviceInfo());
  const [currentTab, setCurrentTab] = useState<string>('files');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSignalingConnected, setIsSignalingConnected] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState<boolean>(false);
  const [isDirectConnectOpen, setIsDirectConnectOpen] = useState<boolean>(false);

  // Discovered Peers
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Transfers
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [totalTransferredBytes, setTotalTransferredBytes] = useState<number>(0);

  // Sample files matching Reference 2 & Reference 1
  const [files, setFiles] = useState<SharedFileItem[]>([
    {
      id: 'f-1',
      name: 'DAILY_UI_30_Pricing.xd',
      size: 2650000,
      type: 'application/octet-stream',
      extension: 'XD',
      uploadedAt: '22 hours ago',
      badgeColor: 'bg-purple-600',
      folderCategory: 'design'
    },
    {
      id: 'f-2',
      name: 'WEBSITE_Final.psd',
      size: 45200000,
      type: 'image/vnd.adobe.photoshop',
      extension: 'PSD',
      uploadedAt: '15 hours ago',
      badgeColor: 'bg-purple-700',
      folderCategory: 'design'
    },
    {
      id: 'f-3',
      name: '01_project_description.pdf',
      size: 154000,
      type: 'application/pdf',
      extension: 'PDF',
      uploadedAt: '12.07.2026',
      badgeColor: 'bg-red-500',
      folderCategory: 'documents'
    },
    {
      id: 'f-4',
      name: '02_project_specs.pdf',
      size: 320000,
      type: 'application/pdf',
      extension: 'PDF',
      uploadedAt: '12.07.2026',
      badgeColor: 'bg-red-500',
      folderCategory: 'documents'
    },
    {
      id: 'f-5',
      name: 'Shopping_list.docx',
      size: 1048576,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'DOC',
      uploadedAt: '12.07.2026',
      badgeColor: 'bg-blue-500',
      folderCategory: 'files'
    },
    {
      id: 'f-6',
      name: 'Design_brief.docx',
      size: 890000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'DOC',
      uploadedAt: '12.07.2026',
      badgeColor: 'bg-blue-500',
      folderCategory: 'files'
    },
    {
      id: 'f-7',
      name: 'Prices_Q3.xlsx',
      size: 1250000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'XLS',
      uploadedAt: '12.07.2026',
      badgeColor: 'bg-emerald-500',
      folderCategory: 'projects'
    },
    {
      id: 'f-8',
      name: 'Archive_Assets.zip',
      size: 15400000,
      type: 'application/zip',
      extension: 'ZIP',
      uploadedAt: '12.07.2026',
      badgeColor: 'bg-amber-500',
      folderCategory: 'other'
    }
  ]);

  // WebRTC Manager reference
  const rtcManagerRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    // Instantiate WebRTC Manager
    const rtc = new WebRTCManager(localDevice.id, (updatedTransfer) => {
      setTransfers((prev) => {
        const index = prev.findIndex((t) => t.id === updatedTransfer.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedTransfer;
          return updated;
        } else {
          return [updatedTransfer, ...prev];
        }
      });

      // Track total transferred bytes
      if (updatedTransfer.status === 'completed') {
        setTotalTransferredBytes((bytes) => bytes + updatedTransfer.fileSize);
        // Trigger celebratory confetti on download complete!
        if (updatedTransfer.direction === 'download') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      }
    });

    rtcManagerRef.current = rtc;

    // Connect Signaling Service
    signalingService.connect(localDevice);

    const unsubStatus = signalingService.on('connection-status', (status: any) => {
      setIsSignalingConnected(status.connected);
    });

    const unsubPeers = signalingService.on('peer-list', (data: any) => {
      const activePeers = (data.peers || []).filter((p: Device) => p.id !== localDevice.id);
      setDevices(activePeers);
    });

    // Initial peer fetch
    signalingService.fetchPeers(localDevice.id).then((peers) => {
      if (peers && peers.length > 0) {
        setDevices(peers);
      }
    });

    return () => {
      unsubStatus();
      unsubPeers();
      signalingService.disconnect();
    };
  }, [localDevice]);

  // Refresh discovered devices
  const handleRefreshDevices = async () => {
    setIsScanning(true);
    const peers = await signalingService.fetchPeers(localDevice.id);
    setDevices(peers);
    setTimeout(() => setIsScanning(false), 800);
  };

  // Toggle selection for multi-device broadcast
  const handleToggleSelectDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    );
  };

  const handleSelectAllDevices = () => {
    if (selectedDeviceIds.length === devices.length) {
      setSelectedDeviceIds([]);
    } else {
      setSelectedDeviceIds(devices.map((d) => d.id));
    }
  };

  // Send direct to a device clicked from radar
  const handleSendToDevice = (device: Device) => {
    setSelectedDeviceIds([device.id]);
    setIsUploadModalOpen(true);
  };

  // Send a specific file from the grid
  const handleSendFileFromGrid = (fileItem: SharedFileItem) => {
    if (devices.length === 0) {
      alert('No peers discovered yet! Open FILEUP on another device or tab.');
      return;
    }

    // If file has raw fileObj, use it; otherwise create synthetic blob file for demonstration
    let rawFile = fileItem.fileObj;
    if (!rawFile) {
      const sampleBlob = new Blob([`FILEUP P2P Content for ${fileItem.name} - Verified SHA-256`], { type: fileItem.type });
      rawFile = new File([sampleBlob], fileItem.name, { type: fileItem.type });
    }

    const targetPeerIds = selectedDeviceIds.length > 0 ? selectedDeviceIds : [devices[0].id];
    rtcManagerRef.current?.sendFile(rawFile, targetPeerIds, isEncrypted);
    setCurrentTab('transfers');
  };

  // Start transfer from modal
  const handleStartTransfer = async (stagedFiles: File[], targetPeerIds: string[], useCompression: boolean) => {
    if (!rtcManagerRef.current) return;

    for (let file of stagedFiles) {
      // Optional Python compression service integration
      if (useCompression) {
        try {
          const res = await fetch('http://localhost:5000/compress', {
            method: 'POST',
            body: file,
            headers: { 'X-Compression-Level': '6' }
          });
          if (res.ok) {
            const compressedBlob = await res.blob();
            file = new File([compressedBlob], `${file.name}.gz`, { type: 'application/gzip' });
          }
        } catch (e) {
          console.warn('[Python Compression] Service offline, sending uncompressed:', e);
        }
      }

      await rtcManagerRef.current.sendFile(file, targetPeerIds, isEncrypted);

      // Add to shared files list
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const newItem: SharedFileItem = {
        id: `f-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext,
        uploadedAt: 'Just now',
        badgeColor: 'bg-blue-600',
        folderCategory: 'files',
        fileObj: file
      };
      setFiles((prev) => [newItem, ...prev]);
    }

    setCurrentTab('transfers');
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Pause / Resume / Cancel handlers
  const handlePauseTransfer = (id: string) => rtcManagerRef.current?.pauseTransfer(id);
  const handleResumeTransfer = (id: string) => rtcManagerRef.current?.resumeTransfer(id);
  const handleCancelTransfer = (id: string) => rtcManagerRef.current?.cancelTransfer(id);

  const handleDownloadTransfer = (transfer: Transfer) => {
    if (transfer.blobUrl) {
      const a = document.createElement('a');
      a.href = transfer.blobUrl;
      a.download = transfer.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Find active transfer for the top banner (Reference 1 style)
  const activeBannerTransfer = transfers.find((t) => t.status === 'transferring');

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar (matching Reference 2) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openUploadModal={() => setIsUploadModalOpen(true)}
        openEncryptionModal={() => setIsEncryptionModalOpen(true)}
        discoveredCount={devices.length}
        activeTransfersCount={transfers.filter((t) => t.status === 'transferring').length}
        isEncrypted={isEncrypted}
        totalTransferredBytes={totalTransferredBytes}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          localDevice={localDevice}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSignalingConnected={isSignalingConnected}
          isEncrypted={isEncrypted}
          openEncryptionModal={() => setIsEncryptionModalOpen(true)}
          openDirectConnectModal={() => setIsDirectConnectOpen(true)}
          openUploadModal={() => setIsUploadModalOpen(true)}
        />

        {/* Top Active Upload Progress Banner (Matching Reference 1 exactly: DAILY_UI_31_File_upload.xd 72%) */}
        {activeBannerTransfer && (
          <div className="bg-blue-50/70 border-b border-blue-100 px-8 py-2.5 flex items-center justify-between text-xs transition-all animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 rounded bg-purple-700 text-white font-bold text-[9px] flex items-center justify-center uppercase shrink-0">
                {activeBannerTransfer.fileName.split('.').pop()?.substring(0, 2) || 'XD'}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-800 mr-2 truncate">
                  {activeBannerTransfer.fileName}
                </span>
                <span className="text-slate-400">
                  {(activeBannerTransfer.transferredChunks * 64 / 1024).toFixed(1)}MB of {(activeBannerTransfer.fileSize / (1024 * 1024)).toFixed(1)}MB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="font-extrabold text-blue-700 text-sm">
                {activeBannerTransfer.progressPercent}%
              </span>
              <button
                onClick={() => setCurrentTab('transfers')}
                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer text-xs"
              >
                View
              </button>
            </div>
          </div>
        )}

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'radar' && (
              <DeviceRadar
                devices={devices}
                selectedDeviceIds={selectedDeviceIds}
                onToggleSelectDevice={handleToggleSelectDevice}
                onSelectAllDevices={handleSelectAllDevices}
                onSendToDevice={handleSendToDevice}
                onRefreshDevices={handleRefreshDevices}
                isScanning={isScanning}
              />
            )}

            {currentTab === 'transfers' && (
              <TransferManager
                transfers={transfers}
                onPause={handlePauseTransfer}
                onResume={handleResumeTransfer}
                onCancel={handleCancelTransfer}
                onDownload={handleDownloadTransfer}
              />
            )}

            {currentTab !== 'radar' && currentTab !== 'transfers' && (
              <FileGrid
                files={files.filter((f) => currentTab === 'files' || f.folderCategory === currentTab)}
                onSendFile={handleSendFileFromGrid}
                onDeleteFile={handleDeleteFile}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <FileDropzoneModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        devices={devices}
        selectedDeviceIds={selectedDeviceIds}
        activeTransfers={transfers}
        onStartTransfer={handleStartTransfer}
        isEncrypted={isEncrypted}
      />

      <EncryptionModal
        isOpen={isEncryptionModalOpen}
        onClose={() => setIsEncryptionModalOpen(false)}
        isEncrypted={isEncrypted}
        setIsEncrypted={setIsEncrypted}
      />

      <DirectConnectModal
        isOpen={isDirectConnectOpen}
        onClose={() => setIsDirectConnectOpen(false)}
        localIp="127.0.0.1"
      />
    </div>
  );
};

export default App;
