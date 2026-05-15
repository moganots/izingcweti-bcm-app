<template>
  <div class="incident-stats">
    <div class="row q-col-gutter-md">
      <div class="col-6 col-md-2" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
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

const props = withDefaults(
  defineProps<{
    incidents?: any[]
    showAll?: boolean
  }>(),
  {
    incidents: () => [],
    showAll: true,
  }
)

const stats = computed(() => {
  const data = props.incidents
  const active = data.filter((i) => !i.closed_at)
  const closed = data.filter((i) => i.closed_at)

  const baseStats = [
    { label: 'Total', value: data.length, color: 'primary' },
    {
      label: 'Critical',
      value: active.filter((i) => i.incident_severity === 'Critical').length,
      color: 'red',
    },
    {
      label: 'High',
      value: active.filter((i) => i.incident_severity === 'High').length,
      color: 'orange',
    },
    { label: 'Active', value: active.length, color: 'warning' },
    { label: 'Closed', value: closed.length, color: 'green' },
  ]

  if (props.showAll) {
    baseStats.push({
      label: 'This Week',
      value: data.filter((i) => isThisWeek(i.declared_at)).length,
      color: 'info',
    })
  }

  return baseStats
})

function isThisWeek(date: string): boolean {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  return d >= weekStart
}
</script>
