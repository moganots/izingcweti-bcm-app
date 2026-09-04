<template>
  <q-footer elevated class="bg-primary text-white">
    <div class="footer-tabs-wrapper">
      <q-tabs v-model="selectedTab" inline-label class="footer-tabs text-white" active-color="yellow"
        indicator-color="yellow" align="center" @update:model-value="handleTabChange">
        <!-- Home Tab -->
        <q-tab name="home" icon="home" label="Home" />

        <!-- Dashboard Tab (BCM Overview)
        <q-tab name="dashboard" icon="dashboard" label="Overview">
          <q-badge v-if="hasPendingChanges" color="orange" floating>
            {{ pendingCount > 99 ? '99+' : pendingCount }}
          </q-badge>
        </q-tab>
         -->

        <!-- Sync Tab -->
        <q-tab name="sync" icon="sync" label="Sync">
          <q-badge v-if="isSyncing || hasPendingChanges" color="orange" floating>
            {{ isSyncing ? '⟳' : (pendingCount > 99 ? '99+' : pendingCount) }}
          </q-badge>
        </q-tab>

        <!-- Profile Tab -->
        <q-tab name="profile" icon="person" label="Profile" />

        <!-- Menu Tab -->
        <q-tab name="menu" icon="menu" label="Menu" />
      </q-tabs>
    </div>
  </q-footer>

  <!-- Popup Menu Dialog for Mobile -->
  <q-dialog v-model="menuDialogOpen" position="bottom" transition-show="slide-up" transition-hide="slide-down"
    :maximized="false" full-width @hide="onMenuDialogHide">
    <q-card class="menu-dialog-card" :class="{ 'bg-dark text-white': isDarkMode }">
      <q-card-section class="q-pa-sm">
        <div class="row items-center justify-between q-pa-md">
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-sm">
              <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
            </q-avatar>
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ appFullName }}</div>
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
            <div class="user-info-section q-pa-md" :class="isDarkMode ? 'bg-grey-9' : 'bg-grey-2'">
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

            <!-- BCM Phase Menu Groups -->
            <template v-for="phase in menuPhases" :key="phase.id">
              <q-item-label v-if="phase.items && phase.items.length > 0" header
                :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
                <div class="row items-center q-gutter-xs">
                  <q-icon :name="phase.icon" size="14px" />
                  <span>{{ phase.label }}</span>
                </div>
              </q-item-label>

              <q-item v-for="item in phase.items" :key="item.routeName || item.label" clickable v-ripple
                :active="route.name === item.routeName" active-class="text-primary" @click="handleMenuItemClick(item)">
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
            <template v-if="isAdmin">
              <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
                Administration
              </q-item-label>

              <q-item v-for="item in adminItems" :key="item.routeName || item.label" clickable v-ripple
                :active="route.name === item.routeName" active-class="text-primary" @click="handleMenuItemClick(item)">
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

            <q-item clickable v-ripple :active="route.name === 'Documents'" active-class="text-primary"
              @click="handleMenuItemClick({ routeName: 'Documents', label: 'Documents', icon: 'folder' })">
              <q-item-section avatar>
                <q-icon name="folder" />
              </q-item-section>
              <q-item-section>Documents</q-item-section>
            </q-item>

            <q-item clickable v-ripple :active="route.name === 'Settings'" active-class="text-primary"
              @click="handleMenuItemClick({ routeName: 'Settings', label: 'Settings', icon: 'settings' })">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Sync Action -->
            <q-item clickable v-ripple @click="handleSyncFromMenu">
              <q-item-section avatar>
                <q-icon name="sync" :color="isSyncing ? 'orange' : 'primary'"
                  :class="{ 'rotate-animation': isSyncing }" />
              </q-item-section>
              <q-item-section>
                {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
              </q-item-section>
              <q-item-section side v-if="lastSyncAt">
                <span class="text-caption text-grey-6">
                  {{ formatTimeAgo(lastSyncAt) }}
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
  <q-drawer v-model="drawerOpen" side="right" :width="320" :breakpoint="1024" bordered
    :class="{ 'bg-dark text-white': isDarkMode }" @update:model-value="onDrawerChange">
    <div class="drawer-header q-pa-md">
      <div class="row items-center">
        <q-avatar size="48px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-h6">{{ appShortName }}</div>
          <div class="text-caption text-grey-4">
            {{ userRole || 'User' }}
          </div>
        </div>
      </div>

      <div class="q-mt-sm">
        <div class="text-subtitle2">{{ userFullName || 'User' }}</div>
        <div class="text-caption text-grey-4">{{ userEmail }}</div>
      </div>

      <div v-if="hasPendingChanges" class="sync-status q-mt-sm">
        <q-badge color="orange" class="full-width text-center q-py-xs">
          <q-icon name="sync" size="14px" class="q-mr-xs" />
          {{ pendingCount }} pending changes
        </q-badge>
      </div>
    </div>

    <q-separator />

    <q-scroll-area class="fit">
      <q-list padding>
        <!-- BCM Phase Menu Groups -->
        <template v-for="phase in menuPhases" :key="phase.id">
          <q-item-label v-if="phase.items && phase.items.length > 0" header
            :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            <div class="row items-center q-gutter-xs">
              <q-icon :name="phase.icon" size="14px" />
              <span>{{ phase.label }}</span>
            </div>
          </q-item-label>

          <q-item v-for="item in phase.items" :key="item.routeName || item.label" clickable v-ripple
            :active="route.name === item.routeName" active-class="text-primary" @click="handleDrawerItemClick(item)">
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <q-separator spaced />

        <!-- Admin Section -->
        <template v-if="isAdmin">
          <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            Administration
          </q-item-label>

          <q-item v-for="item in adminItems" :key="item.routeName || item.label" clickable v-ripple
            :active="route.name === item.routeName" active-class="text-primary" @click="handleDrawerItemClick(item)">
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

        <q-item clickable v-ripple :active="route.name === 'Documents'" active-class="text-primary"
          @click="handleDrawerItemClick({ routeName: 'Documents', label: 'Documents', icon: 'folder' })">
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>Documents</q-item-section>
        </q-item>

        <q-item clickable v-ripple :active="route.name === 'Settings'" active-class="text-primary"
          @click="handleDrawerItemClick({ routeName: 'Settings', label: 'Settings', icon: 'settings' })">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable v-ripple @click="handleSyncFromDrawer">
          <q-item-section avatar>
            <q-icon name="sync" :color="isSyncing ? 'orange' : 'primary'" :class="{ 'rotate-animation': isSyncing }" />
          </q-item-section>
          <q-item-section>
            {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
          </q-item-section>
          <q-item-section side v-if="lastSyncAt">
            <span class="text-caption text-grey-6">
              {{ formatTimeAgo(lastSyncAt) }}
            </span>
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
import { useAuth } from '../../composables/useAuth'
import { useSync } from '../../composables/useSync'
import { useUi } from '../../composables/useUi'
import AppConfig from 'src/utils/config'
import type { MenuItem, MenuPhase } from '../../types/menu.types'

// ============================================
// Composables
// ============================================
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const auth = useAuth()
const sync = useSync()
const ui = useUi()

// ============================================
// App Config
// ============================================
const appFullName = AppConfig.app.fullName || 'Izingcweti - BCM App'
const appShortName = AppConfig.app.shortName || 'BCM App'

// ============================================
// State
// ============================================
const selectedTab = ref('home')
const menuDialogOpen = ref(false)
const drawerOpen = ref(false)

// Screen size detection
const isMobile = ref(window.innerWidth < 1024)

// ============================================
// Computed
// ============================================
const pendingCount = computed(() => sync.pendingCount.value || 0)
const isDarkMode = computed(() => ui.isDarkMode.value)
const userFullName = computed(() => auth.fullName.value)
const userEmail = computed(() => auth.userEmail.value)
const userRole = computed(() => auth.userRole.value)
const isAdmin = computed(() => auth.isAdmin.value)
const isSyncing = computed(() => sync.isSyncing.value)
const hasPendingChanges = computed(() => sync.hasPendingChanges.value)
const lastSyncAt = computed(() => sync.lastSyncAt.value)

// ============================================
// Permission Checks
// ============================================
const canViewBCM = computed(() => auth.canManageBCM() || isAdmin.value)
const canViewRisks = computed(() => auth.canManageRisks() || isAdmin.value)
const canViewIncidents = computed(() => auth.canManageIncidents() || isAdmin.value)
const canViewCompliance = computed(() => isAdmin.value)
const canViewWorkflows = computed(() => isAdmin.value)
const canViewBCP = computed(() => auth.canManageBCM() || isAdmin.value)
const canViewBIA = computed(() => auth.canManageBCM() || isAdmin.value)
const canViewRecovery = computed(() => auth.canManageBCM() || isAdmin.value)
const canViewExercises = computed(() => auth.canManageBCM() || isAdmin.value)
const canViewUsers = computed(() => auth.canManageUsers() || isAdmin.value)
const canViewAuditLogs = computed(() => auth.canViewAuditLogs() || isAdmin.value)
const canViewOrganisations = computed(() => isAdmin.value)

// ============================================
// Menu Configuration by BCM Phases
// ============================================

/**
 * BCM Lifecycle Phases with menu items
 * Based on the standard BCM lifecycle phases
 */
const menuPhases = computed<MenuPhase[]>(() => {
  const phases: MenuPhase[] = []

  // Phase 1: Initiation & Governance
  const governanceItems: MenuItem[] = []
  if (canViewBCM.value) {
    governanceItems.push({
      label: 'Critical Functions',
      icon: 'functions',
      routeName: 'CriticalFunctions',
      phase: 'initiation',
    })
  }
  if (governanceItems.length > 0) {
    phases.push({
      id: 'initiation',
      label: 'Initiation & Governance',
      icon: 'account_balance',
      items: governanceItems,
    })
  }

  // Phase 2: Risk Assessment
  const riskItems: MenuItem[] = []
  if (canViewRisks.value) {
    riskItems.push({
      label: 'Risk Register',
      icon: 'warning',
      routeName: 'Risks',
      phase: 'risk_assessment',
    })
  }
  if (riskItems.length > 0) {
    phases.push({
      id: 'risk_assessment',
      label: 'Risk Assessment',
      icon: 'crisis_alert',
      items: riskItems,
    })
  }

  // Phase 3: Business Impact Analysis (BIA)
  const biaItems: MenuItem[] = []
  if (canViewBIA.value) {
    biaItems.push({
      label: 'Business Impact Analysis',
      icon: 'assessment',
      routeName: 'BIA',
      phase: 'bia',
    })
  }
  if (biaItems.length > 0) {
    phases.push({
      id: 'bia',
      label: 'Business Impact Analysis',
      icon: 'analytics',
      items: biaItems,
    })
  }

  // Phase 4: Strategy Development
  const strategyItems: MenuItem[] = []
  if (canViewRecovery.value) {
    strategyItems.push({
      label: 'Recovery Strategies',
      icon: 'restore',
      routeName: 'RecoveryStrategies',
      phase: 'strategy',
    })
  }
  if (strategyItems.length > 0) {
    phases.push({
      id: 'strategy',
      label: 'Strategy Development',
      icon: 'lightbulb',
      items: strategyItems,
    })
  }

  // Phase 5: Plan Development
  const planItems: MenuItem[] = []
  if (canViewBCP.value) {
    planItems.push({
      label: 'Continuity Plans (BCP)',
      icon: 'description',
      routeName: 'BCP',
      phase: 'planning',
    })
  }
  if (canViewCompliance.value) {
    planItems.push({
      label: 'Compliance',
      icon: 'verified_user',
      routeName: 'Compliance',
      phase: 'planning',
    })
  }
  if (planItems.length > 0) {
    phases.push({
      id: 'planning',
      label: 'Plan Development',
      icon: 'assignment',
      items: planItems,
    })
  }

  // Phase 6: Testing & Exercises
  const testItems: MenuItem[] = []
  if (canViewExercises.value) {
    testItems.push({
      label: 'Exercise Tests',
      icon: 'playlist_add_check',
      routeName: 'ExerciseTests',
      phase: 'testing',
    })
  }
  if (testItems.length > 0) {
    phases.push({
      id: 'testing',
      label: 'Testing & Exercises',
      icon: 'verified',
      items: testItems,
    })
  }

  // Phase 7: Incident Response
  const incidentItems: MenuItem[] = []
  if (canViewIncidents.value) {
    incidentItems.push({
      label: 'Incidents',
      icon: 'report',
      routeName: 'Incidents',
      phase: 'incident',
      badge: 0,
      badgeColor: 'red',
    })
  }
  if (incidentItems.length > 0) {
    phases.push({
      id: 'incident',
      label: 'Incident Response',
      icon: 'emergency',
      items: incidentItems,
    })
  }

  // Phase 8: Continuous Improvement
  const improvementItems: MenuItem[] = []
  if (canViewWorkflows.value) {
    improvementItems.push({
      label: 'Workflows',
      icon: 'account_tree',
      routeName: 'Workflows',
      phase: 'improvement',
    })
  }
  if (canViewAuditLogs.value) {
    improvementItems.push({
      label: 'Audit Logs',
      icon: 'history',
      routeName: 'AuditLogs',
      phase: 'improvement',
    })
  }
  if (improvementItems.length > 0) {
    phases.push({
      id: 'improvement',
      label: 'Continuous Improvement',
      icon: 'trending_up',
      items: improvementItems,
    })
  }

  return phases
})

// ============================================
// Admin Items
// ============================================
const adminItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = []

  if (canViewUsers.value) {
    items.push({
      label: 'User Management',
      icon: 'people',
      routeName: 'Users',
      phase: 'admin',
    })
  }

  if (canViewOrganisations.value) {
    items.push({
      label: 'Organisations',
      icon: 'business',
      routeName: 'Organisations',
      phase: 'admin',
    })
  }

  if (canViewAuditLogs.value) {
    items.push({
      label: 'Audit Logs',
      icon: 'fact_check',
      routeName: 'AuditLogs',
      phase: 'admin',
    })
  }

  return items
})

