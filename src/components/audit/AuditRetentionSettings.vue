<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Retention Settings</div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <q-list v-else separator>
        <q-item v-for="policy in policies" :key="policy.uuid">
          <q-item-section avatar>
            <q-icon :name="getCategoryIcon(policy.audit_category)" color="primary" size="22px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ formatCategory(policy.audit_category) }}</q-item-label>
            <q-item-label caption>{{ policy.retention_days }} days retention</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              :model-value="policy.is_active"
              color="primary"
              @update:model-value="$emit('toggle-policy', policy, $event)"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn flat round size="sm" icon="edit" @click="$emit('edit-policy', policy)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  policies?: any[]
  loading?: boolean
}>()

defineEmits<{
  'toggle-policy': [policy: any, value: boolean]
  'edit-policy': [policy: any]
}>()

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    USER_ACTIVITY: 'person',
    SYSTEM_EVENT: 'settings',
    SECURITY: 'security',
    DATA_CHANGE: 'edit',
    ACCESS_CONTROL: 'lock',
    WORKFLOW: 'account_tree',
    COMPLIANCE: 'verified',
    SYNC: 'sync',
    CONFIGURATION: 'build',
  }
  return icons[category] || 'circle'
}

function formatCategory(category: string): string {
  return category?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || category
}
</script>
