<template>
  <q-card flat bordered class="bia-summary">
    <q-card-section>
      <div class="text-h6 q-mb-md">Business Impact Analysis Summary</div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
          <div class="text-center">
            <q-circular-progress
              :value="stat.value"
              size="70px"
              :color="stat.color"
              track-color="grey-3"
              show-value
              font-size="14px"
            >
              {{ stat.displayValue }}
            </q-circular-progress>
            <div class="text-caption text-grey-7 q-mt-sm">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <div class="text-caption text-grey-6">Financial Impact (per day)</div>
          <div class="text-h6 text-primary">{{ formatCurrency(financialImpact) }}</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Reputational Impact</div>
          <q-badge
            :color="getImpactColor(reputationalImpact)"
            :label="reputationalImpact"
            class="q-px-md q-py-xs q-mt-sm"
          />
        </div>
      </div>

      <div class="q-mt-md">
        <div class="text-caption text-grey-6 q-mb-xs">Operational Impact</div>
        <p class="text-body2 q-mb-none">{{ truncateText(operationalImpact, 120) }}</p>
      </div>

      <div class="q-mt-md">
        <div class="text-caption text-grey-6 q-mb-xs">Regulatory Impact</div>
        <p class="text-body2 q-mb-none">{{ truncateText(regulatoryImpact, 120) }}</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    financialImpact?: number
    reputationalImpact?: string
    operationalImpact?: string
    regulatoryImpact?: string
    assessedDate?: string
  }>(),
  {
    financialImpact: 0,
    reputationalImpact: 'Low',
    operationalImpact: '',
    regulatoryImpact: '',
    assessedDate: '',
  }
)

const stats = computed(() => [
  {
    label: 'Financial',
    value: Math.min((props.financialImpact || 0) / 10000, 100),
    displayValue: formatCurrency(props.financialImpact),
    color: 'primary',
  },
  {
    label: 'Operational',
    value: props.operationalImpact ? 75 : 25,
    displayValue: props.operationalImpact ? 'High' : 'Low',
    color: props.operationalImpact ? 'orange' : 'green',
  },
  {
    label: 'Regulatory',
    value: props.regulatoryImpact ? 75 : 25,
    displayValue: props.regulatoryImpact ? 'High' : 'Low',
    color: props.regulatoryImpact ? 'orange' : 'green',
  },
  {
    label: 'Reputational',
    value: getImpactValue(props.reputationalImpact),
    displayValue: props.reputationalImpact,
    color: getImpactColor(props.reputationalImpact),
  },
])

function getImpactColor(impact?: string): string {
  const colors: Record<string, string> = { Low: 'green', Med: 'orange', High: 'red' }
  return colors[impact || 'Low'] || 'grey'
}

function getImpactValue(impact?: string): number {
  const values: Record<string, number> = { Low: 33, Med: 66, High: 100 }
  return values[impact || 'Low'] || 0
}

function truncateText(text: string, max: number): string {
  if (!text) return 'N/A'
  return text.length > max ? text.substring(0, max) + '...' : text
}
</script>
