<template>
  <div class="audit-stats">
    <div class="row q-col-gutter-md">
      <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
            <q-icon :name="stat.icon" :color="stat.color" size="28px" class="q-mb-sm" />
            <div class="text-h4" :class="'text-' + stat.color">{{ stat.value }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ logs?: any[]; statsData?: any }>()

const stats = computed(() => {
  if (props.statsData) {
    return [
      {
        label: 'Total Logs',
        value: props.statsData.total_logs || 0,
        color: 'primary',
        icon: 'history',
      },
      { label: 'Today', value: props.statsData.logs_today || 0, color: 'blue', icon: 'today' },
      {
        label: 'This Week',
        value: props.statsData.logs_this_week || 0,
        color: 'green',
        icon: 'date_range',
      },
      {
        label: 'This Month',
        value: props.statsData.logs_this_month || 0,
        color: 'purple',
        icon: 'calendar_month',
      },
      {
        label: 'Errors',
        value:
          props.logs?.filter((l: any) => l.severity === 'ERROR' || l.severity === 'CRITICAL')
            .length || 0,
        color: 'red',
        icon: 'error',
      },
      {
        label: 'Security',
        value: props.logs?.filter((l: any) => l.audit_category === 'SECURITY').length || 0,
        color: 'deep-orange',
        icon: 'security',
      },
      {
        label: 'Avg Time',
        value: (props.statsData?.average_execution_time || 0) + 'ms',
        color: 'info',
        icon: 'timer',
      },
    ]
  }
  return []
})
</script>
