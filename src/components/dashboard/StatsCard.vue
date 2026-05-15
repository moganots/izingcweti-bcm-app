<template>
  <q-card
    flat
    bordered
    class="stats-card cursor-pointer"
    :class="[`bg-${color}`, textColorClass]"
    @click="$emit('click')"
  >
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-caption" :class="subtitleColorClass">{{ label }}</div>
          <div class="text-h3 q-mt-sm">{{ formattedValue }}</div>
          <div v-if="trend !== undefined" class="text-caption q-mt-xs" :class="subtitleColorClass">
            <q-icon :name="trendIcon" size="14px" class="q-mr-xs" />
            {{ trendLabel }}
          </div>
        </div>
        <q-icon :name="icon" size="40px" :class="iconColorClass" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number | string
    icon: string
    color?: string
    trend?: number
    trendLabel?: string
    format?: 'number' | 'currency' | 'percentage'
  }>(),
  {
    color: 'primary',
    trend: 0,
    trendLabel: '',
    format: 'number',
  }
)

defineEmits<{ click: [] }>()

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (props.format === 'currency') return `$${props.value.toLocaleString()}`
  if (props.format === 'percentage') return `${props.value}%`
  return props.value.toLocaleString()
})

const trendIcon = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'trending_up' : 'trending_down'
})

const textColorClass = computed(() =>
  props.color === 'white' || props.color === 'yellow' ? 'text-dark' : 'text-white'
)
const subtitleColorClass = computed(() =>
  props.color === 'white' || props.color === 'yellow' ? 'text-grey-7' : 'text-white-70'
)
const iconColorClass = computed(() =>
  props.color === 'white' || props.color === 'yellow' ? 'text-grey-30' : 'text-white-30'
)
</script>

<style lang="scss" scoped>
.stats-card {
  border-radius: 12px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
  }
}
.text-white-70 {
  opacity: 0.7;
}
.text-white-30 {
  opacity: 0.3;
}
.text-grey-30 {
  opacity: 0.3;
}
</style>
