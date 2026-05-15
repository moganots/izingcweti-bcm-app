<template>
  <div class="risk-stats-overview">
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

const props = defineProps<{ risks?: any[] }>()

const stats = computed(() => {
  const data = props.risks || []
  return [
    { label: 'Total Risks', value: data.length, color: 'primary', icon: 'warning' },
    {
      label: 'Critical',
      value: data.filter((r: any) => r.inherent_risk_score >= 8.5).length,
      color: 'red',
      icon: 'error',
    },
    {
      label: 'High',
      value: data.filter((r: any) => r.inherent_risk_score >= 7 && r.inherent_risk_score < 8.5)
        .length,
      color: 'orange',
      icon: 'warning',
    },
    {
      label: 'Medium',
      value: data.filter((r: any) => r.inherent_risk_score >= 5 && r.inherent_risk_score < 7)
        .length,
      color: 'yellow',
      icon: 'info',
    },
    {
      label: 'Low',
      value: data.filter((r: any) => r.inherent_risk_score < 5).length,
      color: 'green',
      icon: 'check_circle',
    },
    {
      label: 'Mitigated',
      value: data.filter((r: any) => r.mitigation_control_ids?.length > 0).length,
      color: 'info',
      icon: 'shield',
    },
  ]
})
</script>
