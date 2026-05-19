<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">BCM Maturity</div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else class="text-center">
        <div class="maturity-gauge">
          <q-circular-progress
            :value="percentage"
            size="160px"
            :color="color"
            track-color="grey-3"
            show-value
            font-size="42px"
            class="q-mb-md"
            :thickness="0.15"
          >
            <div class="text-h3 text-weight-bold">{{ score }}</div>
            <div class="text-caption text-grey-6">out of 5</div>
          </q-circular-progress>
        </div>
        <div class="text-h5 text-weight-bold q-mb-xs" :class="`text-${color}`">
          {{ levelLabel }}
        </div>
        <div class="text-body2 text-grey-7 q-mb-md">{{ levelDescription }}</div>
        <q-linear-progress
          :value="percentage / 100"
          :color="color"
          size="12px"
          rounded
          class="q-mb-sm"
        />
        <div class="row justify-between text-caption text-grey-6 q-mt-xs">
          <span
            v-for="lvl in levels"
            :key="lvl.level"
            :class="{ 'text-bold': lvl.level === currentLevel }"
          >
            {{ lvl.label }}
          </span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    score?: number
    loading?: boolean
  }>(),
  {
    score: 0,
    loading: false,
  }
)

const levels = [
  { level: 1, label: 'Initial', description: 'Ad hoc processes, unpredictable outcomes' },
  { level: 2, label: 'Repeatable', description: 'Some processes documented, repeatable' },
  { level: 3, label: 'Defined', description: 'Standardized processes across organization' },
  { level: 4, label: 'Managed', description: 'Measured and controlled processes' },
  { level: 5, label: 'Optimizing', description: 'Continuous improvement focus' },
]

const percentage = computed(() => (props.score / 5) * 100)
const currentLevel = computed(() => Math.floor(props.score) || 1)

const color = computed(() => {
  if (props.score >= 4) return 'positive'
  if (props.score >= 3) return 'info'
  if (props.score >= 2) return 'warning'
  return 'negative'
})

const levelLabel = computed(() => levels[currentLevel.value - 1]?.label || 'Not Assessed')
const levelDescription = computed(() => levels[currentLevel.value - 1]?.description || '')
</script>
