<!-- src/layouts/user/MainLayout.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header (Sticky) -->
    <AppHeader :page-title="pageTitle" />

    <!-- Footer Navigation (Sticky - always at bottom) -->
    <AppFooter @toggle-drawer="toggleMenuDrawer" />

    <!-- Menu Drawer (Right Side) -->
    <MenuDrawer v-model="menuDrawerOpen" />

    <!-- Page Content (Scrollable area between header and footer) -->
    <q-page-container class="page-content">
      <keep-alive>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from 'src/components/ui/AppHeader.vue'
import AppFooter from 'src/components/ui/AppFooter.vue'
import MenuDrawer from 'src/components/ui/MenuDrawer.vue'

const route = useRoute()
const menuDrawerOpen = ref(false)

const pageTitle = computed(() => (route.meta?.title as string) || 'Dashboard')

function toggleMenuDrawer(): void {
  menuDrawerOpen.value = !menuDrawerOpen.value
}
</script>

<style lang="scss" scoped>
// Fade transition for route changes
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Page content styling
.page-content {
  // Header is sticky by default with q-header
  // Footer is sticky by default with q-footer
  // Content area scrolls naturally between them

  padding: 16px;

  // Ensure proper scrolling behavior
  overflow-y: auto;

  // Calculate min-height to fill space between header and footer
  // q-page-container automatically handles this, but we add padding bottom for safety
  padding-bottom: 16px;

  // Smooth scrolling
  scroll-behavior: smooth;
}

// Mobile adjustments
@media (max-width: 600px) {
  .page-content {
    padding: 12px;
  }
}

// Ensure the layout takes full viewport height
:deep(.q-layout) {
  height: 100vh;
}

// Ensure footer stays at bottom
:deep(.q-footer) {
  z-index: 1000;
}

// Ensure header stays at top
:deep(.q-header) {
  z-index: 1001;
}
</style>
