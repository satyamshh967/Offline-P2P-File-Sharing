const dgram = require('dgram');
const os = require('os');

class DiscoveryDaemon {
  constructor(port = 41234, broadcastPort = 41234) {
    this.port = port;
    this.broadcastPort = broadcastPort;
    this.socket = null;
    this.beaconTimer = null;
    this.discoveredNodes = new Map(); // ip:port -> node info
  }

  getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }
    return ips.length > 0 ? ips : ['127.0.0.1'];
  }

  start(signalingHttpPort = 3001) {
    try {
      this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      this.socket.on('error', (err) => {
        console.warn(`[UDP Discovery] Socket warning: ${err.message}`);
      });

      this.socket.on('message', (msg, rinfo) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.service === 'FILEUP_P2P_DISCOVERY') {
            const key = `${rinfo.address}:${data.port}`;
            this.discoveredNodes.set(key, {
              ...data,
              remoteAddress: rinfo.address,
              lastSeen: Date.now()
            });
          }
        } catch (e) {
          // Ignore invalid packets
        }
      });

      this.socket.bind(this.port, () => {
        try {
          this.socket.setBroadcast(true);
        } catch (e) {
          // Broadcast mode may require admin privileges on some systems, fallback gracefully
        }
        console.log(`[UDP Discovery] Listening for peer beacons on UDP port ${this.port}`);

        // Broadcast local presence periodically
        this.beaconTimer = setInterval(() => {
          this.broadcastBeacon(signalingHttpPort);
        }, 5000);

        // Immediate first broadcast
        this.broadcastBeacon(signalingHttpPort);
      });
    } catch (err) {
      console.warn(`[UDP Discovery] Could not initialize UDP socket: ${err.message}`);
    }
  }

  broadcastBeacon(signalingHttpPort) {
    if (!this.socket) return;
    const localIps = this.getLocalIPs();
    const payload = JSON.stringify({
      service: 'FILEUP_P2P_DISCOVERY',
      hostname: os.hostname(),
      platform: os.platform(),
      ips: localIps,
      port: signalingHttpPort,
      timestamp: Date.now()
    });

    const buffer = Buffer.from(payload);
    // Broadcast to local subnet
    this.socket.send(buffer, 0, buffer.length, this.broadcastPort, '255.255.255.255', (err) => {
      if (err && err.code !== 'ENETUNREACH') {
        // Suppress expected unreachable errors on virtual adapters
      }
    });
  }

  getDiscoveredNodes() {
    const now = Date.now();
    const active = [];
    for (const [key, node] of this.discoveredNodes.entries()) {
      if (now - node.lastSeen < 15000) {
        active.push(node);
      } else {
        this.discoveredNodes.delete(key);
      }
    }
    return active;
  }

  stop() {
    if (this.beaconTimer) clearInterval(this.beaconTimer);
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {}
    }
  }
}

module.exports = new DiscoveryDaemon();
