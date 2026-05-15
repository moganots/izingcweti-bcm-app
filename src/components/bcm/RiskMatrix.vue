<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Risk Matrix</div>
      <div class="risk-matrix">
        <div class="matrix-grid">
          <div class="matrix-header matrix-corner"></div>
          <div class="matrix-header" v-for="likelihood in likelihoods" :key="likelihood.label">
            {{ likelihood.label }}
          </div>
          <template v-for="(impact, i) in impacts" :key="impact">
            <div class="matrix-header matrix-impact">{{ impact }}</div>
            <div
              v-for="(likelihood, j) in likelihoods"
              :key="`${i}-${j}`"
              class="matrix-cell"
              :class="getCellClass(i, j)"
              @click="$emit('cell-click', { impact, likelihood: likelihood.value })"
            >
              <div class="cell-score">{{ getCellScore(i, j) }}</div>
              <div class="cell-count" v-if="getCellCount(i, j) > 0">{{ getCellCount(i, j) }}</div>
            </div>
          </template>
        </div>
        <div class="matrix-legend q-mt-md">
          <div class="row q-gutter-sm items-center justify-center">
            <q-badge color="green-3" label="Low (1-5)" />
            <q-badge color="yellow-3" label="Medium (6-10)" />
            <q-badge color="orange-3" label="High (11-15)" />
            <q-badge color="red-3" label="Critical (16-25)" />
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

const risks = computed(() => props.risks || [])

function getCellScore(i: number, j: number): number {
  return (i + 1) * (j + 1)
}

function getCellCount(i: number, j: number): number {
  const impact = impacts[i]
  const likelihood = likelihoods[j]!?.value
  return risks.value.filter(
    (r: any) => r.impact_severity === impact && Math.abs(r.likelihood - likelihood) < 0.2
  ).length
}

function getCellClass(i: number, j: number): string {
  const score = getCellScore(i, j)
  if (score > 15) return 'bg-red-3'
  if (score > 10) return 'bg-orange-3'
  if (score > 5) return 'bg-yellow-3'
  return 'bg-green-3'
}
</script>

<style lang="scss" scoped>
.matrix-grid {
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr);
  gap: 2px;
}
.matrix-header {
  padding: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  background: #f5f5f5;
}
.matrix-corner {
  grid-column: 1;
  grid-row: 1;
}
.matrix-impact {
  grid-column: 1;
}
.matrix-cell {
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.matrix-cell:hover {
  transform: scale(1.05);
}
.cell-score {
  font-weight: bold;
  font-size: 14px;
}
.cell-count {
  font-size: 11px;
  opacity: 0.7;
}
</style>
