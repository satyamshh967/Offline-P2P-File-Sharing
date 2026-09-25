// In-memory store for connected devices and active signaling sessions

class Store {
  constructor() {
    this.devices = new Map(); // deviceId -> Device
    this.sessions = new Map(); // sessionId -> Session
    this.sockets = new Map(); // deviceId -> WebSocket
    this.deviceExpiryMs = 60000; // 60 seconds heartbeat timeout
  }

  registerDevice(device, socket = null) {
    const existing = this.devices.get(device.id) || {};
    const updated = {
      ...existing,
      ...device,
      lastSeen: Date.now(),
      status: 'online'
    };
    this.devices.set(device.id, updated);
    if (socket) {
      this.sockets.set(device.id, socket);
    }
    return updated;
  }

  touchDevice(deviceId) {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeen = Date.now();
      device.status = 'online';
    }
  }

  getDevice(deviceId) {
    return this.devices.get(deviceId);
  }

  getSocket(deviceId) {
    return this.sockets.get(deviceId);
  }

  removeDevice(deviceId) {
    this.devices.delete(deviceId);
    this.sockets.delete(deviceId);
    // Cleanup sessions involving this device
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.initiatorId === deviceId || session.receiverId === deviceId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  listDevices(excludeDeviceId = null) {
    const now = Date.now();
    const result = [];
    for (const [id, dev] of this.devices.entries()) {
      if (now - dev.lastSeen > this.deviceExpiryMs) {
        dev.status = 'offline';
      }
      if (!excludeDeviceId || id !== excludeDeviceId) {
        result.push(dev);
      }
    }
    return result;
  }

  createSession(initiatorId, receiverId) {
    const sessionId = `sess_${initiatorId}_${receiverId}_${Date.now()}`;
    const session = {
      id: sessionId,
      initiatorId,
      receiverId,
      state: 'initiating',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  updateSessionState(sessionId, state) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = state;
      session.updatedAt = Date.now();
    }
    return session;
  }

  listSessions() {
    return Array.from(this.sessions.values());
  }
}

module.exports = new Store();
