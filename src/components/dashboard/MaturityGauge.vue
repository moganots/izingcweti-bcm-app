<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">BCM Maturity</div>
      <div class="text-center">
        <div class="maturity-gauge">
          <q-circular-progress
            :value="percentage"
            size="140px"
            :color="color"
            track-color="grey-3"
            show-value
            font-size="36px"
            class="q-mb-md"
          >
            <div class="text-h4 text-weight-bold">{{ score }}</div>
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
          size="20px"
          rounded
          class="q-mb-sm"
        />
        <div class="row justify-between text-caption text-grey-6">
          <span v-for="lvl in levels" :key="lvl.level">{{ lvl.label }}</span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ score?: number }>(), { score: 0 })

const levels = [
  { level: 1, label: 'Initial', description: 'Ad hoc processes' },
  { level: 2, label: 'Repeatable', description: 'Some processes documented' },
  { level: 3, label: 'Defined', description: 'Standardized processes' },
  { level: 4, label: 'Managed', description: 'Measured and controlled' },
  { level: 5, label: 'Optimizing', description: 'Continuous improvement' },
]

const percentage = computed(() => (props.score / 5) * 100)
const currentLevel = computed(() => levels[Math.max(0, Math.min(Math.floor(props.score) - 1, 4))])

const color = computed(() => {
  if (props.score >= 4) return 'green'
  if (props.score >= 3) return 'blue'
  if (props.score >= 2) return 'orange'
  return 'red'
})

const levelLabel = computed(() => currentLevel.value?.label || 'Not Assessed')
const levelDescription = computed(() => currentLevel.value?.description || '')
</script>
