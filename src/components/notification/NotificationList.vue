<template>
  <div class="notification-list">
    <!-- Tabs -->
    <q-tabs
      v-model="activeTab"
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="all" :label="'All (' + totalCount + ')'" />
      <q-tab name="unread" :label="'Unread (' + unreadCount + ')'">
        <q-badge v-if="unreadCount > 0" floating color="red">{{ unreadCount }}</q-badge>
      </q-tab>
      <q-tab name="read" :label="'Read (' + readCount + ')'">
        <q-badge v-if="readCount > 0" floating color="green">{{ readCount }}</q-badge>
      </q-tab>
      <q-tab name="archived" :label="'Archived (' + archivedCount + ')'">
        <q-badge v-if="archivedCount > 0" floating color="grey">{{ archivedCount }}</q-badge>
      </q-tab>
    </q-tabs>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotifications.length === 0" class="text-center q-pa-xl">
      <q-icon name="notifications_off" size="60px" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-7">{{ emptyTitle }}</div>
      <p class="text-grey-6">{{ emptyDescription }}</p>
    </div>

    <!-- Notification Items -->
    <q-list v-else separator>
      <transition-group name="slide">
        <NotificationItem
          v-for="notification in filteredNotifications"
          :key="notification.uuid"
          :notification="notification"
          @click="$emit('notification-click', notification)"
          @mark-read="$emit('mark-read', notification)"
          @archive="$emit('archive', notification)"
          @dismiss="$emit('dismiss', notification)"
          @delete="$emit('delete', notification)"
        />
      </transition-group>
    </q-list>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center q-mt-lg">
      <q-btn
        outline
        color="primary"
        label="Load More"
        :loading="loadingMore"
        @click="$emit('load-more')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NotificationItem from './NotificationItem.vue'

const props = withDefaults(
  defineProps<{
    notifications?: any[]
    loading?: boolean
    loadingMore?: boolean
    hasMore?: boolean
  }>(),
  {
    notifications: () => [],
    loading: false,
    loadingMore: false,
    hasMore: false,
  }
)

defineEmits<{
  'notification-click': [notification: any]
  'mark-read': [notification: any]
  archive: [notification: any]
  dismiss: [notification: any]
  delete: [notification: any]
  'load-more': []
}>()

const activeTab = ref('all')

const totalCount = computed(() => props.notifications.length)
const unreadCount = computed(
  () => props.notifications.filter((n) => !n.is_read && n.status !== 'ARCHIVED').length
)
const readCount = computed(
  () => props.notifications.filter((n) => n.is_read && n.status !== 'ARCHIVED').length
)
const archivedCount = computed(
  () => props.notifications.filter((n) => n.status === 'ARCHIVED').length
)

const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return props.notifications.filter((n) => !n.is_read && n.status !== 'ARCHIVED')
    case 'read':
      return props.notifications.filter((n) => n.is_read && n.status !== 'ARCHIVED')
    case 'archived':
      return props.notifications.filter((n) => n.status === 'ARCHIVED')
    default:
      return props.notifications.filter((n) => n.status !== 'ARCHIVED')
  }
})

const emptyTitle = computed(() => {
  const titles: Record<string, string> = {
    all: 'No Notifications',
    unread: 'No Unread Notifications',
    read: 'No Read Notifications',
    archived: 'No Archived Notifications',
  }
  return titles[activeTab.value] || 'No Notifications'
})

const emptyDescription = computed(() => {
  const descriptions: Record<string, string> = {
    all: "You're all caught up! New notifications will appear here.",
    unread: "Great job! You've read all your notifications.",
    read: 'No read notifications yet.',
    archived: 'No archived notifications.',
  }
  return descriptions[activeTab.value] || ''
})
</script>

<style lang="scss" scoped>
.slide-enter-active {
  transition: all 0.3s ease-out;
}
.slide-leave-active {
  transition: all 0.2s ease-in;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
