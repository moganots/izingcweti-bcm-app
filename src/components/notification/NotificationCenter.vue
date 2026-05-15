<template>
  <q-card flat bordered>
    <q-card-section class="row items-center justify-between">
      <div class="text-h6">Notifications</div>
      <div class="q-gutter-sm">
        <q-btn
          v-if="unreadCount > 0"
          flat
          dense
          color="primary"
          icon="done_all"
          label="Mark All Read"
          @click="$emit('mark-all-read')"
        />
        <q-btn flat dense color="grey" icon="settings" @click="$emit('open-preferences')">
          <q-tooltip>Preferences</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <NotificationList
      :notifications="notifications || []"
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      @notification-click="$emit('notification-click', $event)"
      @mark-read="$emit('mark-read', $event)"
      @archive="$emit('archive', $event)"
      @dismiss="$emit('dismiss', $event)"
      @delete="$emit('delete', $event)"
      @load-more="$emit('load-more')"
    />

    <q-card-actions align="center" v-if="totalCount > 0">
      <q-btn flat color="grey" label="Clear All" @click="$emit('clear-all')" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NotificationList from './NotificationList.vue'

const props = defineProps<{
  notifications?: any[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
}>()

defineEmits<{
  'notification-click': [notification: any]
  'mark-read': [notification: any]
  'mark-all-read': []
  archive: [notification: any]
  dismiss: [notification: any]
  delete: [notification: any]
  'load-more': []
  'open-preferences': []
  'clear-all': []
}>()

const unreadCount = computed(() => props.notifications?.filter((n) => !n.is_read)?.length || 0)
const totalCount = computed(() => props.notifications?.length || 0)
</script>
