<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Risk Heat Map</div>
      <div class="heat-map">
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
            <q-badge color="green-3" text-color="dark" label="Low" />
            <q-badge color="yellow-3" text-color="dark" label="Medium" />
            <q-badge color="orange-3" text-color="dark" label="High" />
            <q-badge color="red-3" text-color="dark" label="Critical" />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ risks?: any[] }>()
defineEmits<{ 'cell-click': [cell: { impact: string; likelihood: number }] }>()

const impacts = ['Insignificant', 'Low', 'Medium', 'High', 'Critical']
const likelihoods = [
  { label: 'VL', value: 0.2 },
  { label: 'L', value: 0.4 },
  { label: 'M', value: 0.6 },
  { label: 'H', value: 0.8 },
  { label: 'VH', value: 1.0 },
]

const risksData = computed(() => props.risks || [])

function getCellCount(i: number, j: number): number {
  return risksData.value.filter(
    (r: any) =>
      r.impact_severity === impacts[i] && Math.abs(r.likelihood - likelihoods[j]!?.value) < 0.2
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
  padding: 6px;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
  background: #f5f5f5;
}
.heat-map-corner {
  grid-column: 1;
  grid-row: 1;
}
.heat-map-impact {
  grid-column: 1;
}
.heat-map-cell {
  padding: 4px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.heat-map-cell:hover {
  transform: scale(1.05);
}
.cell-count {
  font-size: 14px;
  font-weight: bold;
}
</style>
