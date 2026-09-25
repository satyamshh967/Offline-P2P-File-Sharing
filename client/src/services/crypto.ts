/**
 * Web Crypto API AES-256-GCM End-to-End Encryption and SHA-256 Integrity Verification
 */

const SALT = new TextEncoder().encode('FileUp_P2P_Offline_Salt_2026');

class CryptoService {
  private cryptoKey: CryptoKey | null = null;
  private currentPassphrase: string = 'fileup-secure-default';

  constructor() {
    this.initKey(this.currentPassphrase);
  }

  async setPassphrase(passphrase: string): Promise<void> {
    this.currentPassphrase = passphrase;
    await this.initKey(passphrase);
  }

  getPassphrase(): string {
    return this.currentPassphrase;
  }

  private async initKey(passphrase: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: SALT,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.cryptoKey;
  }

  async encryptChunk(data: ArrayBuffer): Promise<{ iv: Uint8Array; cipherData: ArrayBuffer }> {
    if (!this.cryptoKey) {
      await this.initKey(this.currentPassphrase);
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV standard for AES-GCM
    const cipherData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.cryptoKey!,
      data
    );

    return { iv, cipherData };
  }

  async decryptChunk(cipherData: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
    if (!this.cryptoKey) {
      await this.initKey(this.currentPassphrase);
    }

    return await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any
      },
      this.cryptoKey!,
      cipherData
    );
  }

  async computeSHA256(data: ArrayBuffer | Blob): Promise<string> {
    let buffer: ArrayBuffer;
    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      buffer = data;
    }

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const cryptoService = new CryptoService();
