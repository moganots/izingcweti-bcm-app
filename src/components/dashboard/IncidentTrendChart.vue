<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Incident Trends</div>
        <q-select
          v-model="selectedPeriod"
          :options="periodOptions"
          dense
          outlined
          style="width: 120px"
          emit-value
          map-options
          @update:model-value="handlePeriodChange"
        />
      </div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else-if="data.length === 0" class="text-center q-pa-md text-grey-7">
        <q-icon name="insights" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No incident data available</div>
      </div>
      <div v-else class="chart-container">
        <div class="chart-bars">
          <div class="chart-bar-group" v-for="item in data" :key="item.period">
            <div class="chart-bar-label">{{ item.label }}</div>
            <div class="chart-bar-stack">
              <div
                class="chart-bar critical"
                :style="{ height: getHeight(item.critical) + '%' }"
                :title="'Critical: ' + item.critical"
              ></div>
              <div
                class="chart-bar high"
                :style="{ height: getHeight(item.high) + '%' }"
                :title="'High: ' + item.high"
              ></div>
              <div
                class="chart-bar medium"
                :style="{ height: getHeight(item.medium) + '%' }"
                :title="'Medium: ' + item.medium"
              ></div>
              <div
                class="chart-bar low"
                :style="{ height: getHeight(item.low) + '%' }"
                :title="'Low: ' + item.low"
              ></div>
            </div>
            <div class="chart-bar-value">{{ item.total }}</div>
          </div>
        </div>
        <div class="chart-legend q-mt-md">
          <div class="row q-gutter-sm justify-center">
            <div class="legend-item"><span class="legend-color critical-bg"></span> Critical</div>
            <div class="legend-item"><span class="legend-color high-bg"></span> High</div>
            <div class="legend-item"><span class="legend-color medium-bg"></span> Medium</div>
            <div class="legend-item"><span class="legend-color low-bg"></span> Low</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface IncidentTrendData {
  period: string
  label: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
}

const props = withDefaults(
  defineProps<{
    data?: IncidentTrendData[]
    loading?: boolean
  }>(),
  {
    data: () => [],
    loading: false,
  }
)

const emit = defineEmits<{
  'period-change': [period: string]
}>()

const selectedPeriod = ref('month')
const periodOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
]

const maxValue = computed(() => {
  if (props.data.length === 0) return 1
  return Math.max(...props.data.map((d) => d.total), 1)
})

function getHeight(value: number): number {
  return maxValue.value > 0 ? Math.round((value / maxValue.value) * 100) : 0
}

function handlePeriodChange(value: string): void {
  emit('period-change', value)
}
</script>

<style lang="scss" scoped>
.chart-container {
  padding: 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 200px;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-bar-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.chart-bar-stack {
  width: 100%;
  max-width: 50px;
  display: flex;
  flex-direction: column-reverse;
  height: 140px;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  background: var(--grey-2);
}

.chart-bar {
  width: 100%;
  transition: height 0.3s ease;
  min-height: 2px;
}

.chart-bar.critical {
  background: var(--negative);
}

.chart-bar.high {
  background: var(--warning);
}

.chart-bar.medium {
  background: #fbc02d;
}

.chart-bar.low {
  background: var(--positive);
}

.chart-bar-value {
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.critical-bg {
  background: var(--negative);
}

.high-bg {
  background: var(--warning);
}

.medium-bg {
  background: #fbc02d;
}

.low-bg {
  background: var(--positive);
}
</style>