// ============================================
// Methods - Tab Management
// ============================================

/**
 * Update selected tab based on current route
 */
function updateSelectedTab(): void {
  const routeName = route.name as string

  if (!menuDialogOpen.value && !drawerOpen.value) {
    if (routeName === 'Dashboard') {
      selectedTab.value = 'home'
    } else if (routeName === 'SyncDashboard') {
      selectedTab.value = 'sync'
    } else if (routeName === 'Profile') {
      selectedTab.value = 'profile'
    } else if (routeName?.includes('Dashboard')) {
      selectedTab.value = 'dashboard'
    } else {
      selectedTab.value = ''
    }
  }
}

/**
 * Handle tab change from footer
 */
function handleTabChange(tab: string): void {
  if (tab === 'menu') {
    openMenu()
    return
  }

  if (menuDialogOpen.value) menuDialogOpen.value = false
  if (drawerOpen.value) drawerOpen.value = false

  let routeName = ''
  switch (tab) {
    case 'home':
      routeName = 'Dashboard'
      break
    case 'dashboard':
      routeName = 'Dashboard'
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

// ============================================
// Methods - Menu Actions
// ============================================

/**
 * Handle menu item click (mobile dialog)
 */
function handleMenuItemClick(item: MenuItem): void {
  menuDialogOpen.value = false
  if (item.routeName && route.name !== item.routeName) {
    router.push({ name: item.routeName })
  } else if (item.action) {
    item.action()
  }
}

/**
 * Handle drawer item click (desktop)
 */
function handleDrawerItemClick(item: MenuItem): void {
  drawerOpen.value = false
  if (item.routeName && route.name !== item.routeName) {
    router.push({ name: item.routeName })
  } else if (item.action) {
    item.action()
  }
}

/**
 * Open menu based on screen size
 */
function openMenu(): void {
  if (isMobile.value) {
    if (drawerOpen.value) drawerOpen.value = false
    menuDialogOpen.value = true
  } else {
    if (menuDialogOpen.value) menuDialogOpen.value = false
    drawerOpen.value = true
  }
}

// ============================================
// Methods - Sync Actions
// ============================================

/**
 * Handle sync from menu
 */
async function handleSyncFromMenu(): Promise<void> {
  if (isSyncing.value) return
  await handleSync()
  menuDialogOpen.value = false
}

/**
 * Handle sync from drawer
 */
async function handleSyncFromDrawer(): Promise<void> {
  if (isSyncing.value) return
  await handleSync()
  drawerOpen.value = false
}

/**
 * Main sync handler
 */
async function handleSync(): Promise<void> {
  if (isSyncing.value) return
  try {
    await sync.fullSync()
    $q.notify({
      type: 'positive',
      message: 'Sync completed',
      position: 'top',
      timeout: 2000,
    })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Sync failed',
      position: 'top',
    })
  }
}

