<!-- src/layouts/MainLayout.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="uiStore.toggleDrawer()"
        />

        <q-toolbar-title>
          {{ route.meta.title || 'BCM Mobile' }}
        </q-toolbar-title>

        <q-btn
          v-if="syncStore.hasPendingChanges"
          flat
          dense
          round
          icon="sync"
          :color="syncStore.isSyncing ? 'orange' : 'white'"
          @click="handleSync"
        >
          <q-badge
            v-if="syncStore.pendingCount > 0"
            floating
            color="red"
          >
            {{ syncStore.pendingCount }}
          </q-badge>
          <q-tooltip>
            {{ syncStore.isSyncing ? 'Syncing...' : 'Sync changes' }}
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          round
          icon="notifications"
          @click="$router.push('/notifications')"
        >
          <q-badge
            v-if="notificationStore.unreadCount > 0"
            floating
            color="red"
          >
            {{ notificationStore.unreadCount }}
          </q-badge>
        </q-btn>

        <q-btn
          flat
          dense
          round
          icon="person"
          @click="$router.push('/profile')"
        />
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer
      v-model="uiStore.isDrawerOpen"
      show-if-above
      :width="280"
      :breakpoint="500"
      bordered
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header>
            BCM System
          </q-item-label>

          <q-separator spaced />

          <q-expansion-item
            v-for="group in menuGroups"
            :key="group.label"
            :icon="group.icon"
            :label="group.label"
            :default-opened="isGroupActive(group)"
          >
            <q-item
              v-for="item in group.items"
              :key="item.name"
              :to="{ name: item.name }"
              :active="route.name === item.name"
              clickable
              v-ripple
              exact
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                {{ item.label }}
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>

      <div class="absolute-bottom">
        <q-separator />
        <q-list>
          <q-item
            clickable
            v-ripple
            @click="$router.push('/settings')"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            @click="handleLogout"
          >
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <OfflineBanner v-if="uiStore.isOffline" />
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui.store';
import { useSyncStore } from '../stores/sync.store';
import { useNotificationStore } from '../stores/notification.store';
import { useAuthStore } from '../stores/auth.store';
import OfflineBanner from '../components/common/OfflineBanner.vue';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const syncStore = useSyncStore();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const menuGroups = [
  {
    label: 'BCM',
    icon: 'business',
    items: [
      { name: 'CriticalFunctions', label: 'Critical Functions', icon: 'functions' },
      { name: 'BIA', label: 'BIA', icon: 'assessment' },
      { name: 'BCP', label: 'BCP', icon: 'description' },
      { name: 'RecoveryStrategies', label: 'Recovery Strategies', icon: 'restore' },
      { name: 'ExerciseTests', label: 'Exercise Tests', icon: 'playlist_add_check' },
    ],
  },
  {
    label: 'Risk & Compliance',
    icon: 'shield',
    items: [
      { name: 'Risks', label: 'Risks', icon: 'warning' },
      { name: 'Incidents', label: 'Incidents', icon: 'report' },
    ],
  },
  {
    label: 'Workflow',
    icon: 'account_tree',
    items: [
      { name: 'Workflows', label: 'Workflows', icon: 'account_tree' },
    ],
  },
];

function isGroupActive(group: any): boolean {
  return group.items.some((item: any) => route.name === item.name);
}

async function handleSync(): Promise<void> {
  try {
    await syncStore.fullSync();
    $q.notify({
      type: 'positive',
      message: 'Sync completed successfully',
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: `Sync failed: ${error.message}`,
    });
  }
}

async function handleLogout(): Promise<void> {
  try {
    await authStore.logout();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>