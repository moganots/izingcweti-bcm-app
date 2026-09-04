<template>
  <q-drawer
    v-model="drawerOpen"
    side="right"
    :width="280"
    :breakpoint="768"
    bordered
    :class="{ 'bg-dark text-white': isDarkMode }"
  >
    <!-- Drawer Header -->
    <div class="drawer-header q-pa-md">
      <div class="row items-center">
        <q-avatar size="48px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-h6 text-white">Izingcweti BCM</div>
          <div class="text-caption text-grey-4">
            {{ userRoleDisplay || 'User' }}
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="q-mt-sm">
        <div class="text-subtitle2 text-white">{{ fullName }}</div>
        <div class="text-caption text-grey-4">{{ userEmail }}</div>
      </div>

      <!-- Sync Status -->
      <div v-if="hasPendingChanges" class="sync-status q-mt-sm">
        <q-badge color="orange" class="full-width text-center q-py-xs">
          <q-icon name="sync" size="14px" class="q-mr-xs" />
          {{ pendingCount }} pending changes
        </q-badge>
      </div>
    </div>

    <q-separator />

    <!-- Navigation Menu -->
    <q-scroll-area class="fit">
      <q-list padding>
        <!-- Menu Groups -->
        <template v-for="group in menuGroups" :key="group.label">
          <q-item-label
            v-if="group.items.length > 0"
            header
            :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'"
          >
            {{ group.label }}
          </q-item-label>

          <q-item
            v-for="item in group.items"
            :key="item.name"
            clickable
            v-ripple
            :to="item.to ? { name: item.name } : undefined"
            :active="route.name === item.name"
            exact
            active-class="text-primary"
            :disable="item.disabled"
            @click="handleItemClick(item)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <q-item-section v-if="item.badge" side>
              <q-badge :color="item.badgeColor || 'red'" :label="item.badge" />
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-scroll-area>

    <!-- Footer Actions -->
    <q-separator />
    <div class="q-pa-sm">
      <q-list>
        <q-item clickable v-ripple @click="handleSync">
          <q-item-section avatar>
            <q-icon
              name="sync"
              :color="isSyncing ? 'orange' : 'primary'"
              :class="{ 'rotate-animation': isSyncing }"
            />
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

        <q-item clickable v-ripple @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Logout</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { useSync } from 'src/composables/useSync'
import { useUiStore } from 'src/stores'

// ============================================
// Types
// ============================================

interface MenuItem {
  name: string
  label: string
  icon: string
  to?: { name: string }
  badge?: string | number
  badgeColor?: string
  disabled?: boolean
  phase?: 'initiation' | 'risk' | 'strategy' | 'implementation' | 'testing' | 'incident' | 'maintenance'
  permission?: string
  action?: () => void
}

interface MenuGroup {
  label: string
  icon?: string
  phase?: string
  items: MenuItem[]
}

// ============================================
// Composables
// ============================================
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const { userRole, fullName, userEmail, hasPermission, logout, isAdmin } = useAuth()
const {
  pendingCount,
  hasPendingChanges,
  isSyncing,
  lastSyncAt,
  fullSync,
  isOnline,
} = useSync()
const uiStore = useUiStore()

// ============================================
// Props & Emits
// ============================================
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

// ============================================
// Computed
// ============================================
const drawerOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isDarkMode = computed(() => uiStore.isDarkMode)
const userRoleDisplay = computed(() => {
  if (!userRole.value) return 'User'
  return String(userRole.value).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
})

// ============================================
// Menu Definitions by BCM Phase
// ============================================

/**
 * Phase 1: Initiation & Governance
 */
const initiationItems: MenuItem[] = [
  {
    name: 'Dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    phase: 'initiation',
  },
  {
    name: 'Governance',
    label: 'Governance',
    icon: 'gavel',
    phase: 'initiation',
    permission: 'VIEW_GOVERNANCE',
  },
  {
    name: 'CriticalFunctions',
    label: 'Critical Functions',
    icon: 'business_center',
    phase: 'initiation',
    permission: 'VIEW_CRITICAL_FUNCTIONS',
  },
  {
    name: 'BIA',
    label: 'Business Impact Analysis',
    icon: 'assessment',
    phase: 'initiation',
    permission: 'VIEW_BIA',
  },
]

/**
 * Phase 2: Risk Assessment
 */
const riskItems: MenuItem[] = [
  {
    name: 'Risks',
    label: 'Risk Register',
    icon: 'crisis_alert',
    phase: 'risk',
    permission: 'VIEW_RISKS',
  },
]

/**
 * Phase 3: Strategy Development
 */
const strategyItems: MenuItem[] = [
  {
    name: 'BCP',
    label: 'Continuity Plans',
    icon: 'assignment',
    phase: 'strategy',
    permission: 'VIEW_BCP',
  },
  {
    name: 'RecoveryStrategies',
    label: 'Recovery Strategies',
    icon: 'restore',
    phase: 'strategy',
    permission: 'VIEW_RECOVERY_STRATEGIES',
  },
]

/**
 * Phase 4: Implementation
 */
const implementationItems: MenuItem[] = [
  {
    name: 'Documents',
    label: 'Documents',
    icon: 'folder',
    phase: 'implementation',
    permission: 'VIEW_DOCUMENTS',
  },
  {
    name: 'Compliance',
    label: 'Compliance',
    icon: 'verified_user',
    phase: 'implementation',
    permission: 'VIEW_COMPLIANCE',
  },
  {
    name: 'Training',
    label: 'Training',
    icon: 'school',
    phase: 'implementation',
    permission: 'VIEW_TRAINING',
  },
]

/**
 * Phase 5: Testing & Exercises
 */
