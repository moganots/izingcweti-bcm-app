<template>
  <q-layout view="hHh Lpr lFf" class="main-layout">
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// Ensure DOM is ready before layout fully initializes
onMounted(() => {
  // Force a reflow to ensure Quasar calculates dimensions correctly
  document.body.style.display = 'none'
  document.body.offsetHeight // Force reflow
  document.body.style.display = ''
})
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
}

.page-container {
  min-height: calc(100vh - 50px); // Fallback in case Quasar fails to calculate
}
</style>