// ============================================
// Methods - Logout Actions
// ============================================

async function handleLogout(): Promise<void> {
  menuDialogOpen.value = false

  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await auth.logout()
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
    await auth.logout()
    await router.push('/auth/login')
  })
}

// ============================================
// Methods - Utility
// ============================================

function formatTimeAgo(date: string | null): string {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ============================================
// Methods - Dialog/Drawer Events
// ============================================

function onMenuDialogHide(): void {
  updateSelectedTab()
}

function onDrawerChange(val: boolean): void {
  if (!val) {
    updateSelectedTab()
  }
}

// ============================================
// Methods - Resize & Keyboard
// ============================================

function handleResize(): void {
  isMobile.value = window.innerWidth < 1024
  if (menuDialogOpen.value && !isMobile.value) {
    menuDialogOpen.value = false
  }
  if (drawerOpen.value && isMobile.value) {
    drawerOpen.value = false
  }
}

function handleEscapeKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (menuDialogOpen.value) menuDialogOpen.value = false
    if (drawerOpen.value) drawerOpen.value = false
  }
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  updateSelectedTab()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEscapeKey)
})

// Watch route changes
watch(
  () => route.name,
  () => {
    updateSelectedTab()
  },
  { immediate: true }
)

watch(menuDialogOpen, (isOpen) => {
  if (!isOpen) {
    updateSelectedTab()
  }
})

