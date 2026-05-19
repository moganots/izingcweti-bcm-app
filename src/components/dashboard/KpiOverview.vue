<template>
  <div class="kpi-overview">
    <div class="row q-col-gutter-md">
      <div class="col-6 col-sm-4 col-md-3" v-for="kpi in computedKpis" :key="kpi.label">
        <q-card
          flat
          bordered
          class="kpi-card"
          :class="{ 'cursor-pointer': kpi.action }"
          @click="kpi.action ? $router.push(kpi.action) : null"
        >
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-caption text-grey-7">{{ kpi.label }}</div>
                <div class="text-h3 q-mt-sm" :class="`text-${kpi.color}`">
                  <q-spinner-dots v-if="loading" size="20px" :color="kpi.color" />
                  <template v-else>{{ kpi.formattedValue }}</template>
                </div>
                <div
                  v-if="kpi.trend !== undefined"
                  class="text-caption q-mt-xs"
                  :class="kpi.trend >= 0 ? 'text-positive' : 'text-negative'"
                >
                  <q-icon
                    :name="kpi.trend >= 0 ? 'trending_up' : 'trending_down'"
                    size="14px"
                    class="q-mr-xs"
                  />
                  {{ Math.abs(kpi.trend) }}%
                </div>
              </div>
              <div class="col-auto">
                <q-icon :name="kpi.icon" size="36px" :color="kpi.color" class="kpi-icon" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

export interface KPI {
  label: string
  value: number
  icon: string
  color?: string
  format?: 'number' | 'currency' | 'percentage'
  trend?: number
  action?: string
}

const props = withDefaults(
  defineProps<{
    kpis?: KPI[]
    loading?: boolean
  }>(),
  {
    kpis: () => [],
    loading: false,
  }
)

const computedKpis = computed(() =>
  props.kpis.map((kpi) => ({
    ...kpi,
    color: kpi.color || 'primary',
    formattedValue: formatValue(kpi.value, kpi.format),
  }))
)

function formatValue(value: number, format?: string): string {
  if (format === 'currency') return `$${value.toLocaleString()}`
  if (format === 'percentage') return `${value}%`
  return value.toLocaleString()
}
</script>

<style lang="scss" scoped>
.kpi-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .kpi-icon {
    opacity: 0.3;
  }
}
</style>