const testingItems: MenuItem[] = [
  {
    name: 'ExerciseTests',
    label: 'Exercise Tests',
    icon: 'playlist_add_check',
    phase: 'testing',
    permission: 'VIEW_EXERCISE_TESTS',
  },
]

/**
 * Phase 6: Incident Response
 */
const incidentItems: MenuItem[] = [
  {
    name: 'Incidents',
    label: 'Incidents',
    icon: 'warning',
    phase: 'incident',
    permission: 'VIEW_INCIDENTS',
    badge: 0, // Will be updated dynamically
    badgeColor: 'red',
  },
  {
    name: 'Workflows',
    label: 'Workflows',
    icon: 'account_tree',
    phase: 'incident',
    permission: 'VIEW_WORKFLOWS',
  },
]

/**
 * Phase 7: Maintenance & Improvement
 */
const maintenanceItems: MenuItem[] = [
  {
    name: 'Lessons',
    label: 'Lessons Learned',
    icon: 'lightbulb',
    phase: 'maintenance',
    permission: 'VIEW_LESSONS',
  },
  {
    name: 'Reports',
    label: 'Reports',
    icon: 'picture_as_pdf',
    phase: 'maintenance',
    permission: 'VIEW_REPORTS',
  },
  {
    name: 'Settings',
    label: 'Settings',
    icon: 'settings',
    phase: 'maintenance',
  },
]

/**
 * Administration Items
 */
const adminItems: MenuItem[] = [
  {
    name: 'Users',
    label: 'User Management',
    icon: 'people',
    permission: 'MANAGE_USERS',
  },
  {
    name: 'Organisations',
    label: 'Organisations',
    icon: 'business',
    permission: 'MANAGE_ORGANISATIONS',
  },
  {
    name: 'AuditLogs',
    label: 'Audit Logs',
    icon: 'history',
    permission: 'VIEW_AUDIT_LOGS',
  },
  {
    name: 'FeatureToggles',
    label: 'Feature Toggles',
    icon: 'toggle_on',
    permission: 'MANAGE_SYSTEM',
  },
  {
    name: 'SyncDashboard',
    label: 'Sync Dashboard',
    icon: 'sync',
    permission: 'MANAGE_SYNC',
  },
]

// ============================================
// Menu Groups by BCM Phase
// ============================================

const menuGroups = computed<MenuGroup[]>(() => {
  const groups: MenuGroup[] = [
    {
      label: 'Initiation & Governance',
      icon: 'rocket_launch',
      phase: 'initiation',
      items: initiationItems,
    },
    {
      label: 'Risk Assessment',
      icon: 'analytics',
      phase: 'risk',
      items: riskItems,
    },
    {
      label: 'Strategy Development',
      icon: 'strategy',
      phase: 'strategy',
      items: strategyItems,
    },
    {
      label: 'Implementation',
      icon: 'build_circle',
      phase: 'implementation',
      items: implementationItems,
    },
    {
      label: 'Testing & Exercises',
      icon: 'verified',
      phase: 'testing',
      items: testingItems,
    },
    {
      label: 'Incident Response',
      icon: 'emergency',
      phase: 'incident',
      items: incidentItems,
    },
    {
      label: 'Maintenance & Improvement',
      icon: 'update',
      phase: 'maintenance',
      items: maintenanceItems,
    },
  ]

  // Add Admin section if user is admin
  if (isAdmin.value) {
    groups.push({
      label: 'Administration',
      icon: 'admin_panel_settings',
      items: adminItems,
    })
  }

  // Filter items by permissions and filter out empty groups
  return groups
    .map((group) => ({
      ...group,
      items: filterMenuItems(group.items),
    }))
    .filter((group) => group.items.length > 0)
})

// ============================================
// Methods
// ============================================

/**
 * Filter menu items by permissions and conditions
 */
function filterMenuItems(items: MenuItem[]): MenuItem[] {
  return items.filter((item) => {
    // Check permission
    if (item.permission) {
      const hasPerm = hasPermission(item.permission)
      if (!hasPerm) return false
    }

    // Check if item is disabled
    if (item.disabled) return false

    return true
  })
}

/**
 * Handle menu item click - handles both navigation and custom actions
 */
function handleItemClick(item: MenuItem): void {
  // Close drawer on mobile
  if (drawerOpen.value) {
    drawerOpen.value = false
  }

  // Execute custom action if provided
  if (item.action) {
    item.action()
    return
  }

  // Navigate if route exists
  if (item.to) {
    router.push(item.to)
  }
}

/**
 * Handle sync action
 */
async function handleSync(): Promise<void> {
  if (isSyncing.value) return
  if (!isOnline.value) {
    $q.notify({
      type: 'warning',
      message: 'You are offline. Please connect to sync.',
      position: 'top',
    })
    return
  }

  try {
    await fullSync()
    $q.notify({
      type: 'positive',
      message: 'Sync completed successfully',
      position: 'top',
    })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Sync failed',
      position: 'top',
    })
  }
}

/**
 * Handle logout
 */
async function handleLogout(): Promise<void> {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await logout()
    await router.push('/auth/login')
  })
}

/**
 * Format time ago
 */
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
.drawer-header {
  background: linear-gradient(
    135deg,
    var(--q-primary) 0%,
    color-mix(in srgb, var(--q-primary) 70%, black) 100%
  );
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

// Mobile optimizations
@media (max-width: 768px) {
  :deep(.q-item) {
    min-height: 44px;
    padding: 6px 12px;

    .q-item__section--avatar {
      min-width: 32px;
    }

    .q-icon {
      font-size: 18px !important;
    }

    .q-item__label {
      font-size: 0.875rem;
    }
  }

  .q-item-label--header {
    font-size: 0.75rem;
    padding: 8px 12px;
  }
}
</style>