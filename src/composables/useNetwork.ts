import { ref, onMounted, onUnmounted } from 'vue';
import { Network } from '@capacitor/network';
import { useUiStore } from '../stores/ui.store';

/**
 * Composable for monitoring network connectivity
 */
export function useNetwork() {
  const isOnline = ref(true);
  const connectionType = ref<string>('unknown');
  const isMetered = ref(false);
  const signalStrength = ref(0);
  const lastChecked = ref<string | null>(null);

  const uiStore = useUiStore();
  let capacitorListener: any = null;

  /**
   * Check current network status
   */
  async function checkStatus(): Promise<void> {
    try {
      const status = await Network.getStatus();
      updateStatus(status.connected, status.connectionType);
    } catch (error) {
      console.error('Network check failed:', error);
      isOnline.value = navigator.onLine;
    }
  }

  /**
   * Update network status
   */
  function updateStatus(connected: boolean, type: string): void {
    isOnline.value = connected;
    connectionType.value = connected ? type : 'none';
    lastChecked.value = new Date().toISOString();

    // Check if connection is metered
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        isMetered.value = conn.saveData || false;
        signalStrength.value = conn.downlink || 0;
      }
    }

    // Update UI store
    if (connected) {
      uiStore.setOnline(type);
    } else {
      uiStore.setOffline();
    }
  }

  /**
   * Start monitoring network changes
   */
  async function startMonitoring(): Promise<void> {
    await checkStatus();

    try {
      capacitorListener = await Network.addListener('networkStatusChange', (status) => {
        updateStatus(status.connected, status.connectionType);
      });
    } catch (error) {
      console.warn('Capacitor network listener failed:', error);
    }

    // Browser fallback
    window.addEventListener('online', () => updateStatus(true, connectionType.value));
    window.addEventListener('offline', () => updateStatus(false, 'none'));
  }

  /**
   * Stop monitoring network changes
   */
  function stopMonitoring(): void {
    if (capacitorListener) {
      capacitorListener.remove();
      capacitorListener = null;
    }
    window.removeEventListener('online', () => updateStatus(true, connectionType.value));
    window.removeEventListener('offline', () => updateStatus(false, 'none'));
  }

  /**
   * Check if connection is suitable for sync
   */
  function isSyncSafe(): boolean {
    if (!isOnline.value) return false;
    if (isMetered.value) return false;
    return true;
  }

  /**
   * Check if connection is WiFi
   */
  function isWiFi(): boolean {
    return connectionType.value === 'wifi';
  }

  /**
   * Check if connection is cellular
   */
  function isCellular(): boolean {
    return connectionType.value === 'cellular';
  }

  onMounted(() => {
    startMonitoring();
  });

  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    isOnline,
    connectionType,
    isMetered,
    signalStrength,
    lastChecked,
    checkStatus,
    startMonitoring,
    stopMonitoring,
    isSyncSafe,
    isWiFi,
    isCellular,
  };
}