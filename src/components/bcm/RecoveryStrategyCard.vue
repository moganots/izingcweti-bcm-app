<template>
  <q-card class="strategy-card" flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getTypeColor(strategy.recovery_strategy_type)"
          :label="strategy.recovery_strategy_type"
          class="q-px-sm q-py-xs"
        />
        <q-btn flat round size="sm" icon="more_vert" @click.stop>
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="$emit('edit', strategy)">
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', strategy)">
                <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="text-h6 q-mb-xs">
        {{ strategy.business_continuity_plan?.critical_function?.name }}
      </div>

      <q-separator class="q-mb-sm" />

      <div class="row q-col-gutter-sm text-center q-mb-md">
        <div class="col-6">
          <div class="text-caption text-grey-6">Est. Recovery Cost</div>
          <div class="text-body2 text-weight-bold text-primary">
            {{ estimatedCost }}
          </div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Test Success Rate</div>
          <div
            class="text-body2 text-weight-bold"
            :class="roundedRate >= 80 ? 'text-green' : 'text-orange'"
          >
            {{ roundedRate }}%
          </div>
        </div>
      </div>

      <div class="q-mb-sm">
        <div class="text-caption text-grey-6 q-mb-xs">Success Rate</div>
        <q-linear-progress
          :value="roundedRate / 100"
          :color="roundedRate >= 80 ? 'green' : roundedRate >= 50 ? 'orange' : 'red'"
          size="15px"
          rounded
        >
          <div class="absolute-full flex flex-center">
            <q-badge :label="roundedRate + '%'" color="white" text-color="black" />
          </div>
        </q-linear-progress>
      </div>

      <div v-if="strategy.resource_requirements" class="q-mt-sm">
        <div class="text-caption text-grey-6 q-mb-xs">Resource Requirements</div>
        <div class="row q-gutter-xs">
          <q-badge
            v-for="(value, key) in strategy.resource_requirements"
            :key="key"
            outline
            color="primary"
            :label="`${key}: ${value}`"
            class="q-px-sm"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useLocaleStore } from 'src/stores/locale.store'
import { round, getValidPercentage } from '../../utils/number.utils'

const props = defineProps<{ strategy: any }>()
defineEmits<{ edit: [strategy: any]; delete: [strategy: any] }>()

const useLocale = useLocaleStore()

const estimatedCost = useLocale.formatCurrency(props.strategy.estimated_recovery_cost)
const successRate = getValidPercentage(props.strategy.test_success_rate, 0)
const roundedRate = round(successRate, 0)

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    HotSite: 'red',
    ColdSite: 'blue',
    CloudFailover: 'purple',
    ManualWorkaround: 'orange',
  }
  return colors[type] || 'grey'
}
</script>
