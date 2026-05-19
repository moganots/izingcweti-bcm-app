<template>
  <q-footer elevated class="bg-primary text-white">
    <q-tabs
      v-model="selectedTab"
      inline-label
      class="text-white"
      active-color="yellow"
      indicator-color="yellow"
      @update:model-value="handleTabChange"
    >
      <q-tab name="home" icon="home" label="Home" />
      <q-tab name="notifications" icon="notifications" label="Notifications">
        <q-badge v-if="unreadCount > 0" color="red" floating>
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </q-badge>
      </q-tab>
      <q-tab name="sync" icon="sync" :label="syncLabel">
        <q-badge v-if="pendingCount > 0" color="orange" floating>
          {{ pendingCount > 99 ? '99+' : pendingCount }}
        </q-badge>
      </q-tab>
      <q-tab name="profile" icon="person" label="Profile" />
      <q-tab name="menu" icon="menu" label="Menu" />
    </q-tabs>
  </q-footer>

  <!-- Popup Menu Drawer -->
  <q-dialog
    v-model="menuDialogOpen"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    :maximized="false"
    full-width
    @update:model-value="handleDialogClose"
  >
    <q-card class="menu-dialog-card" :class="{ 'bg-dark text-white': isDarkMode }">
      <q-card-section class="q-pa-sm">
        <div class="row items-center justify-between q-pa-md">
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-sm">
              <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
            </q-avatar>
            <div>
              <div class="text-subtitle1 text-weight-bold">Menu</div>
              <div class="text-caption text-grey-6">Navigate to any section</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-scroll-area style="height: 50vh; max-height: 400px">
          <q-list padding>
            <!-- User Info Section -->
            <div class="user-info-section q-pa-md bg-grey-2" :class="{ 'bg-grey-9': isDarkMode }">
              <div class="row items-center">
                <q-avatar size="48px" class="q-mr-md">
                  <img src="/default-avatar.png" alt="Avatar" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bold">{{ userFullName }}</div>
                  <div class="text-caption text-grey-6">{{ userEmail }}</div>
                  <q-badge :color="userRole === 'Admin' ? 'primary' : 'info'" class="q-mt-xs">
                    {{ userRole || 'User' }}
                  </q-badge>
                </div>
              </div>
            </div>

            <q-separator />

            <!-- Main Menu Groups -->
            <template v-for="group in menuGroups" :key="group.label">
              <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
                {{ group.label }}
              </q-item-label>

              <q-item
                v-for="item in group.items"
                :key="item.name"
                clickable
                v-ripple
                :to="{ name: item.name }"
                :active="route.name === item.name"
                exact
                active-class="text-primary"
                @click="closeMenu"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" size="20px" />
                </q-item-section>
                <q-item-section>{{ item.label }}</q-item-section>
                <q-item-section v-if="item.badge" side>
                  <q-badge :color="item.badgeColor" :label="item.badge" />
                </q-item-section>
              </q-item>
            </template>

            <q-separator spaced />

            <!-- Admin Section -->
            <template v-if="authStore.isAdmin">
              <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
                Administration
              </q-item-label>

              <q-item
                v-for="item in adminItems"
                :key="item.name"
                clickable
                v-ripple
                :to="{ name: item.name }"
                :active="route.name === item.name"
                exact
                active-class="text-primary"
                @click="closeMenu"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>
                <q-item-section>{{ item.label }}</q-item-section>
              </q-item>
            </template>

            <q-separator spaced />

            <!-- System Section -->
            <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
              System
            </q-item-label>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'Documents' }"
              exact
              active-class="text-primary"
              @click="closeMenu"
            >
              <q-item-section avatar>
                <q-icon name="folder" />
              </q-item-section>
              <q-item-section>Documents</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'Settings' }"
              exact
              active-class="text-primary"
              @click="closeMenu"
            >
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Sync Action -->
            <q-item clickable v-ripple @click="handleSyncFromMenu">
              <q-item-section avatar>
                <q-icon
                  name="sync"
                  :color="syncStore.isSyncing ? 'orange' : 'primary'"
                  :class="{ 'rotate-animation': syncStore.isSyncing }"
                />
              </q-item-section>
              <q-item-section>
                {{ syncStore.isSyncing ? 'Syncing...' : 'Sync Now' }}
              </q-item-section>
              <q-item-section side v-if="syncStore.lastSyncAt">
                <span class="text-caption text-grey-6">
                  {{ formatTimeAgo(syncStore.lastSyncAt) }}
                </span>
              </q-item-section>
            </q-item>

            <!-- Logout Action -->
            <q-item clickable v-ripple @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section class="text-negative">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Full Screen Drawer for Desktop -->
  <q-drawer
    v-model="drawerOpen"
    side="right"
    :width="320"
    :breakpoint="1024"
    bordered
    :class="{ 'bg-dark text-white': isDarkMode }"
    @update:model-value="handleDrawerChange"
  >
    <!-- Drawer content -->
    <div class="drawer-header q-pa-md">
      <div class="row items-center">
        <q-avatar size="48px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-h6">Izingcweti BCM</div>
          <div class="text-caption text-grey-4">
            {{ userRole || 'User' }}
          </div>
        </div>
      </div>

      <div class="q-mt-sm">
        <div class="text-subtitle2">{{ userFullName }}</div>
        <div class="text-caption text-grey-4">{{ userEmail }}</div>
      </div>

      <div v-if="syncStore.hasPendingChanges" class="sync-status q-mt-sm">
        <q-badge color="orange" class="full-width text-center q-py-xs">
          <q-icon name="sync" size="14px" class="q-mr-xs" />
          {{ syncStore.pendingCount }} pending changes
        </q-badge>
      </div>
    </div>

    <q-separator />

    <q-scroll-area class="fit">
      <q-list padding>
        <!-- Same menu content as dialog -->
        <template v-for="group in menuGroups" :key="group.label">
          <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            {{ group.label }}
          </q-item-label>

          <q-item
            v-for="item in group.items"
            :key="item.name"
            clickable
            v-ripple
            :to="{ name: item.name }"
            :active="route.name === item.name"
            exact
            active-class="text-primary"
            @click="closeDrawer"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <q-separator spaced />

        <template v-if="authStore.isAdmin">
          <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            Administration
          </q-item-label>

          <q-item
            v-for="item in adminItems"
            :key="item.name"
            clickable
            v-ripple
            :to="{ name: item.name }"
            :active="route.name === item.name"
            exact
            active-class="text-primary"
            @click="closeDrawer"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <q-separator spaced />

        <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
          System
        </q-item-label>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'Documents' }"
          exact
          active-class="text-primary"
          @click="closeDrawer"
        >
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>Documents</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'Settings' }"
          exact
          active-class="text-primary"
          @click="closeDrawer"
        >
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable v-ripple @click="handleSyncFromDrawer">
          <q-item-section avatar>
            <q-icon
              name="sync"
              :color="syncStore.isSyncing ? 'orange' : 'primary'"
              :class="{ 'rotate-animation': syncStore.isSyncing }"
            />
          </q-item-section>
          <q-item-section>
            {{ syncStore.isSyncing ? 'Syncing...' : 'Sync Now' }}
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Logout</q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore, useSyncStore, useNotificationStore, useUiStore } from '../../stores'

