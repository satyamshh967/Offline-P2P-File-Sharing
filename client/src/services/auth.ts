import { User } from '../types';

const TOKEN_KEY = 'drive_auth_token';
const USER_KEY = 'drive_auth_user';
const GUEST_KEY = 'drive_is_guest';
const OFFLINE_USERS_KEY = 'drive_offline_users';

type AuthListener = (user: User | null, isGuest: boolean) => void;

interface StoredOfflineUser extends User {
  passwordHash: string;
}

class AuthService {
  private currentUser: User | null = null;
  private isGuestMode: boolean = false;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.loadCachedAuth();
    if (this.currentUser && !this.isGuestMode) {
      this.validateSession().catch(() => {});
    }
  }

  private loadCachedAuth() {
    try {
      const cachedGuest = localStorage.getItem(GUEST_KEY);
      if (cachedGuest === 'true') {
        this.isGuestMode = true;
      }

      const cachedUser = localStorage.getItem(USER_KEY);
      if (cachedUser) {
        this.currentUser = JSON.parse(cachedUser);
      }
    } catch (e) {
      console.warn('[AuthService] Error loading cached auth:', e);
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const loc = window.location;
    // Try relative URL (Vite proxy / standard) first, then direct port 3001
    const targets = [
      `/api/auth${endpoint}`,
      `${loc.protocol}//${loc.hostname}:3001/api/auth${endpoint}`
    ];

    let lastError: any = null;
    for (const url of targets) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return res;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Network error: server unreachable');
  }

  private getOfflineUsers(): StoredOfflineUser[] {
    try {
      const raw = localStorage.getItem(OFFLINE_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveOfflineUser(user: StoredOfflineUser) {
    try {
      const users = this.getOfflineUsers();
      const existingIdx = users.findIndex(u => u.username === user.username || u.email === user.email);
      if (existingIdx >= 0) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('[AuthService] Could not cache offline user:', e);
    }
  }

  async validateSession(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await this.fetchWithFallback('/me', {
        headers: this.getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.currentUser = data.user;
          this.isGuestMode = false;
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          this.notifyListeners();
          return data.user;
        }
      } else if (res.status === 401) {
        this.logout();
      }
    } catch (e) {
      // Server offline: maintain cached user session for offline continuity
      console.log('[AuthService] Server offline, retaining active offline session');
    }
    return this.currentUser;
  }

  async login(usernameOrEmail: string, password: string): Promise<User> {
    const cleanQuery = usernameOrEmail.trim().toLowerCase();

    // 1. Try server login
    try {
      const res = await this.fetchWithFallback('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      this.currentUser = data.user;
      this.isGuestMode = false;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.removeItem(GUEST_KEY);

      // Cache for offline access
      this.saveOfflineUser({
        ...data.user,
        passwordHash: btoa(password) // basic local obfuscation
      });

      this.notifyListeners();
      return data.user;
    } catch (err: any) {
      // 2. Offline fallback: check offline users
      const offlineUsers = this.getOfflineUsers();
      const match = offlineUsers.find(u => 
        (u.username.toLowerCase() === cleanQuery || u.email.toLowerCase() === cleanQuery) &&
        u.passwordHash === btoa(password)
      );

      if (match) {
        const { passwordHash: _, ...publicUser } = match;
        this.currentUser = publicUser;
        this.isGuestMode = false;
        localStorage.setItem(TOKEN_KEY, `token_offline_${Date.now()}`);
        localStorage.setItem(USER_KEY, JSON.stringify(publicUser));
        localStorage.removeItem(GUEST_KEY);
        this.notifyListeners();
        return publicUser;
      }

      // 3. Built-in offline demo account
      if (cleanQuery === 'satyam' && password === 'drive123') {
        const demoUser: User = {
          id: 'usr_offline_demo',
          username: 'satyam',
          name: 'Satyam Sharma',
          email: 'satyam@offline.p2p',
          avatarColor: '#2563eb'
        };
        this.currentUser = demoUser;
        this.isGuestMode = false;
        localStorage.setItem(TOKEN_KEY, `token_offline_${Date.now()}`);
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        localStorage.removeItem(GUEST_KEY);
        this.notifyListeners();
        return demoUser;
      }

      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network error') || err.name === 'AbortError')) {
        throw new Error('Signaling server is offline. Use demo account (satyam / drive123) or Offline Guest mode.');
      }

      throw err;
    }
  }

  async register(username: string, name: string, email: string, password: string, avatarColor: string = '#2563eb'): Promise<User> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try server registration
    try {
      const res = await this.fetchWithFallback('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password, avatarColor })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      this.currentUser = data.user;
      this.isGuestMode = false;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.removeItem(GUEST_KEY);

      // Cache locally for offline usage
      this.saveOfflineUser({
        ...data.user,
        passwordHash: btoa(password)
      });

      this.notifyListeners();
      return data.user;
    } catch (err: any) {
      // 2. Offline Fallback Registration:
      // If server is unreachable or offline, register locally in browser storage!
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network error') || err.name === 'AbortError')) {
        console.warn('[AuthService] Server offline, creating local offline account');

        const offlineUser: User = {
          id: `usr_offline_${Date.now()}`,
          username: cleanUsername,
          name: name.trim() || cleanUsername,
          email: cleanEmail,
          avatarColor: avatarColor,
          createdAt: Date.now()
        };

        this.saveOfflineUser({
          ...offlineUser,
          passwordHash: btoa(password)
        });

        this.currentUser = offlineUser;
        this.isGuestMode = false;
        localStorage.setItem(TOKEN_KEY, `token_offline_${Date.now()}`);
        localStorage.setItem(USER_KEY, JSON.stringify(offlineUser));
        localStorage.removeItem(GUEST_KEY);

        this.notifyListeners();
        return offlineUser;
      }

      throw err;
    }
  }

  continueAsGuest(guestName?: string): User {
    const name = guestName || `Guest (${Math.random().toString(36).substring(2, 6).toUpperCase()})`;
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '_')}@offline.local`,
      avatarColor: '#64748b'
    };

    this.currentUser = guestUser;
    this.isGuestMode = true;
    localStorage.setItem(USER_KEY, JSON.stringify(guestUser));
    localStorage.setItem(GUEST_KEY, 'true');
    localStorage.removeItem(TOKEN_KEY);

    this.notifyListeners();
    return guestUser;
  }

  logout() {
    try {
      this.fetchWithFallback('/logout', {
        method: 'POST',
        headers: this.getAuthHeaders()
      }).catch(() => {});
    } catch {}

    this.currentUser = null;
    this.isGuestMode = false;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GUEST_KEY);

    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isGuest(): boolean {
    return this.isGuestMode;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  subscribe(listener: AuthListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentUser, this.isGuestMode));
  }
}

export const authService = new AuthService();
