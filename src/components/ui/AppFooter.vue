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

  <!-- Popup Menu Dialog for Mobile -->
  <q-dialog
    v-model="menuDialogOpen"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    :maximized="false"
    full-width
    @hide="onMenuDialogHide"
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
                  <div class="text-subtitle1 text-weight-bold">{{ userFullName || 'User' }}</div>
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
                :active="route.name === item.name"
                active-class="text-primary"
                @click="handleMenuItemClick(item.name)"
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
                :active="route.name === item.name"
                active-class="text-primary"
                @click="handleMenuItemClick(item.name)"
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
              :active="route.name === 'Documents'"
              active-class="text-primary"
              @click="handleMenuItemClick('Documents')"
            >
              <q-item-section avatar>
                <q-icon name="folder" />
              </q-item-section>
              <q-item-section>Documents</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="route.name === 'Settings'"
              active-class="text-primary"
              @click="handleMenuItemClick('Settings')"
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

  <!-- Drawer for Desktop -->
  <q-drawer
    v-model="drawerOpen"
    side="right"
    :width="320"
    :breakpoint="1024"
    bordered
    :class="{ 'bg-dark text-white': isDarkMode }"
    @update:model-value="onDrawerChange"
  >
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
        <div class="text-subtitle2">{{ userFullName || 'User' }}</div>
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
        <template v-for="group in menuGroups" :key="group.label">
          <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            {{ group.label }}
          </q-item-label>

          <q-item
            v-for="item in group.items"
            :key="item.name"
            clickable
            v-ripple
            :active="route.name === item.name"
            active-class="text-primary"
            @click="handleDrawerItemClick(item.name)"
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
            :active="route.name === item.name"
            active-class="text-primary"
            @click="handleDrawerItemClick(item.name)"
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
          :active="route.name === 'Documents'"
          active-class="text-primary"
          @click="handleDrawerItemClick('Documents')"
        >
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>Documents</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="route.name === 'Settings'"
          active-class="text-primary"
          @click="handleDrawerItemClick('Settings')"
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

        <q-item clickable v-ripple @click="handleLogoutFromDrawer">
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

// Screen size detection
const isMobile = ref(window.innerWidth < 1024)

const unreadCount = computed(() => notificationStore.unreadCount || 0)
const pendingCount = computed(() => syncStore.pendingCount || 0)
const isSyncing = computed(() => syncStore.isSyncing)
const syncLabel = computed(() => (isSyncing.value ? 'Syncing' : 'Sync'))
const isDarkMode = computed(() => uiStore.isDarkMode)
const userFullName = computed(() => authStore.fullName)
const userEmail = computed(() => authStore.userEmail)
const userRole = computed(() => authStore.userRole)

// Menu Groups
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

// Function to update selected tab based on current route
function updateSelectedTab() {
  const routeName = route.name as string

  // Only update if we're not in menu mode (menu dialog/drawer closed)
  if (!menuDialogOpen.value && !drawerOpen.value) {
    if (routeName === 'Dashboard') {
      selectedTab.value = 'home'
    } else if (routeName === 'Notifications') {
      selectedTab.value = 'notifications'
    } else if (routeName === 'Profile') {
      selectedTab.value = 'profile'
    } else if (routeName === 'SyncDashboard') {
      selectedTab.value = 'sync'
    } else {
      selectedTab.value = 'menu'
    }
  }
}

// Handle window resize
function handleResize() {
  isMobile.value = window.innerWidth < 1024
  // Close menu if screen size changes while open
  if (menuDialogOpen.value && !isMobile.value) {
    menuDialogOpen.value = false
  }
  if (drawerOpen.value && isMobile.value) {
    drawerOpen.value = false
  }
}

// Watch route changes to update selected tab
watch(
  () => route.name,
  () => {
    updateSelectedTab()
  },
  { immediate: true }
)

// Watch menu dialog state
watch(menuDialogOpen, (isOpen) => {
  if (!isOpen) {
    updateSelectedTab()
  }
})

// Watch drawer state
watch(drawerOpen, (isOpen) => {
  if (!isOpen) {
    updateSelectedTab()
  }
})

// Handle tab change from footer
function handleTabChange(tab: string): void {
  if (tab === 'menu') {
    openMenu()
    return
  }

  // Close any open menus first
  if (menuDialogOpen.value) menuDialogOpen.value = false
  if (drawerOpen.value) drawerOpen.value = false

  let routeName = ''
  switch (tab) {
    case 'home':
      routeName = 'Dashboard'
      break
    case 'notifications':
      routeName = 'Notifications'
      break
    case 'sync':
      routeName = 'SyncDashboard'
      break
    case 'profile':
      routeName = 'Profile'
      break
  }

  if (routeName && route.name !== routeName) {
    router.push({ name: routeName })
  }
}

// Handle menu item click (mobile)
function handleMenuItemClick(routeName: string): void {
  // Close the dialog
  menuDialogOpen.value = false

  // Navigate if not already on that route
  if (route.name !== routeName) {
    router.push({ name: routeName })
  }
}

// Handle drawer item click (desktop)
function handleDrawerItemClick(routeName: string): void {
  // Close the drawer
  drawerOpen.value = false

  // Navigate if not already on that route
  if (route.name !== routeName) {
    router.push({ name: routeName })
  }
}

// Open menu based on screen size
function openMenu(): void {
  // Close the other menu if open
  if (isMobile.value) {
    if (drawerOpen.value) drawerOpen.value = false
    menuDialogOpen.value = true
  } else {
    if (menuDialogOpen.value) menuDialogOpen.value = false
    drawerOpen.value = true
  }
}

// Handle mobile dialog hide
function onMenuDialogHide(): void {
  // Update selected tab after dialog closes
  updateSelectedTab()
}

// Handle drawer change
function onDrawerChange(val: boolean): void {
  if (!val) {
    updateSelectedTab()
  }
}

// Sync functions
async function handleSync(): Promise<void> {
  if (syncStore.isSyncing) return
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
  menuDialogOpen.value = false
}

async function handleSyncFromDrawer(): Promise<void> {
  if (syncStore.isSyncing) return
  await handleSync()
  drawerOpen.value = false
}

// Logout functions
async function handleLogout(): Promise<void> {
  menuDialogOpen.value = false

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

async function handleLogoutFromDrawer(): Promise<void> {
  drawerOpen.value = false

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

// Close menu on escape key
function handleEscapeKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (menuDialogOpen.value) menuDialogOpen.value = false
    if (drawerOpen.value) drawerOpen.value = false
  }
}

onMounted(() => {
  updateSelectedTab()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEscapeKey)
})
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
    padding-bottom: 56px;
  }
}

@media (min-width: 601px) and (max-width: 1023px) {
  :deep(.q-dialog__inner--bottom) {
    padding-bottom: 60px;
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
