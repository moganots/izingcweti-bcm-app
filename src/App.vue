<template>
  <router-view />
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { onMounted } from 'vue'
import { useAuthStore, useSyncStore } from './stores'
import { useNetwork } from './composables/useNetwork'

// Only import Capacitor plugins when actually needed
// Move imports inside functions or use dynamic imports
const authStore = useAuthStore()
const syncStore = useSyncStore()
const { isOnline } = useNetwork()

onMounted(async () => {
  await initializeApp()
})

async function initializeApp(): Promise<void> {
  try {
    // Only run native code if running on a native platform
    if (Capacitor.isNativePlatform()) {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        const { SplashScreen } = await import('@capacitor/splash-screen')

        await StatusBar.setStyle({ style: Style.Dark })
        await SplashScreen.hide()
      } catch (error) {
        console.warn('Native plugins not available:', error)
      }
    } else {
      console.log('Running on web - skipping native initialization')
      // For web debugging, just hide any manual splash if exists
      const splashElement = document.getElementById('splash')
      if (splashElement) {
        splashElement.style.display = 'none'
      }
    }

    // Check authentication (works everywhere)
    await authStore.checkAuth()

    // Initialize sync if online
    if (isOnline.value) {
      await syncStore.initializeSync()
    }
  } catch (error) {
    console.error('App initialization failed:', error)
  }
}
</script>

<style lang="scss">
@import './assets/styles/app.scss';
</style>
