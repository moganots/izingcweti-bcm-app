<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header with search -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>
          <span class="text-weight-medium">Dashboard</span>
        </q-toolbar-title>
        <q-btn flat dense round icon="search" @click="toggleSearch" />
        <q-btn flat dense round icon="notifications" @click="$router.push('/notifications')">
          <q-badge v-if="unreadCount > 0" floating color="red">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </q-badge>
        </q-btn>
        <q-btn flat dense round icon="person" @click="$router.push('/profile')" />
      </q-toolbar>

      <!-- Search Bar (expandable) -->
      <q-slide-transition>
        <div v-if="searchOpen" class="q-px-md q-pb-md">
          <q-input
            v-model="searchQuery"
            dark
            dense
            standout
            placeholder="Search..."
            autofocus
            @keyup.escape="searchOpen = false"
          >
            <template v-slot:append>
              <q-icon
                v-if="searchQuery"
                name="close"
                class="cursor-pointer"
                @click="searchQuery = ''"
              />
            </template>
          </q-input>
        </div>
      </q-slide-transition>
    </q-header>

    <!-- Drawer -->
    <AppDrawer v-model="drawerOpen" />

    <!-- Content -->
    <q-page-container>
      <OfflineBanner v-if="uiStore.isOffline" />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" :duration="200">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStore } from '../stores/ui/ui.store'
import { useNotificationStore } from '../stores/notification/notification.store'
import AppDrawer from '../components/.common/AppDrawer.vue'
import OfflineBanner from '../components/.common/OfflineBanner.vue'

const uiStore = useUiStore()
const notificationStore = useNotificationStore()

const drawerOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

const unreadCount = computed(() => notificationStore.unreadCount)

function toggleDrawer(): void {
  drawerOpen.value = !drawerOpen.value
}

function toggleSearch(): void {
  searchOpen.value = !searchOpen.value
  if (!searchOpen.value) {
    searchQuery.value = ''
  }
}
</script>
