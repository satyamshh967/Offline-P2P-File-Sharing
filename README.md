# FILEUP - Offline-First Peer-to-Peer File Sharing System

A high-performance, web-based system enabling secure device-to-device file transfer without cloud storage, third-party relays, or internet bandwidth.

Designed for students, offices, and offline local networks (Wi-Fi, LAN, or mobile hotspots).

---

## Key Highlights & Core Features

### 1. Zero-Cloud Device Discovery
- **Local Network Radar**: Discovers active laptops, tablets, and phones on the same Wi-Fi subnet without manual IP entry.
- **Node.js UDP Beacon**: Native `dgram` UDP multicast and broadcast beacon on port 41234 that continuously announces signaling availability on the subnet.
- **Zero Java Dependency**: Implemented cleanly and natively in Node.js per user directive.

### 2. Direct WebRTC Data Channels
- **True P2P**: Data bytes travel directly between device network interfaces over encrypted WebRTC DataChannels (`RTCDataChannel`).
- **64KB Chunking & Backpressure Management**: Uses `bufferedAmount` monitoring and `bufferedamountlow` event loops to prevent buffer overflow and memory bloat on gigabit LAN speeds.

### 3. Advanced End-to-End Encryption (E2EE)
- **Web Crypto API**: Native browser-level AES-GCM 256-bit encryption.
- **96-bit Initialization Vector (IV)**: Generated ephemerally per chunk to guarantee cryptographic uniqueness.
- **Zero-Knowledge**: Signaling server routes connection metadata without ever seeing the payload or encryption keys.

### 4. Resilient Resumable Transfers
- **IndexedDB Checkpointing**: Received chunks are committed immediately to the browser's persistent IndexedDB storage.
- **Offset Resumption Protocol**: If a transfer is paused or the connection drops, peers automatically exchange manifests (`TRANSFER_RESUME_REQUEST`) and resume streaming from the first missing chunk without re-transmitting earlier chunks.
- **SHA-256 Integrity Verification**: Cryptographic checksum calculation validates file integrity upon final reassembly.

### 5. Multi-Device Broadcast
- **Parallel Fan-Out**: Select multiple discovered peers or click "Select All" to stream a file to an entire classroom or office team concurrently.

### 6. Python Compression & Optimization
- **Microservice on Port 5000**: Pre-compresses text/document batches using gzip/zlib before WebRTC chunking to save LAN bandwidth.
- **SHA-256 Verification Engine**: Standalone cryptographic verification tool.

---

## UI Architecture & Reference Design

The UI is built with React 18, Vite, Lucide Icons, and Tailwind CSS, modeled directly after the user's reference designs:
- **Header & Navigation**: Brand logo `FILEUP`, search bar, live LAN network status badge, E2EE toggle badge, and active device profile.
- **Active Upload Progress Banner**: Top progress bar matching the reference (`DAILY_UI_31_File_upload.xd 72%`).
- **Sidebar**: Folders categorization (`Files`, `Images`, `Documents`, `Projects`, `Design`, `Other`), IndexedDB cache meter (`Storage 30%`), and navigation tabs (`Device Radar`, `Active Transfers`).
- **File Manager Grid**: Clean folder cards (`Sketch Templates`, `Downloads`, `Resource Pack`), and file cards with bold colored badges (`DOC` blue, `PDF` red, `XLS` green, `ZIP` amber, `XD` purple).
- **Upload File Modal**: Centered modal with cloud upload icon, dashed drag-and-drop zone, staged file list with sizes and remove buttons, recipient peer checkboxes, and Python compression toggle.

---

## Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                React Web Client                                 |
|  - Device Radar & Peer List         - Drag & Drop Zone with Chunk Progress      |
|  - Web Crypto AES-GCM 256 E2EE      - IndexedDB Chunk Store for Resume          |
|  - Multi-Device Broadcast Engine    - Speedometer, ETA, and Transfer Audit      |
+------------------------------------+--------------------------------------------+
                 | WebRTC DataChannel (Direct P2P Data Transfer: 64KB Chunks)
                 v
