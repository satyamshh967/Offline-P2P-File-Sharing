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
import { ShareModal } from './components/ShareModal';
import { FileDetailsPanel } from './components/FileDetailsPanel';
import { TransferWidget } from './components/TransferWidget';
import { QRCodeModal } from './components/QRCodeModal';
import { QRScannerModal } from './components/QRScannerModal';
import { AuthModal } from './components/AuthModal';
import { WebRTCManager } from './services/webrtc';
import { signalingService } from './services/signaling';
import { authService } from './services/auth';
import { Device, Transfer, SharedFileItem, User } from './types';
import { UploadCloud } from 'lucide-react';

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
  const [currentTab, setCurrentTab] = useState<string>('my-drive');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSignalingConnected, setIsSignalingConnected] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);

  // Selected file and inspector panel
  const [selectedFile, setSelectedFile] = useState<SharedFileItem | null>(null);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [isGuest, setIsGuest] = useState<boolean>(authService.isGuest());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(!authService.isAuthenticated());

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState<boolean>(false);
  const [isDirectConnectOpen, setIsDirectConnectOpen] = useState<boolean>(false);
  const [shareFileTarget, setShareFileTarget] = useState<SharedFileItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [qrFileTarget, setQrFileTarget] = useState<SharedFileItem | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  // Discovered Peers
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Transfers
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [totalTransferredBytes, setTotalTransferredBytes] = useState<number>(0);

  // Drag-and-drop overlay
  const [isWindowDragging, setIsWindowDragging] = useState<boolean>(false);

  // Sample files matching Google Drive and reference layout
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

  const rtcManagerRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    // Select first file by default for details view
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }

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

      if (updatedTransfer.status === 'completed') {
        setTotalTransferredBytes((bytes) => bytes + updatedTransfer.fileSize);
        if (updatedTransfer.direction === 'download') {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.7 }
          });
        }
      }
    });

    const unsubAuth = authService.subscribe((newUser, guest) => {
      setCurrentUser(newUser);
      setIsGuest(guest);
      if (newUser) {
        localDevice.user = newUser;
        localDevice.name = `${newUser.name} (${localDevice.os})`;
        signalingService.send({
          type: 'register',
          device: localDevice
        });
      }
    });

    if (currentUser) {
      localDevice.user = currentUser;
      localDevice.name = `${currentUser.name} (${localDevice.os})`;
    }

    signalingService.connect(localDevice);

    const unsubStatus = signalingService.on('connection-status', (status: any) => {
      setIsSignalingConnected(status.connected);
    });

    const unsubPeers = signalingService.on('peer-list', (data: any) => {
      const activePeers = (data.peers || []).filter((p: Device) => p.id !== localDevice.id);
      setDevices(activePeers);
    });

    signalingService.fetchPeers(localDevice.id).then((peers) => {
      if (peers && peers.length > 0) {
        setDevices(peers);
      }
    });

    return () => {
      unsubAuth();
      unsubStatus();
      unsubPeers();
      signalingService.disconnect();
    };
  }, [localDevice]);

  // Handle Full Window Drag & Drop (Google Drive style)
  const handleWindowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWindowDragging(true);
  };

  const handleWindowDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.relatedTarget === null) {
      setIsWindowDragging(false);
    }
  };

  const handleWindowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWindowDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploadModalOpen(true);
    }
  };

  const handleRefreshDevices = async () => {
    setIsScanning(true);
    const peers = await signalingService.fetchPeers(localDevice.id);
    setDevices(peers);
    setTimeout(() => setIsScanning(false), 800);
  };

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

  const handleSendToDevice = (device: Device) => {
    setSelectedDeviceIds([device.id]);
    setIsUploadModalOpen(true);
  };

  // Google Drive Share Action
  const handleOpenShare = (file: SharedFileItem) => {
    setShareFileTarget(file);
  };

  const handleOpenQRModal = (file?: SharedFileItem | null) => {
    setQrFileTarget(file || null);
    setIsQRModalOpen(true);
  };

  const handleQRScanned = async (result: { peerId?: string; fileId?: string; fileName?: string; fileSize?: number; rawUrl: string }) => {
    if (result.peerId) {
      setCurrentTab('transfers');
      if (result.fileName) {
        alert(`Connecting to ${result.peerId} to receive "${result.fileName}"...`);
      } else {
        alert(`Connected to device ${result.peerId} via QR scan!`);
      }
    }
  };

  const handleSendToPeersFromShareModal = (file: SharedFileItem, peerIds: string[], encrypted: boolean) => {
    let rawFile = file.fileObj;
    if (!rawFile) {
      const sampleBlob = new Blob([`Drive P2P content for ${file.name} - Verified SHA-256`], { type: file.type });
      rawFile = new File([sampleBlob], file.name, { type: file.type });
    }
    rtcManagerRef.current?.sendFile(rawFile, peerIds, encrypted);
  };

  // Upload modal handler
  const handleStartTransfer = async (stagedFiles: File[], targetPeerIds: string[], useCompression: boolean) => {
    if (!rtcManagerRef.current) return;

    for (let file of stagedFiles) {
      if (useCompression) {
        try {
          const res = await fetch('http://127.0.0.1:5000/compress', {
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
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

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

  return (
    <div 
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
      className="flex h-screen overflow-hidden bg-[#f8fafc] relative font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Google Drive Full Window Drag Overlay */}
      {isWindowDragging && (
        <div className="absolute inset-0 z-50 bg-blue-600/10 backdrop-blur-xs border-4 border-dashed border-blue-500 m-4 rounded-3xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-2xl mb-4">
            <UploadCloud className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Drop files to instantly share via Offline P2P</h2>
          <p className="text-sm text-slate-500 mt-1">Files will be cached in IndexedDB and ready to stream to nearby devices</p>
        </div>
      )}

      {/* Google Drive Sidebar with Custom User Logo */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openUploadModal={() => setIsUploadModalOpen(true)}
        openEncryptionModal={() => setIsEncryptionModalOpen(true)}
        openQRModal={() => handleOpenQRModal(null)}
        openQRScanner={() => setIsQRScannerOpen(true)}
        discoveredCount={devices.length}
        activeTransfersCount={transfers.filter((t) => t.status === 'transferring').length}
        isEncrypted={isEncrypted}
        totalTransferredBytes={totalTransferredBytes}
      />

      {/* Main Drive Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Google Drive Header */}
        <Header
          localDevice={localDevice}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSignalingConnected={isSignalingConnected}
          isEncrypted={isEncrypted}
          openEncryptionModal={() => setIsEncryptionModalOpen(true)}
          openDirectConnectModal={() => setIsDirectConnectOpen(true)}
          openUploadModal={() => setIsUploadModalOpen(true)}
          openQRModal={() => handleOpenQRModal(null)}
          openQRScanner={() => setIsQRScannerOpen(true)}
          toggleInfoPanel={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
          isInfoPanelOpen={isInfoPanelOpen}
          user={currentUser}
          isGuest={isGuest}
          onLogout={() => {
            authService.logout();
            setIsAuthModalOpen(true);
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Content & Details Split View */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {currentTab === 'computers' && (
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

              {currentTab !== 'computers' && currentTab !== 'transfers' && (
                <FileGrid
                  files={files}
                  currentTab={currentTab}
                  onSelectFile={(f) => {
                    setSelectedFile(f);
                    setIsInfoPanelOpen(true);
                  }}
                  selectedFile={selectedFile}
                  onShareFile={handleOpenShare}
                  onDeleteFile={handleDeleteFile}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </main>

          {/* Google Drive Right Details / Activity Inspector */}
          {isInfoPanelOpen && selectedFile && (
            <FileDetailsPanel
              isOpen={isInfoPanelOpen}
              onClose={() => setIsInfoPanelOpen(false)}
              file={selectedFile}
              onShare={handleOpenShare}
              onDelete={handleDeleteFile}
            />
          )}
        </div>
      </div>

      {/* Google Drive Bottom-Right Floating Transfer Widget */}
      <TransferWidget
        transfers={transfers}
        onPause={handlePauseTransfer}
        onResume={handleResumeTransfer}
        onCancel={handleCancelTransfer}
        onDownload={handleDownloadTransfer}
      />

      {/* Google Drive Share Modal */}
      <ShareModal
        isOpen={!!shareFileTarget}
        onClose={() => setShareFileTarget(null)}
        file={shareFileTarget}
        devices={devices}
        onSendToPeers={handleSendToPeersFromShareModal}
        onOpenQR={(file) => handleOpenQRModal(file)}
        isEncrypted={isEncrypted}
      />

      {/* Direct QR Code Generation Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        localDevice={localDevice}
        file={qrFileTarget}
        isEncrypted={isEncrypted}
      />

      {/* Live QR Camera Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanned={handleQRScanned}
      />

      {/* Upload Modal */}
      <FileDropzoneModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        devices={devices}
        selectedDeviceIds={selectedDeviceIds}
        activeTransfers={transfers}
        onStartTransfer={handleStartTransfer}
        isEncrypted={isEncrypted}
      />

      {/* Security & Settings Modal */}
      <EncryptionModal
        isOpen={isEncryptionModalOpen}
        onClose={() => setIsEncryptionModalOpen(false)}
        isEncrypted={isEncrypted}
        setIsEncrypted={setIsEncrypted}
      />

      {/* Direct Connect QR Modal */}
      <DirectConnectModal
        isOpen={isDirectConnectOpen}
        onClose={() => setIsDirectConnectOpen(false)}
        localIp="127.0.0.1"
      />

      {/* Google-Style Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        canDismiss={currentUser !== null}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
