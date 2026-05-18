<!-- src/layouts/user/MainLayout.vue -->
<template>
  <q-layout view="hHh Lpr lff">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        
        <q-toolbar-title class="cursor-pointer" @click="goToDashboard">
          <span class="text-weight-bold">{{ appName }}</span>
          <span class="text-subtitle2 q-ml-sm">BCM</span>
        </q-toolbar-title>
        
        <!-- Search -->
        <q-input
          v-model="searchQuery"
          dense
          dark
          flat
          placeholder="Search..."
          class="q-mr-md search-input"
          @keyup.enter="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <!-- Notifications -->
        <q-btn dense flat round icon="notifications" class="q-mr-sm">
          <q-badge v-if="notificationCount" color="red" floating>
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </q-badge>
          <q-menu auto-close>
            <q-list style="min-width: 300px">
              <q-item class="bg-grey-2">
                <q-item-section>
                  <div class="text-subtitle2">Notifications</div>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense label="Mark all read" size="sm" />
                </q-item-section>
              </q-item>
              <q-item v-for="n in notifications" :key="n.id" clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon :name="n.icon" :color="n.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ n.title }}</q-item-label>
                  <q-item-label caption>{{ n.time }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="!notifications.length" class="text-center">
                <q-item-section>No new notifications</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        
        <!-- User Menu -->
        <q-btn dense flat round>
          <q-avatar size="32px">
            <q-icon name="person" />
          </q-avatar>
          <q-menu auto-close>
            <q-list>
              <q-item clickable @click="goToProfile">
                <q-item-section avatar><q-icon name="account_circle" /></q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-item clickable @click="goToSettings">
                <q-item-section avatar><q-icon name="settings" /></q-item-section>
                <q-item-section>Settings</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    
    <!-- Drawer -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :width="250"
      :breakpoint="700"
      bordered
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item
            v-for="item in menuItems"
            :key="item.name"
            clickable
            v-ripple
            :active="isActiveRoute(item.route)"
            :to="item.route"
            exact
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" :color="isActiveRoute(item.route) ? 'primary' : 'grey-7'" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
          
          <q-separator class="q-mt-md q-mb-md" />
          
          <!-- Admin Section -->
          <template v-if="authStore.isAdmin">
            <div class="text-caption text-grey-7 q-px-md q-mb-sm">ADMINISTRATION</div>
            <q-item
              v-for="item in adminItems"
              :key="item.name"
              clickable
              v-ripple
              :active="isActiveRoute(item.route)"
              :to="item.route"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    
    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const drawerOpen = ref(true)
const searchQuery = ref('')
const notificationCount = ref(3)
const appName = import.meta.env.VITE_APP_NAME || 'Izingcweti'

const notifications = ref([
  { id: 1, icon: 'warning', color: 'orange', title: 'Risk assessment due tomorrow', time: '2h ago' },
  { id: 2, icon: 'check_circle', color: 'green', title: 'BCP review completed', time: '5h ago' },
  { id: 3, icon: 'schedule', color: 'blue', title: 'Training reminder: BCM Fundamentals', time: '1d ago' },
])

const menuItems = [
  { name: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: { name: 'Dashboard' } },
  { name: 'risks', label: 'Risk Register', icon: 'warning', route: { name: 'Risks' } },
  { name: 'bcm', label: 'BCM Plans', icon: 'business_center', route: { name: 'BCMPlans' } },
  { name: 'incidents', label: 'Incidents', icon: 'report_problem', route: { name: 'Incidents' } },
  { name: 'reports', label: 'Reports', icon: 'analytics', route: { name: 'Reports' } },
  { name: 'training', label: 'Training', icon: 'school', route: { name: 'Training' } },
]

const adminItems = [
  { name: 'users', label: 'User Management', icon: 'people', route: { name: 'Users' } },
  { name: 'organisations', label: 'Organisations', icon: 'business', route: { name: 'Organisations' } },
  { name: 'audit-logs', label: 'Audit Logs', icon: 'history', route: { name: 'AuditLogs' } },
]

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

function isActiveRoute(routeObj: any): boolean {
  return route.name === routeObj.name
}

function goToDashboard() {
  router.push({ name: 'Dashboard' })
}

function goToProfile() {
  router.push({ name: 'Profile' })
}

function goToSettings() {
  router.push({ name: 'Settings' })
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value } })
  }
}

async function handleLogout() {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await authStore.logout()
    router.push({ name: 'Login' })
    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top',
    })
  })
}

onMounted(() => {
  // Load notifications count
  // fetchNotifications()
})
</script>

<style scoped lang="scss">
.search-input {
  width: 250px;
  
  @media (max-width: 768px) {
    width: 150px;
  }
}
</style>