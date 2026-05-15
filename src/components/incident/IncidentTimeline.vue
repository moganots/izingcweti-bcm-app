<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="timeline" size="sm" class="q-mr-sm" />
        Incident Timeline
      </div>

      <div v-if="entries!?.length === 0" class="text-center q-py-md text-grey-7">
        No timeline entries
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="(entry, index) in entries"
          :key="index"
          :icon="entry.icon"
          :color="entry.color"
          :title="entry.title"
          :subtitle="entry.subtitle"
          :side="index % 2 === 0 ? 'left' : 'right'"
        >
          <div v-if="entry.description" class="text-body2">{{ entry.description }}</div>
          <div v-if="entry.details" class="q-mt-sm">
            <div v-for="(value, key) in entry.details" :key="key" class="text-caption">
              <strong>{{ key }}:</strong> {{ value }}
            </div>
          </div>
          <q-badge
            v-if="entry.badge"
            :color="entry.badgeColor"
            :label="entry.badge"
            class="q-mt-sm"
          />
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  entries?: Array<{
    icon: string
    color: string
    title: string
    subtitle: string
    description?: string
    details?: Record<string, string>
    badge?: string
    badgeColor?: string
  }>
}>()

// Default entries can be generated from incident data
// Example usage:
// entries = [
//   { icon: 'report', color: 'red', title: 'Incident Declared', subtitle: '2025-01-15 14:30', description: 'DDoS attack detected', badge: 'Critical', badgeColor: 'red' },
//   { icon: 'description', color: 'primary', title: 'BCP Activated', subtitle: '2025-01-15 14:35' },
//   { icon: 'check_circle', color: 'green', title: 'Incident Resolved', subtitle: '2025-01-15 17:30', description: 'Recovery Time: 3 hours' },
// ]
</script>
