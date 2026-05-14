// src/composables/useNetwork.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { Network } from '@capacitor/network';
import { useUiStore } from '../stores/ui.store';

export function useNetwork() {
  const isOnline = ref(true);
  const networkType = ref<string>('unknown');
  const uiStore = useUiStore();

  let handler: any;

  async function checkNetworkStatus(): Promise<void> {
    try {
      const status = await Network.getStatus();
      isOnline.value = status.connected;
      networkType.value = status.connectionType;

      if (!status.connected) {
        uiStore.setOffline();
      } else {
        uiStore.setOnline();
      }
    } catch (error) {
      console.error('Network check failed:', error);
    }
  }

  function startMonitoring(): void {
    Network.addListener('networkStatusChange', (status) => {
      isOnline.value = status.connected;
      networkType.value = status.connectionType;

      if (!status.connected) {
        uiStore.setOffline();
      } else {
        uiStore.setOnline();
      }
    }).then((listener) => {
      handler = listener;
    });
  }

  function stopMonitoring(): void {
    if (handler) {
      handler.remove();
    }
  }

  onMounted(async () => {
    await checkNetworkStatus();
    startMonitoring();
  });

  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    isOnline,
    networkType,
    checkNetworkStatus,
  };
}