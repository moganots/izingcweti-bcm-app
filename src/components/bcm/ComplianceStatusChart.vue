<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Compliance Status</div>
      <div class="row q-col-gutter-sm">
        <div class="col-4" v-for="item in complianceData" :key="item.label">
          <div class="text-center">
            <q-circular-progress
              :value="item.percentage"
              size="80px"
              :color="item.color"
              track-color="grey-3"
              show-value
              font-size="16px"
            >
              {{ item.percentage }}%
            </q-circular-progress>
            <div class="text-caption q-mt-sm">{{ item.label }}</div>
            <div class="text-caption text-grey-6">{{ item.compliant }}/{{ item.total }}</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data?: Array<{ standard: string; compliant: number; total: number }>
}>()

const complianceData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [
      { label: 'ISO 22301', compliant: 0, total: 0, percentage: 0, color: 'blue' },
      { label: 'NIST 800-34', compliant: 0, total: 0, percentage: 0, color: 'green' },
      { label: 'FFIEC', compliant: 0, total: 0, percentage: 0, color: 'orange' },
    ]
  }
  return props.data.map((d) => ({
    label: d.standard,
    compliant: d.compliant,
    total: d.total,
    percentage: d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 0,
    color:
      d.total > 0 && d.compliant / d.total >= 0.8
        ? 'green'
        : d.compliant / d.total >= 0.5
        ? 'orange'
        : 'red',
  }))
})
</script>
