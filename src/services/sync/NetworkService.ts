import { ref, readonly } from 'vue';

export enum ConnectionType {
  NONE = 'none',
  UNKNOWN = 'unknown',
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
}

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  [ConnectionType.NONE]: 'Offline',
  [ConnectionType.UNKNOWN]: 'Unknown',
  [ConnectionType.WIFI]: 'WiFi',
  [ConnectionType.CELLULAR]: 'Cellular',
  [ConnectionType.ETHERNET]: 'Ethernet',
};

export class NetworkService {
  private _isOnline = ref(navigator.onLine);
  private _connectionType = ref<ConnectionType>(ConnectionType.UNKNOWN);
  private _listeners: Set<(status: { isOnline: boolean; connectionType: ConnectionType }) => void> =
    new Set();

  constructor() {
    // Set up browser online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this._isOnline.value = true;
        this.notifyListeners();
      });
      window.addEventListener('offline', () => {
        this._isOnline.value = false;
        this.notifyListeners();
      });
    }
  }

  get isOnline() {
    return readonly(this._isOnline);
  }

  get connectionType() {
    return readonly(this._connectionType);
  }

  addListener(
    listener: (status: { isOnline: boolean; connectionType: ConnectionType }) => void
  ): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const status = {
      isOnline: this._isOnline.value,
      connectionType: this._connectionType.value,
    };
    this._listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-store',
      });
      const isOnline = response.ok;
      if (isOnline !== this._isOnline.value) {
        this._isOnline.value = isOnline;
        this.notifyListeners();
      }
      return isOnline;
    } catch {
      if (this._isOnline.value) {
        this._isOnline.value = false;
        this.notifyListeners();
      }
      return false;
    }
  }
}

export const networkService = new NetworkService();