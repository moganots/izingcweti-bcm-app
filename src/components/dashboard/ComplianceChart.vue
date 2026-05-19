<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Compliance Overview</div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else-if="data.length === 0" class="text-center q-pa-md text-grey-7">
        <q-icon name="verified" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No compliance data available</div>
      </div>
      <div v-else>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-4" v-for="item in chartData" :key="item.label">
            <div class="text-center">
              <q-circular-progress
                :value="item.percentage"
                size="80px"
                :color="item.color"
                track-color="grey-3"
                show-value
                font-size="14px"
                class="q-mb-sm"
              >
                {{ item.percentage }}%
              </q-circular-progress>
              <div class="text-caption text-weight-medium">{{ item.label }}</div>
              <div class="text-caption text-grey-6">
                {{ item.compliant }}/{{ item.total }} compliant
              </div>
            </div>
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div class="row q-col-gutter-sm">
          <div class="col-6" v-for="item in chartData" :key="'bar-' + item.label">
            <div class="text-caption text-grey-6 q-mb-xs">{{ item.label }}</div>
            <q-linear-progress
              :value="item.percentage / 100"
              :color="item.color"
              size="8px"
              rounded
              class="q-mb-xs"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ComplianceData {
  standard: string
  compliant: number
  total: number
}

const props = withDefaults(
  defineProps<{
    data?: ComplianceData[]
    loading?: boolean
  }>(),
  {
    data: () => [],
    loading: false,
  }
)

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [
      { label: 'ISO 22301', compliant: 0, total: 0, percentage: 0, color: 'blue' },
      { label: 'NIST 800-34', compliant: 0, total: 0, percentage: 0, color: 'green' },
      { label: 'FFIEC', compliant: 0, total: 0, percentage: 0, color: 'orange' },
      { label: 'COBIT 2019', compliant: 0, total: 0, percentage: 0, color: 'purple' },
    ]
  }
  return props.data.map((d) => ({
    label: d.standard,
    compliant: d.compliant,
    total: d.total,
    percentage: d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 0,
    color:
      d.total > 0 && d.compliant / d.total >= 0.8
        ? 'positive'
        : d.compliant / d.total >= 0.5
        ? 'warning'
        : 'negative',
  }))
})
</script>
