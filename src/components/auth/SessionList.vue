<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Active Sessions</div>
      <q-list separator>
        <q-item v-for="session in sessions" :key="session.id">
          <q-item-section avatar>
            <q-icon
              :name="session.isCurrent ? 'phone_android' : 'devices'"
              :color="session.isCurrent ? 'primary' : 'grey'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ session.device }}
              <q-badge v-if="session.isCurrent" color="primary" label="Current" class="q-ml-sm" />
            </q-item-label>
            <q-item-label caption
              >{{ session.location }} | Last active: {{ session.lastActive }}</q-item-label
            >
          </q-item-section>
          <q-item-section side v-if="!session.isCurrent">
            <q-btn
              flat
              round
              color="negative"
              icon="close"
              size="sm"
              @click="$emit('revoke', session.id)"
            >
              <q-tooltip>Revoke Session</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  sessions?: Array<{
    id: string
    device: string
    location: string
    lastActive: string
    isCurrent: boolean
  }>
}>()
defineEmits<{ revoke: [id: string] }>()
</script>
