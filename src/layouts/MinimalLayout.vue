<template>
  <q-layout view="hHh lpR fFf">
    <!-- Minimal Header with back button -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn v-if="showBack" flat dense round icon="arrow_back" @click="$router.back()" />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
        <slot name="header-actions" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" :duration="150">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  return (route.meta?.title as string) || 'Izingcweti BCM App'
})

const showBack = computed(() => {
  return route.meta?.showBack !== false
})
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
