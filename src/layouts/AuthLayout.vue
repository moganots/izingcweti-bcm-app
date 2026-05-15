<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" :duration="200">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Auth layout is minimal - no header, drawer, or footer
// Used for Login, ForgotPassword, and other unauthenticated pages
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
