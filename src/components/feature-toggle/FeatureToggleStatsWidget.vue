<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Feature Toggle Statistics</div>
        <q-btn flat round dense icon="refresh" size="sm" @click="$emit('refresh')">
          <q-tooltip>Refresh Stats</q-tooltip>
        </q-btn>
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
          <q-card flat bordered :class="'bg-' + stat.color + '-1'">
            <q-card-section class="text-center q-py-sm">
              <q-icon :name="stat.icon" :color="stat.color" size="20px" class="q-mb-xs" />
              <div class="text-h6" :class="'text-' + stat.color">{{ stat.value }}</div>
              <div class="text-caption text-grey-7">{{ stat.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- By Status -->
      <div class="q-mt-md">
        <div class="text-body2 q-mb-sm">By Status</div>
        <div class="row q-gutter-xs">
          <div v-for="(count, status) in byStatus" :key="status" class="col">
            <q-badge
              :color="getStatusColor(status)"
              :label="formatStatus(status)"
              class="full-width text-center q-py-sm"
            >
              <div class="text-h6">{{ count }}</div>
            </q-badge>
          </div>
        </div>
      </div>

      <!-- By Environment -->
      <div class="q-mt-md">
        <div class="text-body2 q-mb-sm">By Environment</div>
        <div v-for="(count, env) in byEnvironment" :key="env" class="q-mb-xs">
          <div class="row items-center justify-between">
            <span class="text-caption">{{ formatEnvironment(env) }}</span>
            <span class="text-caption text-grey-7">{{ count }}</span>
          </div>
          <q-linear-progress
            :value="Math.min(count / maxEnvCount, 1)"
            :color="getEnvironmentColor(env)"
            size="8px"
            rounded
          />
        </div>
      </div>

      <!-- By Type -->
      <div class="q-mt-md">
        <div class="text-body2 q-mb-sm">By Type</div>
        <div v-for="(count, type) in byType" :key="type" class="q-mb-xs">
          <div class="row items-center justify-between">
            <span class="text-caption">{{ formatType(type) }}</span>
            <span class="text-caption text-grey-7">{{ count }}</span>
          </div>
          <q-linear-progress
            :value="Math.min(count / maxTypeCount, 1)"
            :color="getTypeColor(type)"
            size="8px"
            rounded
          />
        </div>
      </div>

      <!-- Evaluation Stats -->
      <div class="q-mt-md">
        <div class="text-body2 q-mb-sm">Evaluation Performance</div>
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <div class="text-center">
              <div class="text-h6">{{ evaluationStats.totalEvaluations || 0 }}</div>
              <div class="text-caption text-grey-7">Total Evaluations</div>
            </div>
          </div>
          <div class="col-4">
            <div class="text-center">
              <div class="text-h6">{{ evaluationStats.trueEvaluations || 0 }}</div>
              <div class="text-caption text-grey-7">True Evaluations</div>
            </div>
          </div>
          <div class="col-4">
            <div class="text-center">
              <div class="text-h6">{{ evaluationStats.averageTrueRate || 0 }}%</div>
              <div class="text-caption text-grey-7">True Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-caption text-grey-7 text-center q-mt-sm">
        Last updated: {{ lastUpdatedText }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'
import {
  getFeatureToggleStatusLabel,
  getFeatureToggleStatusColor,
  getToggleEnvironmentLabel,
  getToggleEnvironmentColor,
  getFeatureToggleTypeLabel,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

const props = withDefaults(
  defineProps<{
    stats?: {
      total: number
      byStatus: Record<string, number>
      byEnvironment: Record<string, number>
      byType: Record<string, number>
      evaluationStats: {
        totalEvaluations: number
        trueEvaluations: number
        averageTrueRate: number
      }
    }
    lastUpdated?: string | null
  }>(),
  {
    stats: () => ({
      total: 0,
      byStatus: {},
      byEnvironment: {},
      byType: {},
      evaluationStats: {
        totalEvaluations: 0,
        trueEvaluations: 0,
        averageTrueRate: 0,
      },
    }),
    lastUpdated: null,
  }
)

defineEmits<{ refresh: [] }>()

const stats = computed(() => [
  { label: 'Total', value: props.stats.total, icon: 'toggle_on', color: 'primary' },
  {
    label: 'Active',
    value: props.stats.byStatus?.ACTIVE || 0,
    icon: 'check_circle',
    color: 'green',
  },
  {
    label: 'Scheduled',
    value: props.stats.byStatus?.SCHEDULED || 0,
    icon: 'event',
    color: 'info',
  },
  {
    label: 'Inactive',
    value: props.stats.byStatus?.INACTIVE || 0,
    icon: 'pause_circle',
    color: 'orange',
  },
])

const byStatus = computed(() => props.stats.byStatus || {})
const byEnvironment = computed(() => props.stats.byEnvironment || {})
const byType = computed(() => props.stats.byType || {})
const evaluationStats = computed(() => props.stats.evaluationStats || {
  totalEvaluations: 0,
  trueEvaluations: 0,
  averageTrueRate: 0,
})

const maxEnvCount = computed(() => {
  const values = Object.values(byEnvironment.value)
  return values.length > 0 ? Math.max(...values) : 1
})

const maxTypeCount = computed(() => {
  const values = Object.values(byType.value)
  return values.length > 0 ? Math.max(...values) : 1
})

const lastUpdatedText = computed(() => {
  if (!props.lastUpdated) return 'Never'
  return formatTimeAgo(props.lastUpdated)
})

function formatStatus(status: string): string {
  return getFeatureToggleStatusLabel(status)
}

function getStatusColor(status: string): string {
  return getFeatureToggleStatusColor(status)
}

function formatEnvironment(env: string): string {
  return getToggleEnvironmentLabel(env)
}

function getEnvironmentColor(env: string): string {
  return getToggleEnvironmentColor(env)
}

function formatType(type: string): string {
  return getFeatureToggleTypeLabel(type)
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    RELEASE: 'green',
    EXPERIMENT: 'purple',
    OPERATIONAL: 'blue',
    PERMISSION: 'orange',
    KILL_SWITCH: 'red',
  }
  return colors[type] || 'grey'
}
</script>