+---------------------------------------------------------------------------------+
|                                Remote Peer Device                               |
|  - Receives Chunks & Computes SHA-256 Checksum                                  |
|  - Local Assembly & Stream Saver to Disk                                        |
+---------------------------------------------------------------------------------+
        ^                                                    ^
        | WebSocket / HTTP REST                              | WebSocket / HTTP REST
        | (/signal/offer, /signal/answer, /signal/ice)       |
+-------v----------------------------------------------------v--------------------+
|                         Node.js Signaling Server                                |
|  - Lightweight WebSocket & Express Relay (0.0.0.0:3001)                         |
|  - In-memory Device & Session Registry                                          |
|  - UDP Broadcast / Multicast LAN Discovery                                      |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                     Python Compression & Verification Service                  |
|  - Batch compression / decompression (gzip, zlib, zip) on port 5000             |
|  - Integrity checksum calculation (SHA-256)                                     |
+---------------------------------------------------------------------------------+
```

---

## Data Model

### Device
```typescript
interface Device {
  id: string;               // Unique device UUID
  name: string;             // Human-readable device label
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;          // Chrome, Firefox, Safari, Edge
  os: string;               // Windows, macOS, Linux, Android, iOS
  ip?: string;              // Local subnet IP address
  status: 'online' | 'busy' | 'offline';
  lastSeen?: number;
}
```

### Transfer
```typescript
interface Transfer {
  id: string;               // Transfer UUID
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  transferredChunks: number;
  status: 'pending' | 'transferring' | 'paused' | 'completed' | 'failed';
  direction: 'upload' | 'download';
  peerId: string;
  speed: number;            // Bytes per second
  eta: number;              // Seconds remaining
  isEncrypted: boolean;     // AES-GCM 256
  checksum?: string;        // SHA-256 hex digest
  progressPercent: number;  // 0 - 100
}
```

### Session
```typescript
interface Session {
  id: string;
  initiatorId: string;
  receiverId: string;
  state: 'initiating' | 'connected' | 'closed';
  createdAt: number;
  updatedAt: number;
}
```

---

## APIs

| Endpoint | Method | Description |
|---|---|---|
| `/signal/register` | `POST` | Registers a device on the signaling server |
| `/signal/peers` | `GET` | Returns list of currently discovered active peers |
| `/signal/offer` | `POST` | Dispatches WebRTC SDP Offer to recipient peer |
| `/signal/answer` | `POST` | Dispatches WebRTC SDP Answer back to initiator |
| `/signal/ice-candidate` | `POST` | Relays ICE candidate for NAT traversal / host candidate pairing |
| `/signal/discovery` | `GET` | Returns list of LAN nodes discovered via UDP beacon |
| `/api/health` | `GET` | Server health, active devices count, and uptime |
| `/compress` (port 5000) | `POST` | Compresses binary payload using Python gzip |
| `/checksum` (port 5000) | `POST` | Returns SHA-256 and MD5 hashes |

---

## Quick Start Guide

### 1. Launch All Services (Windows)
Double-click:
```cmd
scripts\start-all.bat
```

Or run via npm:
```cmd
# Terminal 1: Node Signaling Server
npm.cmd run start:server

# Terminal 2: Python Compression Service
npm.cmd run start:compression

# Terminal 3: React Web Client
npm.cmd run start:client
```

### 2. Access the Application
- **Local Device**: `http://localhost:5173`
- **Other Devices on Local Wi-Fi**: Open `http://<YOUR_IP>:5173` (e.g. `http://192.168.1.15:5173`) on your phone, tablet, or another computer.
- Once opened, both devices will appear in each other's **Device Radar** tab automatically!

---

## Verification & Testing

### 1. Test Python Compression
```cmd
python python-compression/test_compression.py
```

### 2. Test Signaling & Discovery APIs
Ensure signaling server is running (`npm.cmd run start:server`), then run:
```cmd
node scripts/test-p2p.js
```

### 3. Verify Production Build
```cmd
cd client && npm.cmd run build
```

---

## Resume Highlights
- **Implemented WebRTC P2P networking**: Built zero-cloud direct browser data channel transfer engine with chunking, backpressure control, and binary DataView framing.
- **Designed offline-first architecture**: Developed decentralized local network discovery (UDP beaconing) and IndexedDB chunk persistence enabling pause, resume, and multi-device broadcast.
