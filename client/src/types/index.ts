export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt?: number;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  browser: string;
  os: string;
  ip?: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen?: number;
  isSelected?: boolean;
  user?: User | null;
}

export type TransferStatus = 'pending' | 'transferring' | 'paused' | 'completed' | 'failed';
export type TransferDirection = 'upload' | 'download';

export interface Transfer {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  transferredChunks: number;
  status: TransferStatus;
  direction: TransferDirection;
  peerId: string;
  peerName?: string;
  speed: number; // bytes per second
  eta: number; // seconds remaining
  isEncrypted: boolean;
  checksum?: string;
  error?: string;
  progressPercent: number;
  blobUrl?: string;
  startTime: number;
  endTime?: number;
}

export interface TransferManifest {
  transferId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  chunkSize: number;
  checksum?: string;
  isEncrypted: boolean;
  iv?: string; // hex-encoded IV for AES-GCM
}

export interface ChunkMessage {
  type: 'chunk';
  transferId: string;
  index: number;
  data: string; // base64 or sent as binary buffer
}

export interface DiscoveredLANNode {
  service: string;
  hostname: string;
  platform: string;
  ips: string[];
  port: number;
  timestamp: number;
}

export interface SharedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  uploadedAt: string;
  badgeColor: string;
  folderCategory: 'files' | 'images' | 'documents' | 'projects' | 'design' | 'other';
  fileObj?: File;
}
