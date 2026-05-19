<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
        <slot name="header-actions" />
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <AppDrawer v-model="drawerOpen" />

    <!-- Tab Navigation -->
    <q-tabs
      v-model="activeTab"
      active-color="primary"
      indicator-color="primary"
      class="text-grey-7 bg-white shadow-1"
      align="left"
      dense
    >
      <q-tab
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :label="tab.label"
        :badge="tab.badge"
        :badge-color="tab.badgeColor"
        @click="handleTabClick(tab)"
      />
    </q-tabs>

    <!-- Content -->
    <q-page-container>
      <OfflineBanner v-if="uiStore.isOffline" />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" :duration="150">
          <keep-alive :include="cachedTabs || []">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui/ui.store'
import AppDrawer from '../components/.common/AppDrawer.vue'
import OfflineBanner from '../components/.common/OfflineBanner.vue'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const drawerOpen = ref(false)
const activeTab = ref('')

interface Tab {
  name: string
  label: string
  icon: string
  route?: string
  badge?: string | number
  badgeColor?: string
}

const props = defineProps<{
  tabs?: Tab[]
  cachedTabs?: string[]
}>()

const pageTitle = computed(() => (route.meta?.title as string) || 'Izingcweti BCM App')

const tabs = computed(() => props.tabs || [])

function toggleDrawer(): void {
  drawerOpen.value = !drawerOpen.value
}

function handleTabClick(tab: Tab): void {
  if (tab.route) {
    router.push(tab.route)
  }
}
</script>