interface MenuItem {
  name: string
  label: string
  icon: string
  badge?: string | number
  badgeColor?: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

// Define emits
const emit = defineEmits<{
  toggleDrawer: []
}>()

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()
const syncStore = useSyncStore()
const notificationStore = useNotificationStore()
const uiStore = useUiStore()

const selectedTab = ref('home')
const menuDialogOpen = ref(false)
const drawerOpen = ref(false)

const unreadCount = computed(() => notificationStore.unreadCount || 0)
const pendingCount = computed(() => syncStore.pendingCount || 0)
const isSyncing = computed(() => syncStore.isSyncing)
const syncLabel = computed(() => (isSyncing.value ? 'Syncing' : 'Sync'))
const isDarkMode = computed(() => uiStore.isDarkMode)
const userFullName = computed(() => authStore.fullName)
const userEmail = computed(() => authStore.userEmail)
const userRole = computed(() => authStore.userRole)

// Menu Groups (All navigation not in footer)
const menuGroups: MenuGroup[] = [
  {
    label: 'Business Continuity',
    items: [
      { name: 'CriticalFunctions', label: 'Critical Functions', icon: 'functions' },
      { name: 'BIA', label: 'Business Impact Analysis', icon: 'assessment' },
      { name: 'BCP', label: 'Continuity Plans', icon: 'description' },
      { name: 'RecoveryStrategies', label: 'Recovery Strategies', icon: 'restore' },
      { name: 'ExerciseTests', label: 'Exercise Tests', icon: 'playlist_add_check' },
    ],
  },
  {
    label: 'Risk & Compliance',
    items: [
      { name: 'Risks', label: 'Risk Register', icon: 'warning' },
      { name: 'Compliance', label: 'Compliance', icon: 'verified_user' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Incidents', label: 'Incidents', icon: 'report' },
      { name: 'Workflows', label: 'Workflows', icon: 'account_tree' },
    ],
  },
]

const adminItems = [
  { name: 'Users', label: 'User Management', icon: 'people' },
  { name: 'Organisations', label: 'Organisations', icon: 'business' },
  { name: 'AuditLogs', label: 'Audit Logs', icon: 'history' },
]

// Watch route changes to update selected tab
watch(
  () => route.name,
  (newName) => {
    if (newName === 'Dashboard') selectedTab.value = 'home'
    else if (newName === 'Notifications') selectedTab.value = 'notifications'
    else if (newName === 'Profile') selectedTab.value = 'profile'
    else if (newName === 'SyncDashboard') selectedTab.value = 'sync'
    // Don't change selectedTab to 'menu' for other routes
    // Keep the current selection
  },
  { immediate: true }
)

function handleTabChange(tab: string): void {
  switch (tab) {
    case 'home':
      router.push({ name: 'Dashboard' })
      break
    case 'notifications':
      router.push({ name: 'Notifications' })
      break
    case 'sync':
      router.push({ name: 'SyncDashboard' })
      break
    case 'profile':
      router.push({ name: 'Profile' })
      break
    case 'menu':
      openMenu()
      break
  }
}

async function handleSync(): Promise<void> {
  try {
    await syncStore.fullSync()
    $q.notify({ type: 'positive', message: 'Sync completed', position: 'top', timeout: 2000 })
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

async function handleSyncFromMenu(): Promise<void> {
  if (syncStore.isSyncing) return
  await handleSync()
  closeMenu()
}

async function handleSyncFromDrawer(): Promise<void> {
  if (syncStore.isSyncing) return
  await handleSync()
  closeDrawer()
}

function openMenu(): void {
  if (window.innerWidth < 1024) {
    menuDialogOpen.value = true
  } else {
    drawerOpen.value = true
  }
}

function closeMenu(): void {
  menuDialogOpen.value = false
  // Don't reset selectedTab here
}

function closeDrawer(): void {
  drawerOpen.value = false
  // Don't reset selectedTab here
}

function handleDialogClose(val: boolean): void {
  if (!val) {
    // Dialog was closed, reset selectedTab to home or current route
    if (route.name === 'Dashboard') {
      selectedTab.value = 'home'
    } else if (route.name === 'Notifications') {
      selectedTab.value = 'notifications'
    } else if (route.name === 'Profile') {
      selectedTab.value = 'profile'
    } else {
      selectedTab.value = 'home'
    }
  }
}

function handleDrawerChange(val: boolean): void {
  if (!val) {
    // Drawer was closed, reset selectedTab to home or current route
    if (route.name === 'Dashboard') {
      selectedTab.value = 'home'
    } else if (route.name === 'Notifications') {
      selectedTab.value = 'notifications'
    } else if (route.name === 'Profile') {
      selectedTab.value = 'profile'
    } else {
      selectedTab.value = 'home'
    }
  }
}

async function handleLogout(): Promise<void> {
  closeMenu()
  closeDrawer()
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await authStore.logout()
    await router.push('/auth/login')
  })
}

function formatTimeAgo(date: string | null): string {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
</script>

<style lang="scss" scoped>
.menu-dialog-card {
  border-radius: 20px 20px 0 0;
  max-width: 500px;
  margin: 0 auto;
  margin-bottom: 0;
}

// Position the dialog just above the footer
:deep(.q-dialog__inner--bottom) {
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 56px; // Height of the footer
}

// Adjust for different footer heights
@media (max-width: 600px) {
  :deep(.q-dialog__inner--bottom) {
    padding-bottom: 56px; // Mobile footer height
  }
}

@media (min-width: 601px) and (max-width: 1023px) {
  :deep(.q-dialog__inner--bottom) {
    padding-bottom: 60px; // Tablet footer height (tabs with labels)
  }
}

.user-info-section {
  border-radius: 12px;
  margin: 8px;
}

.rotate-animation {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.drawer-header {
  background: linear-gradient(
    135deg,
    var(--q-primary) 0%,
    color-mix(in srgb, var(--q-primary) 70%, black) 100%
  );
}
</style>
