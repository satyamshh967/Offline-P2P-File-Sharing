/**
 * Signaling service using WebSocket with REST fallback
 */

import { Device } from '../types';

type MessageHandler = (data: any) => void;

class SignalingService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private isConnecting: boolean = false;
  private localDevice: Device | null = null;
  private serverUrl: string = '';

  constructor() {
    this.serverUrl = this.determineServerUrl();
  }

  private determineServerUrl(): string {
    const loc = window.location;
    // Default to port 3001 on the same hostname (works on LAN Wi-Fi too)
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${loc.hostname}:3001`;
  }

  setServerHost(host: string, port: number = 3001) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.serverUrl = `${protocol}//${host}:${port}`;
    if (this.ws) {
      this.ws.close();
    }
    if (this.localDevice) {
      this.connect(this.localDevice);
    }
  }

  connect(device: Device) {
    this.localDevice = device;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.isConnecting = true;
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.send({
          type: 'register',
          device: this.localDevice
        });
        this.emit('connection-status', { connected: true, url: this.serverUrl });

        // Start heartbeat
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
          this.send({ type: 'heartbeat' });
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (err) {
          console.error('[Signaling Client] Failed to parse message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.emit('connection-status', { connected: false, url: this.serverUrl });
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        // Retry connection every 4s
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.localDevice) {
              this.connect(this.localDevice);
            }
          }, 4000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[Signaling Client] WebSocket error:', err);
        this.emit('connection-status', { connected: false, url: this.serverUrl });
      };
    } catch (err) {
      console.warn('[Signaling Client] Connection failed:', err);
      this.emit('connection-status', { connected: false, url: this.serverUrl });
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Fallback to REST if WebSocket is momentarily unavailable
      this.sendViaRest(data);
    }
  }

  private async sendViaRest(data: any) {
    const httpProtocol = window.location.protocol;
    const hostname = window.location.hostname;
    const restBase = `${httpProtocol}//${hostname}:3001/signal`;

    try {
      if (data.type === 'offer') {
        await fetch(`${restBase}/offer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else if (data.type === 'answer') {
        await fetch(`${restBase}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else if (data.type === 'ice-candidate') {
        await fetch(`${restBase}/ice-candidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
    } catch (e) {
      console.warn('[Signaling REST fallback] Failed to send:', e);
    }
  }

  async fetchPeers(excludeId?: string): Promise<Device[]> {
    try {
      const hostname = window.location.hostname;
      const res = await fetch(`http://${hostname}:3001/signal/peers${excludeId ? `?exclude=${excludeId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        return data.peers || [];
      }
    } catch (e) {
      // Offline fallback
    }
    return [];
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: MessageHandler) {
    if (this.handlers.has(event)) {
      this.handlers.get(event)!.delete(handler);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.handlers.get(event);
    if (listeners) {
      listeners.forEach((handler) => handler(data));
    }
  }

  disconnect() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const signalingService = new SignalingService();
