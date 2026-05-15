<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          Pending Changes
          <q-badge v-if="changes!?.length > 0" color="orange" class="q-ml-sm">{{
            changes!?.length
          }}</q-badge>
        </div>
        <q-btn
          v-if="changes!?.length > 0"
          flat
          color="primary"
          icon="cloud_upload"
          label="Push All"
          :disable="disabled"
          @click="$emit('push-all')"
        />
      </div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <div v-else-if="changes!?.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="check_circle" size="40px" color="green" class="q-mb-sm" />
        <div>No pending changes</div>
        <div class="text-caption">All changes have been synced</div>
      </div>

      <q-list v-else separator>
        <q-item v-for="change in changes" :key="change.uuid || change.id">
          <q-item-section avatar>
            <q-icon
              :name="getOperationIcon(change.operation_type)"
              :color="getOperationColor(change.operation_type)"
              size="22px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getChangeLabel(change) }}</q-item-label>
            <q-item-label caption>
              {{ change.entity_type }} | {{ formatTimeAgo(change.created_at) }}
            </q-item-label>
            <q-item-label v-if="change.attempts > 0" caption class="text-orange">
              {{ change.attempts }} retry attempt{{ change.attempts !== 1 ? 's' : '' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="getPriorityColor(change.priority)" :label="'P' + change.priority" />
          </q-item-section>
          <q-item-section side>
            <q-btn flat round size="sm" icon="more_vert">
              <q-menu>
                <q-list dense>
                  <q-item clickable v-close-popup @click="$emit('push', change)">
                    <q-item-section avatar><q-icon name="cloud_upload" /></q-item-section>
                    <q-item-section>Push Now</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="$emit('retry', change)"
                    v-if="change.attempts > 0"
                  >
                    <q-item-section avatar><q-icon name="refresh" /></q-item-section>
                    <q-item-section>Retry</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="$emit('remove', change)">
                    <q-item-section avatar
                      ><q-icon name="delete" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative">Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '../../utils/date.utils'

defineProps<{
  changes?: any[]
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'push-all': []
  push: [change: any]
  retry: [change: any]
  remove: [change: any]
}>()

function getOperationIcon(type: string): string {
  const icons: Record<string, string> = { CREATE: 'add_circle', UPDATE: 'edit', DELETE: 'delete' }
  return icons[type] || 'circle'
}

function getOperationColor(type: string): string {
  const colors: Record<string, string> = { CREATE: 'green', UPDATE: 'blue', DELETE: 'red' }
  return colors[type] || 'grey'
}

function getChangeLabel(change: any): string {
  const operation = change.operation_type || 'UPDATE'
  return `${operation} ${change.entity_type}${
    change.entity_id ? ' #' + change.entity_id.substring(0, 8) : ''
  }`
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = { 1: 'red', 2: 'orange', 3: 'yellow', 4: 'blue' }
  return colors[priority] || 'grey'
}
</script>