watch(drawerOpen, (isOpen) => {
  if (!isOpen) {
    updateSelectedTab()
  }
})
</script>

<style lang="scss" scoped>
// ============================================
// Footer Tabs - Centered
// ============================================

.footer-tabs-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.footer-tabs {
  width: 100%;
  max-width: 500px;

  :deep(.q-tabs__content) {
    justify-content: space-around;
  }

  :deep(.q-tab) {
    flex: 1;
    min-width: 0;
    padding: 8px 4px;
    font-size: 0.75rem;
    min-height: 48px;
  }

  :deep(.q-tab__icon) {
    font-size: 24px;
  }

  :deep(.q-tab__label) {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.3px;
    margin-top: 2px;
  }

  :deep(.q-badge) {
    font-size: 10px;
    min-width: 18px;
    height: 18px;
    line-height: 18px;
    padding: 0 5px;
    top: 2px;
    right: 2px;
  }
}

// ============================================
// Menu Dialog
// ============================================

.menu-dialog-card {
  border-radius: 20px 20px 0 0;
  max-width: 500px;
  margin: 0 auto;
  margin-bottom: 0;
}

:deep(.q-dialog__inner--bottom) {
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 56px;
}

@media (max-width: 600px) {
  :deep(.q-dialog__inner--bottom) {
    padding-bottom: 56px;
  }

  .footer-tabs {
    :deep(.q-tab) {
      padding: 6px 2px;
      min-height: 44px;
      font-size: 0.7rem;
    }

    :deep(.q-tab__icon) {
      font-size: 20px;
    }

    :deep(.q-tab__label) {
      font-size: 0.55rem;
    }
  }
}

@media (min-width: 601px) and (max-width: 1023px) {
  :deep(.q-dialog__inner--bottom) {
    padding-bottom: 60px;
  }

  .footer-tabs {
    :deep(.q-tab) {
      padding: 8px 6px;
      min-height: 48px;
    }

    :deep(.q-tab__icon) {
      font-size: 22px;
    }
  }
}

// ============================================
// User Info Section
// ============================================

.user-info-section {
  border-radius: 12px;
  margin: 8px;
}

// ============================================
// Drawer Header
// ============================================

.drawer-header {
  background: linear-gradient(135deg, var(--q-white, #ffffff) 0%, var(--q-grey-2, #f5f5f5) 100%);
  border-bottom: 1px solid var(--q-separator-color, rgba(0, 0, 0, 0.12));

  body.body--dark & {
    background: linear-gradient(135deg,
        var(--q-grey-10, #1e1e1e) 0%,
        var(--q-grey-9, #242424) 100%);
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
}

// ============================================
// Animations
// ============================================

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
</style>