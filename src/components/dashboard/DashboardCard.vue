<template>
  <q-card flat bordered class="dashboard-card" :class="`bg-${color}`">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-caption text-uppercase text-grey-7">{{ title }}</div>
          <div class="text-h3 q-mt-sm text-weight-bold">
            <q-spinner-dots
              v-if="loading"
              size="20px"
              :color="color === 'white' ? 'primary' : 'white'"
            />
            <template v-else>
              {{ formattedValue }}<span v-if="suffix" class="text-subtitle1">{{ suffix }}</span>
            </template>
          </div>
          <div v-if="trend" class="text-caption q-mt-xs" :class="trendColor">
            <q-icon :name="trendIcon" size="14px" class="q-mr-xs" />
            {{ trend }}
          </div>
        </div>
        <div class="col-auto">
          <q-icon :name="icon" size="48px" :color="iconColor" class="dashboard-card-icon" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: number | string
    icon: string
    color?: string
    suffix?: string
    trend?: string
    loading?: boolean
  }>(),
  {
    color: 'primary',
    suffix: '',
    trend: '',
    loading: false,
  }
)

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (props.value >= 1000000) return `${(props.value / 1000000).toFixed(1)}M`
  if (props.value >= 1000) return `${(props.value / 1000).toFixed(1)}K`
  return props.value.toLocaleString()
})

const trendColor = computed(() => {
  if (!props.trend) return ''
  return props.trend.includes('+') ? 'text-positive' : 'text-negative'
})

const trendIcon = computed(() => {
  if (!props.trend) return ''
  return props.trend.includes('+') ? 'trending_up' : 'trending_down'
})

const iconColor = computed(() => {
  if (props.color === 'white') return 'primary'
  return 'white'
})
</script>

<style lang="scss" scoped>
.dashboard-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }

  .dashboard-card-icon {
    opacity: 0.3;
    transition: opacity 0.2s ease;
  }

  &:hover .dashboard-card-icon {
    opacity: 0.5;
  }
}
</style>
