<template>
  <div class="risk-score-gauge text-center">
    <q-circular-progress
      :value="percentage"
      :size="size"
      :color="color"
      track-color="grey-3"
      show-value
      :font-size="fontSize"
      :thickness="thickness"
    >
      <div class="text-weight-bold">{{ displayScore }}</div>
      <div v-if="label" class="text-caption text-grey-6">{{ label }}</div>
    </q-circular-progress>
    <div v-if="showLabel" class="q-mt-sm">
      <q-badge :color="color" :label="levelLabel" class="q-px-md q-py-xs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    score: number
    maxScore?: number
    size?: string
    fontSize?: string
    thickness?: number
    label?: string
    showLabel?: boolean
  }>(),
  {
    maxScore: 10,
    size: '100px',
    fontSize: '20px',
    thickness: 0.2,
    label: '',
    showLabel: true,
  }
)

const percentage = computed(() => Math.min((props.score / props.maxScore) * 100, 100))
const displayScore = computed(() => props.score.toFixed(1))

const color = computed(() => {
  if (props.score >= 8.5) return 'red'
  if (props.score >= 7) return 'orange'
  if (props.score >= 5) return 'yellow'
  if (props.score >= 3) return 'light-green'
  return 'green'
})

const levelLabel = computed(() => {
  if (props.score >= 8.5) return 'Critical'
  if (props.score >= 7) return 'High'
  if (props.score >= 5) return 'Medium'
  if (props.score >= 3) return 'Low'
  return 'Very Low'
})
</script>
