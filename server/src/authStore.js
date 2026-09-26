const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

class AuthStore {
  constructor() {
    this.users = new Map(); // id -> user
    this.sessions = new Map(); // token -> userId
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn('[AuthStore] Could not create data dir:', err.message);
      }
    }

    if (fs.existsSync(USERS_FILE)) {
      try {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(u => this.users.set(u.id, u));
        }
      } catch (err) {
        console.warn('[AuthStore] Could not read users file:', err.message);
      }
    }

    // Create a default demo user if empty
    if (this.users.size === 0) {
      this.register('satyam', 'Satyam Sharma', 'satyam@offline.p2p', 'drive123', '#2563eb');
    }
  }

  save() {
    try {
      const list = Array.from(this.users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[AuthStore] Could not save users file:', err.message);
    }
  }

  hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  }

  register(username, name, email, password, avatarColor = '#2563eb') {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    for (const u of this.users.values()) {
      if (u.username === cleanUsername) {
        throw new Error('Username already exists');
      }
      if (u.email === cleanEmail) {
        throw new Error('Email already registered');
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(password, salt);
    const id = `usr_${crypto.randomBytes(8).toString('hex')}`;

    const user = {
      id,
      username: cleanUsername,
      name: name.trim() || cleanUsername,
      email: cleanEmail,
      salt,
      hash,
      avatarColor,
      createdAt: Date.now()
    };

    this.users.set(id, user);
    this.save();

    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, id);

    const { salt: _, hash: __, ...publicUser } = user;
    return { user: publicUser, token };
  }

  login(usernameOrEmail, password) {
    const query = usernameOrEmail.trim().toLowerCase();
    let foundUser = null;

    for (const u of this.users.values()) {
      if (u.username === query || u.email === query) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid username or password');
    }

    const inputHash = this.hashPassword(password, foundUser.salt);
    if (inputHash !== foundUser.hash) {
      throw new Error('Invalid username or password');
    }

    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, foundUser.id);

    const { salt: _, hash: __, ...publicUser } = foundUser;
    return { user: publicUser, token };
  }

  getUserByToken(token) {
    if (!token) return null;
    const userId = this.sessions.get(token);
    if (!userId) return null;
    const user = this.users.get(userId);
    if (!user) return null;

    const { salt: _, hash: __, ...publicUser } = user;
    return publicUser;
  }

  logout(token) {
    if (token) {
      this.sessions.delete(token);
    }
    return true;
  }
}

module.exports = new AuthStore();
