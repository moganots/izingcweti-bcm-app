<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.store';
import { useSyncStore } from './stores/sync.store';
import { useNetwork } from './composables/useNetwork';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

const authStore = useAuthStore();
const syncStore = useSyncStore();
const { isOnline } = useNetwork();

onMounted(async () => {
  // Initialize app
  await initializeApp();
});

async function initializeApp(): Promise<void> {
  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    
    // Hide splash screen
    await SplashScreen.hide();
    
    // Check authentication
    await authStore.checkAuth();
    
    // Initialize sync if online
    if (isOnline.value) {
      await syncStore.initializeSync();
    }
  } catch (error) {
    console.error('App initialization failed:', error);
  }
}
</script>

<style lang="scss">
@import './assets/styles/app.scss';
</style>