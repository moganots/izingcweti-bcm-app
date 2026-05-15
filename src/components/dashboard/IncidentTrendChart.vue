<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Incident Trends</div>
        <q-select
          v-model="period"
          :options="periodOptions"
          dense
          outlined
          style="width: 120px"
          @update:model-value="$emit('period-change', period)"
        />
      </div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else-if="data.length === 0" class="text-center q-pa-md text-grey-7">
        No incident data available
      </div>
      <div v-else class="chart-container">
        <div class="chart-bars">
          <div class="chart-bar-group" v-for="item in data" :key="item.period">
            <div class="chart-bar-label">{{ item.label }}</div>
            <div class="chart-bar-stack">
              <div
                class="chart-bar critical"
                :style="{ height: getHeight(item.critical, maxValue) + '%' }"
                :title="'Critical: ' + item.critical"
              ></div>
              <div
                class="chart-bar high"
                :style="{ height: getHeight(item.high, maxValue) + '%' }"
                :title="'High: ' + item.high"
              ></div>
              <div
                class="chart-bar medium"
                :style="{ height: getHeight(item.medium, maxValue) + '%' }"
                :title="'Medium: ' + item.medium"
              ></div>
              <div
                class="chart-bar low"
                :style="{ height: getHeight(item.low, maxValue) + '%' }"
                :title="'Low: ' + item.low"
              ></div>
            </div>
            <div class="chart-bar-value">{{ item.total }}</div>
          </div>
        </div>
        <div class="chart-legend q-mt-md row q-gutter-sm justify-center">
          <div class="legend-item"><span class="legend-color critical-bg"></span> Critical</div>
          <div class="legend-item"><span class="legend-color high-bg"></span> High</div>
          <div class="legend-item"><span class="legend-color medium-bg"></span> Medium</div>
          <div class="legend-item"><span class="legend-color low-bg"></span> Low</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data?: Array<{
      period: string
      label: string
      critical: number
      high: number
      medium: number
      low: number
      total: number
    }>
    loading?: boolean
  }>(),
  {
    data: () => [],
    loading: false,
  }
)

defineEmits<{ 'period-change': [period: string] }>()

const period = ref('month')
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

function getHeight(value: number, max: number): number {
  return max > 0 ? Math.round((value / max) * 100) : 0
}
</script>

<style lang="scss" scoped>
.chart-container {
  padding: 0;
}
.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 160px;
}
.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chart-bar-label {
  font-size: 10px;
  color: #999;
  margin-bottom: 4px;
}
.chart-bar-stack {
  width: 100%;
  max-width: 40px;
  display: flex;
  flex-direction: column-reverse;
  height: 120px;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}
.chart-bar {
  width: 100%;
  transition: height 0.3s;
  min-height: 2px;
}
.chart-bar.critical {
  background: #f44336;
}
.chart-bar.high {
  background: #ff9800;
}
.chart-bar.medium {
  background: #ffc107;
}
.chart-bar.low {
  background: #4caf50;
}
.chart-bar-value {
  font-size: 11px;
  font-weight: bold;
  margin-top: 4px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
}
.critical-bg {
  background: #f44336;
}
.high-bg {
  background: #ff9800;
}
.medium-bg {
  background: #ffc107;
}
.low-bg {
  background: #4caf50;
}
</style>
