<template>
  <div class="kpi-overview">
    <div class="row q-col-gutter-md">
      <div class="col-6 col-md-3" v-for="kpi in kpis" :key="kpi.label">
        <q-card
          flat
          bordered
          class="kpi-card cursor-pointer"
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
                  :class="kpi.trend >= 0 ? 'text-green' : 'text-red'"
                >
                  <q-icon
                    :name="kpi.trend >= 0 ? 'trending_up' : 'trending_down'"
                    size="14px"
                    class="q-mr-xs"
                  />
                  {{ Math.abs(kpi.trend) }}%
                </div>
              </div>
              <q-icon :name="kpi.icon" size="36px" :color="kpi.color" class="text-grey-30" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface KPI {
  label: string
  value: number
  icon: string
  color: string
  format?: 'number' | 'currency' | 'percentage'
  trend?: number
  action?: string
}

const props = withDefaults(defineProps<{ kpis?: KPI[]; loading?: boolean }>(), {
  kpis: () => [],
  loading: false,
})

const kpis = computed(() =>
  props.kpis.map((kpi) => ({
    ...kpi,
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
  transition: transform 0.2s;
}
.kpi-card:hover {
  transform: translateY(-2px);
}
.text-grey-30 {
  opacity: 0.3;
}
</style>
