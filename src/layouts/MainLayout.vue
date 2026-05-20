<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header (Sticky) -->
    <AppHeader :page-title="pageTitle" />

    <!-- Footer Navigation (Sticky - always at bottom) -->
    <AppFooter />

    <!-- Page Content -->
    <q-page-container class="page-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from 'src/components/ui/AppHeader.vue'
import AppFooter from 'src/components/ui/AppFooter.vue'

const route = useRoute()

const pageTitle = computed(() => (route.meta?.title as string) || 'Dashboard')
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-content {
  padding: 16px;
  overflow-y: auto;
  padding-bottom: 16px;
  scroll-behavior: smooth;
}

@media (max-width: 600px) {
  .page-content {
    padding: 12px;
  }
}

:deep(.q-layout) {
  height: 100vh;
}

:deep(.q-footer) {
  z-index: 1000;
}

:deep(.q-header) {
  z-index: 1001;
}
</style>
