<template>
  <q-card
    class="incident-card cursor-pointer"
    flat
    bordered
    :class="'border-left-' + getSeverityColor(incident.incident_severity)"
    @click="$emit('click', incident)"
  >
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getSeverityColor(incident.incident_severity)"
          :label="incident.incident_severity"
          class="q-px-sm q-py-xs"
        />
        <span class="text-caption text-grey-7">{{ formatDate(incident.declared_at) }}</span>
      </div>

      <div class="text-h6 q-mb-xs">{{ incident.root_cause }}</div>
      <div class="text-grey-7 text-body2 q-mb-md">
        Recovery Time: {{ incident.recovery_actual_time || 'In Progress' }}
      </div>

      <q-separator class="q-mb-sm" />

      <div class="row items-center justify-between">
        <q-badge
          :color="incident.closed_at ? 'green' : 'orange'"
          :label="incident.closed_at ? 'Closed' : 'Active'"
        />
        <div class="q-gutter-xs">
          <q-btn
            v-if="!incident.closed_at"
            flat
            color="green"
            icon="check"
            label="Close"
            size="sm"
            @click.stop="$emit('close', incident)"
          />
          <q-btn
            v-if="!incident.closed_at"
            flat
            color="orange"
            icon="arrow_upward"
            label="Escalate"
            size="sm"
            @click.stop="$emit('escalate', incident)"
          />
        </div>
      </div>

      <div v-if="incident.organisation" class="text-caption text-grey-6 q-mt-sm">
        <q-icon name="business" size="14px" class="q-mr-xs" />
        {{ incident.organisation.name }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

defineProps<{ incident: any }>()
defineEmits<{
  click: [incident: any]
  close: [incident: any]
  escalate: [incident: any]
}>()

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'yellow',
    Low: 'green',
    Informational: 'blue',
  }
  return colors[severity] || 'grey'
}
</script>

<style lang="scss" scoped>
.incident-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid transparent;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
.border-left-red {
  border-left-color: #f44336 !important;
}
.border-left-orange {
  border-left-color: #ff9800 !important;
}
.border-left-yellow {
  border-left-color: #fbc02d !important;
}
.border-left-green {
  border-left-color: #4caf50 !important;
}
.border-left-blue {
  border-left-color: #2196f3 !important;
}
</style>
