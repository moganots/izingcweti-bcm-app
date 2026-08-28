<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Risk Heat Map</div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else class="heat-map">
        <div class="heat-map-grid">
          <div class="heat-map-header heat-map-corner"></div>
          <div class="heat-map-header" v-for="likelihood in likelihoods" :key="likelihood.label">
            {{ likelihood.label }}
          </div>
          <template v-for="(impact, i) in impacts" :key="impact">
            <div class="heat-map-header heat-map-impact">{{ impact }}</div>
            <div
              v-for="(likelihood, j) in likelihoods"
              :key="`${i}-${j}`"
              class="heat-map-cell"
              :class="getCellClass(i, j)"
              @click="$emit('cell-click', { impact, likelihood: likelihood.value })"
            >
              <div class="cell-count" v-if="getCellCount(i, j) > 0">{{ getCellCount(i, j) }}</div>
            </div>
          </template>
        </div>
        <div class="heat-map-legend q-mt-md">
          <div class="row q-gutter-sm items-center justify-center">
            <div class="legend-item">
              <span class="legend-color bg-green-3"></span>
              <span class="legend-label">Low</span>
            </div>
            <div class="legend-item">
              <span class="legend-color bg-yellow-3"></span>
              <span class="legend-label">Medium</span>
            </div>
            <div class="legend-item">
              <span class="legend-color bg-orange-3"></span>
              <span class="legend-label">High</span>
            </div>
            <div class="legend-item">
              <span class="legend-color bg-red-3"></span>
              <span class="legend-label">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface RiskData {
  impactSeverity: string
  likelihood: number
}

const props = withDefaults(
  defineProps<{
    risks?: RiskData[]
    loading?: boolean
  }>(),
  {
    risks: () => [],
    loading: false,
  }
)

defineEmits<{
  'cell-click': [cell: { impact: string; likelihood: number }]
}>()

const impacts = ['Insignificant', 'Low', 'Medium', 'High', 'Critical']
const likelihoods = [
  { label: 'VL', value: 0.2 },
  { label: 'L', value: 0.4 },
  { label: 'M', value: 0.6 },
  { label: 'H', value: 0.8 },
  { label: 'VH', value: 1.0 },
]

const risksData = computed(() => props.risks)

function getCellCount(i: number, j: number): number {
  return risksData.value.filter(
    (r) => r.impactSeverity === impacts[i] && Math.abs(r.likelihood - likelihoods[j]!.value) < 0.2
  ).length
}

function getCellClass(i: number, j: number): string {
  const score = (i + 1) * (j + 1)
  if (score > 15) return 'bg-red-3'
  if (score > 10) return 'bg-orange-3'
  if (score > 5) return 'bg-yellow-3'
  return 'bg-green-3'
}
</script>

<style lang="scss" scoped>
.heat-map-grid {
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr);
  gap: 2px;
}

.heat-map-header {
  padding: 8px 4px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  background: var(--grey-2);
  border-radius: 4px;
}

.heat-map-corner {
  grid-column: 1;
  grid-row: 1;
}

.heat-map-impact {
  grid-column: 1;
  font-weight: 500;
}

.heat-map-cell {
  padding: 12px 4px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

.cell-count {
  font-size: 16px;
  font-weight: bold;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-size: 12px;
}
</style>