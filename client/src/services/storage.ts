/**
 * IndexedDB storage for offline chunk caching and transfer resumption
 */

const DB_NAME = 'FileUp_P2P_Storage';
const DB_VERSION = 1;
const CHUNK_STORE = 'chunks';
const META_STORE = 'transfers';

class StorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase>;

  constructor() {
    this.initPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(CHUNK_STORE)) {
          const chunkStore = db.createObjectStore(CHUNK_STORE, { keyPath: ['transferId', 'index'] });
          chunkStore.createIndex('by_transfer', 'transferId', { unique: false });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event: any) => {
        console.error('[IndexedDB] Init error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async saveChunk(transferId: string, index: number, data: ArrayBuffer): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHUNK_STORE, 'readwrite');
      const store = tx.objectStore(CHUNK_STORE);
      const req = store.put({ transferId, index, data, timestamp: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getChunk(transferId: string, index: number): Promise<ArrayBuffer | null> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHUNK_STORE, 'readonly');
      const store = tx.objectStore(CHUNK_STORE);
      const req = store.get([transferId, index]);

      req.onsuccess = () => {
        resolve(req.result ? req.result.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getReceivedChunkIndices(transferId: string): Promise<number[]> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHUNK_STORE, 'readonly');
      const store = tx.objectStore(CHUNK_STORE);
      const index = store.index('by_transfer');
      const req = index.getAllKeys(IDBKeyRange.only(transferId));

      req.onsuccess = () => {
        const keys = req.result as any[];
        // keys are arrays [transferId, index]
        const indices = keys.map((k) => k[1]);
        resolve(indices.sort((a, b) => a - b));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async assembleFile(transferId: string, totalChunks: number, mimeType: string): Promise<Blob> {
    const db = await this.initPromise;
    return new Promise(async (resolve, reject) => {
      try {
        const tx = db.transaction(CHUNK_STORE, 'readonly');
        const store = tx.objectStore(CHUNK_STORE);
        const parts: ArrayBuffer[] = [];

        for (let i = 0; i < totalChunks; i++) {
          const req = store.get([transferId, i]);
          const chunkData = await new Promise<ArrayBuffer>((res, rej) => {
            req.onsuccess = () => {
              if (req.result && req.result.data) {
                res(req.result.data);
              } else {
                rej(new Error(`Missing chunk ${i} during file assembly`));
              }
            };
            req.onerror = () => rej(req.error);
          });
          parts.push(chunkData);
        }

        const blob = new Blob(parts, { type: mimeType });
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    });
  }

  async clearTransferChunks(transferId: string): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHUNK_STORE, 'readwrite');
      const store = tx.objectStore(CHUNK_STORE);
      const index = store.index('by_transfer');
      const req = index.openCursor(IDBKeyRange.only(transferId));

      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
}

export const storageService = new StorageService();
