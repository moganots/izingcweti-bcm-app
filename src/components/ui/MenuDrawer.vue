<template>
  <q-drawer v-model="drawerOpen" side="right" :width="280" :breakpoint="768" bordered
    :class="{ 'bg-dark text-white': isDarkMode }">
    <!-- Drawer Header -->
    <div class="drawer-header q-pa-md">
      <div class="row items-center">
        <q-avatar size="48px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-h6 text-white">Izingcweti BCM</div>
          <div class="text-caption text-grey-4">
            {{ userRole || 'User' }}
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="q-mt-sm">
        <div class="text-subtitle2 text-white">{{ userFullName }}</div>
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
        <!-- Main Navigation Items by BCM Phase -->
        <template v-for="phase in menuPhases" :key="phase.id">
          <q-item-label v-if="phase.items && phase.items.length > 0" header
            :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            <div class="row items-center q-gutter-xs">
              <q-icon :name="phase.icon" size="16px" />
              <span>{{ phase.label }}</span>
            </div>
          </q-item-label>

          <q-item v-for="(item, itemIndex) in phase.items" :key="item.routeName ?? `${phase.id}-${itemIndex}`" clickable v-ripple
            :to="item.routeName ? { name: item.routeName } : undefined" :active="route.name === item.routeName" exact
            active-class="text-primary" @click="item.action ? item.action() : null">
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

          <q-item v-for="(item, itemIndex) in adminItems" :key="item.routeName ?? `admin-${itemIndex}`" clickable v-ripple
            :to="item.routeName ? { name: item.routeName } : undefined"
            :active="route.name === item.routeName" exact active-class="text-primary">
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

        <q-item clickable v-ripple :to="{ name: 'Documents' }" :active="route.name === 'Documents'" exact
          active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>Documents</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'Settings' }" :active="route.name === 'Settings'" exact
          active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>

        <q-separator spaced />

        <!-- Footer Actions -->
        <q-item clickable v-ripple @click="handleSync">
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../../composables/useAuth'
import { useSync } from '../../composables/useSync'
import { useUi } from '../../composables/useUi'
import type { MenuItem, MenuPhase } from '../../types/menu.types'

// ============================================
// Composables
// ============================================
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const auth = useAuth()
const sync = useSync()
const ui = useUi()

// ============================================
// Props
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

const userRole = computed(() => auth.userRole.value)
const userFullName = computed(() => auth.fullName.value)
const userEmail = computed(() => auth.userEmail.value)
const isDarkMode = computed(() => ui.isDarkMode.value)
const isAdmin = computed(() => auth.isAdmin.value)
const isSyncing = computed(() => sync.isSyncing.value)
const hasPendingChanges = computed(() => sync.hasPendingChanges.value)
const pendingCount = computed(() => sync.pendingCount.value)
const lastSyncAt = computed(() => sync.lastSyncAt.value)

// ============================================
// Permission Checks
// ============================================
const canViewBCM = computed(() => auth.canManageBCM() || auth.isAdmin.value)
const canViewRisks = computed(() => auth.canManageRisks() || auth.isAdmin.value)
const canViewIncidents = computed(() => auth.canManageIncidents() || auth.isAdmin.value)
const canViewCompliance = computed(() => auth.isAdmin.value)
const canViewWorkflows = computed(() => auth.isAdmin.value)
const canViewBCP = computed(() => auth.canManageBCM() || auth.isAdmin.value)
const canViewBIA = computed(() => auth.canManageBCM() || auth.isAdmin.value)
const canViewRecovery = computed(() => auth.canManageBCM() || auth.isAdmin.value)
const canViewExercises = computed(() => auth.canManageBCM() || auth.isAdmin.value)
const canViewUsers = computed(() => auth.canManageUsers() || auth.isAdmin.value)
const canViewAuditLogs = computed(() => auth.canViewAuditLogs() || auth.isAdmin.value)
const canViewOrganisations = computed(() => auth.isAdmin.value)

// ============================================
// Menu Configuration by BCM Phases
// ============================================

/**
 * BCM Lifecycle Phases with menu items
 * Based on the standard BCM lifecycle: 
 * 1. Initiation & Governance
 * 2. Risk Assessment
 * 3. Business Impact Analysis (BIA)
 * 4. Strategy Development
 * 5. Plan Development
 * 6. Testing & Exercises
 * 7. Incident Response
 * 8. Continuous Improvement
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
      badge: 0, // Will be updated from store
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
// Methods
// ============================================
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

async function handleLogout(): Promise<void> {
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
  background: linear-gradient(135deg,
      var(--q-primary) 0%,
      color-mix(in srgb, var(--q-primary) 70%, black) 100%);
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
</style>