import { SDKParams } from '@/index';

interface GlobalStateType extends SDKParams {
  tokens?: Record<string, any>;
}

// Memory storage implementation for environments without localStorage
class MemoryStorage implements Storage {
  private items: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.items[key] || null;
  }

  setItem(key: string, value: string): void {
    this.items[key] = value;
  }

  removeItem(key: string): void {
    delete this.items[key];
  }

  clear(): void {
    this.items = {};
  }

  get length(): number {
    return Object.keys(this.items).length;
  }

  key(index: number): string | null {
    return Object.keys(this.items)[index] || null;
  }
}

class GlobalState {
  private static instance: GlobalState;
  private state: GlobalStateType = {
    chain: 'near',
    network: 'mainnet',
  };
  private storage: Storage;
  private readonly storageNamespace = 'DELTA_SDK';

  private constructor() {
    // Auto-detect environment and use appropriate storage
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = new MemoryStorage();
    }
  }

  public static getInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  public set<K extends keyof GlobalStateType>(key: K, value: GlobalStateType[K]): void {
    this.state[key] = value;
  }

  public get<K extends keyof GlobalStateType>(key: K): GlobalStateType[K] {
    return this.state[key];
  }

  public remove<K extends keyof GlobalStateType>(key: K): void {
    delete this.state[key];
  }

  public getStorage(): Storage {
    return this.storage;
  }

  public getStorageNamespace(): string {
    return this.storageNamespace;
  }

  public getStorageKey(key: string): string {
    return `${this.storageNamespace}:${key}`;
  }

  public loadFromStorage<T>(key: string): T | null {
    try {
      const value = this.storage.getItem(this.getStorageKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to load ${key} from storage:`, error);
      return null;
    }
  }

  public saveToStorage(key: string, value: any): void {
    try {
      this.storage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
    }
  }

  public removeFromStorage(key: string): void {
    try {
      this.storage.removeItem(this.getStorageKey(key));
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  }
}

export const globalState = GlobalState.getInstance();
