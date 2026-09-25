const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const signalRoutes = require('./routes/signal');
const store = require('./store');
const discovery = require('./discovery');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FileUp P2P Signaling Server',
    uptime: process.uptime(),
    activeDevices: store.listDevices().length,
    activeSessions: store.listSessions().length
  });
});

// REST signaling routes
app.use('/signal', signalRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Broadcast device list updates to all connected peers
function broadcastPeerList() {
  const allDevices = store.listDevices();
  const payload = JSON.stringify({
    type: 'peer-list',
    peers: allDevices
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  }
}

wss.on('connection', (ws, req) => {
  let currentDeviceId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type } = data;

      switch (type) {
        case 'register': {
          currentDeviceId = data.device.id;
          store.registerDevice(data.device, ws);
          ws.send(JSON.stringify({
            type: 'registered',
            device: data.device,
            peers: store.listDevices(currentDeviceId)
          }));
          broadcastPeerList();
          break;
        }

        case 'heartbeat': {
          if (currentDeviceId) {
            store.touchDevice(currentDeviceId);
          }
          break;
        }

        case 'offer': {
          const { to, sdp, metadata } = data;
          const targetSocket = store.getSocket(to);
          if (targetSocket && targetSocket.readyState === 1) {
            targetSocket.send(JSON.stringify({
              type: 'offer',
              from: currentDeviceId,
              sdp,
              metadata
            }));
          }
          break;
        }

        case 'answer': {
          const { to, sdp } = data;
          const targetSocket = store.getSocket(to);
          if (targetSocket && targetSocket.readyState === 1) {
            targetSocket.send(JSON.stringify({
              type: 'answer',
              from: currentDeviceId,
              sdp
            }));
          }
          break;
        }

        case 'ice-candidate': {
          const { to, candidate } = data;
          const targetSocket = store.getSocket(to);
          if (targetSocket && targetSocket.readyState === 1) {
            targetSocket.send(JSON.stringify({
              type: 'ice-candidate',
              from: currentDeviceId,
              candidate
            }));
          }
          break;
        }

        case 'broadcast-request': {
          // Sender wants to broadcast file metadata to multiple peers
          const { recipients, fileMeta } = data;
          if (Array.isArray(recipients)) {
            recipients.forEach((targetId) => {
              const targetSocket = store.getSocket(targetId);
              if (targetSocket && targetSocket.readyState === 1) {
                targetSocket.send(JSON.stringify({
                  type: 'broadcast-incoming',
                  from: currentDeviceId,
                  fileMeta
                }));
              }
            });
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('[Signaling Server] Failed to process message:', err.message);
    }
  });

  ws.on('close', () => {
    if (currentDeviceId) {
      store.removeDevice(currentDeviceId);
      broadcastPeerList();
    }
  });

  ws.on('error', (err) => {
    console.error(`[WebSocket Error] ${err.message}`);
  });
});

// Start UDP Discovery Daemon
discovery.start(PORT);

server.listen(PORT, '0.0.0.0', () => {
  const localIPs = discovery.getLocalIPs();
  console.log(`\n======================================================`);
  console.log(`  FILEUP P2P Signaling Server Running!`);
  console.log(`  Local:            http://localhost:${PORT}`);
  localIPs.forEach(ip => {
    console.log(`  LAN Network:      http://${ip}:${PORT}`);
  });
  console.log(`  WebSocket Server: ws://0.0.0.0:${PORT}`);
  console.log(`  UDP Beacon:       Port 41234 (Auto-discovery)`);
  console.log(`======================================================\n`);
});
