<template>
  <q-card class="risk-card cursor-pointer" flat bordered @click="$emit('click', risk)">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getCategoryColor(risk.risk_category)"
          :label="risk.risk_category"
          class="q-px-sm q-py-xs"
        />
        <q-btn flat round size="sm" icon="more_vert" @click.stop>
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="$emit('edit', risk)">
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('reassess', risk)">
                <q-item-section avatar><q-icon name="refresh" /></q-item-section>
                <q-item-section>Reassess</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('add-controls', risk)">
                <q-item-section avatar><q-icon name="shield" /></q-item-section>
                <q-item-section>Add Controls</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', risk)">
                <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- Risk Scores -->
      <div class="row q-col-gutter-sm q-mb-md text-center">
        <div class="col-6">
          <q-circular-progress
            :value="risk.inherent_risk_score * 10"
            size="60px"
            :color="getScoreColor(risk.inherent_risk_score)"
            track-color="grey-3"
            show-value
            font-size="14px"
          >
            {{ risk.inherent_risk_score }}
          </q-circular-progress>
          <div class="text-caption text-grey-7 q-mt-xs">Inherent Risk</div>
        </div>
        <div class="col-6">
          <q-circular-progress
            :value="risk.residual_risk_score * 10"
            size="60px"
            :color="getScoreColor(risk.residual_risk_score)"
            track-color="grey-3"
            show-value
            font-size="14px"
          >
            {{ risk.residual_risk_score }}
          </q-circular-progress>
          <div class="text-caption text-grey-7 q-mt-xs">Residual Risk</div>
        </div>
      </div>

      <q-separator class="q-mb-sm" />

      <!-- Details -->
      <div class="row q-col-gutter-sm text-center">
        <div class="col-6">
          <div class="text-caption text-grey-6">Likelihood</div>
          <div class="text-body2 text-weight-bold">
            {{ formatPercentage(risk.likelihood * 100) }}
          </div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Impact</div>
          <div class="text-body2 text-weight-bold">{{ risk.impact_severity }}</div>
        </div>
      </div>

      <!-- Mitigation Controls -->
      <div class="q-mt-sm">
        <q-badge
          v-if="hasControls"
          outline
          color="info"
          :label="controlCount + ' control' + (controlCount !== 1 ? 's' : '')"
        />
        <q-badge v-else outline color="negative" label="No controls" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatPercentage } from '../../utils/formatters'

const props = defineProps<{ risk: any }>()

defineEmits<{
  click: [risk: any]
  edit: [risk: any]
  reassess: [risk: any]
  'add-controls': [risk: any]
  delete: [risk: any]
}>()

const hasControls = computed(
  () =>
    Array.isArray(props.risk.mitigation_control_ids) && props.risk.mitigation_control_ids.length > 0
)
const controlCount = computed(() => props.risk.mitigation_control_ids?.length || 0)

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Financial: 'blue',
    Operational: 'orange',
    Compliance_and_Legal: 'purple',
    Reputational: 'red',
    People_and_Safety: 'green',
    Assets_and_IT: 'teal',
    Cyber: 'deep-orange',
    Natural: 'brown',
    Human: 'pink',
    Supply: 'indigo',
  }
  return colors[category] || 'grey'
}

function getScoreColor(score: number): string {
  if (score >= 8.5) return 'red'
  if (score >= 7) return 'orange'
  if (score >= 5) return 'yellow'
  if (score >= 3) return 'light-green'
  return 'green'
}
</script>

<style lang="scss" scoped>
.risk-card {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
