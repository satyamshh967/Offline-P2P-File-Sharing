import { User } from '../types';

const TOKEN_KEY = 'drive_auth_token';
const USER_KEY = 'drive_auth_user';
const GUEST_KEY = 'drive_is_guest';

type AuthListener = (user: User | null, isGuest: boolean) => void;

class AuthService {
  private currentUser: User | null = null;
  private isGuestMode: boolean = false;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.loadCachedAuth();
    // Validate session with server if token exists
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

  private getApiBase(): string {
    const loc = window.location;
    return `${loc.protocol}//${loc.hostname}:3001/api/auth`;
  }

  async validateSession(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await fetch(`${this.getApiBase()}/me`, {
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
        // Token expired
        this.logout();
      }
    } catch (e) {
      // Offline fallback: use cached user!
      console.log('[AuthService] Server offline, using cached credentials');
    }
    return this.currentUser;
  }

  async login(usernameOrEmail: string, password: string): Promise<User> {
    try {
      const res = await fetch(`${this.getApiBase()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      this.currentUser = data.user;
      this.isGuestMode = false;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.removeItem(GUEST_KEY);

      this.notifyListeners();
      return data.user;
    } catch (err: any) {
      // Offline fallback: check if offline demo user
      if (err.message && err.message.includes('Failed to fetch') && usernameOrEmail === 'satyam' && password === 'drive123') {
        const demoUser: User = {
          id: 'usr_offline_demo',
          username: 'satyam',
          name: 'Satyam Sharma',
          email: 'satyam@offline.p2p',
          avatarColor: '#2563eb'
        };
        this.currentUser = demoUser;
        this.isGuestMode = false;
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        localStorage.removeItem(GUEST_KEY);
        this.notifyListeners();
        return demoUser;
      }
      throw err;
    }
  }

  async register(username: string, name: string, email: string, password: string, avatarColor: string = '#2563eb'): Promise<User> {
    const res = await fetch(`${this.getApiBase()}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, email, password, avatarColor })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    this.currentUser = data.user;
    this.isGuestMode = false;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.removeItem(GUEST_KEY);

    this.notifyListeners();
    return data.user;
  }

  continueAsGuest(guestName?: string) {
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`${this.getApiBase()}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      }).catch(() => {});
    }

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
