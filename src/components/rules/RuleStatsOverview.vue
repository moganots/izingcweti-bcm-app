<template>
  <div class="rule-stats">
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

const props = defineProps<{ rules?: any[] }>()

const stats = computed(() => {
  const data = props.rules || []
  return [
    { label: 'Total', value: data.length, color: 'primary', icon: 'rule' },
    {
      label: 'Active',
      value: data.filter((r: any) => r.status === 'ACTIVE').length,
      color: 'green',
      icon: 'check_circle',
    },
    {
      label: 'Draft',
      value: data.filter((r: any) => r.status === 'DRAFT').length,
      color: 'orange',
      icon: 'edit',
    },
    {
      label: 'Inactive',
      value: data.filter((r: any) => r.status === 'INACTIVE').length,
      color: 'grey',
      icon: 'pause',
    },
    {
      label: 'Total Executions',
      value: data.reduce((s: number, r: any) => s + (r.execution_count || 0), 0),
      color: 'blue',
      icon: 'play_arrow',
    },
    {
      label: 'Failures',
      value: data.reduce((s: number, r: any) => s + (r.failure_count || 0), 0),
      color: 'red',
      icon: 'error',
    },
    {
      label: 'Success Rate',
      value: getSuccessRate(data) + '%',
      color: 'green',
      icon: 'trending_up',
    },
  ]
})

function getSuccessRate(data: any[]): number {
  const total = data.reduce((s: number, r: any) => s + (r.execution_count || 0), 0)
  const failures = data.reduce((s: number, r: any) => s + (r.failure_count || 0), 0)
  if (total === 0) return 100
  return Math.round(((total - failures) / total) * 100)
}
</script>
