<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <AppHeader :title="pageTitle" @toggle-drawer="toggleDrawer" />

    <!-- Navigation Drawer -->
    <AppDrawer v-model="drawerOpen" />

    <!-- Page Content -->
    <q-page-container>
      <!-- Offline Banner -->
      <OfflineBanner v-if="uiStore.isOffline" />

      <!-- Main Content -->
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in" :duration="200">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </q-page-container>

    <!-- Optional Footer -->
    <q-footer v-if="showFooter" class="bg-white text-primary" bordered>
      <q-tabs
        v-model="activeTab"
        active-color="primary"
        indicator-color="primary"
        class="text-grey-7"
        dense
      >
        <q-tab
          name="dashboard"
          icon="dashboard"
          label="Dashboard"
          @click="$router.push('/dashboard')"
        />
        <q-tab
          name="bcm"
          icon="business"
          label="BCM"
          @click="$router.push('/bcm/critical-functions')"
        />
        <q-tab
          name="incidents"
          icon="report"
          label="Incidents"
          @click="$router.push('/incidents')"
        />
        <q-tab
          name="workflows"
          icon="account_tree"
          label="Workflows"
          @click="$router.push('/workflows')"
        />
        <q-tab name="more" icon="more_horiz" label="More" @click="toggleDrawer" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../stores/ui.store'
import AppHeader from '../components/.common/AppHeader.vue'
import AppDrawer from '../components/.common/AppDrawer.vue'
import OfflineBanner from '../components/.common/OfflineBanner.vue'

const route = useRoute()
const uiStore = useUiStore()

// State
const drawerOpen = ref(false)
const transitionName = ref('fade')
const activeTab = ref('dashboard')

// Computed
const pageTitle = computed(() => {
  return (route.meta?.title as string) || 'Izingcweti BCM'
})

const showFooter = computed(() => {
  // Show footer on main pages, hide on detail/form pages
  const hideFooterRoutes = [
    'Login',
    'ForgotPassword',
    'IncidentDetail',
    'BcpDetail',
    'BiaDetail',
    'RiskDetail',
    'WorkflowDetail',
  ]
  return !hideFooterRoutes.includes(route.name as string)
})

// Pages to keep alive in cache
const cachedViews = computed(() => [
  'Dashboard',
  'CriticalFunctions',
  'BIA',
  'BCP',
  'Incidents',
  'Risks',
  'Workflows',
])

// Watch route to update transition direction
watch(
  () => route.fullPath,
  (to, from) => {
    if (!from) {
      transitionName.value = 'fade'
      return
    }
    // Determine transition direction based on route depth
    const toDepth = to.split('/').length
    const fromDepth = from.split('/').length
    transitionName.value = toDepth > fromDepth ? 'slide-left' : 'slide-right'
  }
)

// Watch route to update active tab
watch(
  () => route.path,
  (path) => {
    if (path.includes('/dashboard')) activeTab.value = 'dashboard'
    else if (path.includes('/bcm')) activeTab.value = 'bcm'
    else if (path.includes('/incidents')) activeTab.value = 'incidents'
    else if (path.includes('/workflows')) activeTab.value = 'workflows'
    else activeTab.value = 'more'
  },
  { immediate: true }
)

// Methods
function toggleDrawer(): void {
  drawerOpen.value = !drawerOpen.value
}
</script>

<style lang="scss" scoped>
/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
