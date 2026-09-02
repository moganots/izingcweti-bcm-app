<template>
  <div class="bcm-dashboard">
    <!-- Stats Overview -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-sm-4 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <q-icon :name="stat.icon" :color="stat.color" size="28px" class="q-mb-sm" />
            <div class="text-h4" :class="'text-' + stat.color">{{ stat.value }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <BCPProgressChart :data="chartData" />
      </div>
      <div class="col-12 col-md-6">
        <MaturityGauge :maturity="maturityLevel" />
      </div>
    </div>

    <!-- Compliance Status -->
    <div class="q-mb-lg">
      <ComplianceStatusChart :data="complianceData" />
    </div>

    <!-- Recent Activity -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">Recent Activity</div>
        <AuditTimeline :entries="recentActivities" :loading="activitiesLoading" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BCPProgressChart from './BCPProgressChart.vue'
import MaturityGauge from './MaturityGauge.vue'
import ComplianceStatusChart from './ComplianceStatusChart.vue'
import AuditTimeline from '../audit/AuditTimeline.vue'

const props = withDefaults(
  defineProps<{
    statsData?: {
      totalFunctions: number
      totalBCPs: number
      totalTests: number
      complianceRate: number
    }
    chartData?: any
    maturityLevel?: number
    complianceData?: any[]
    recentActivities?: any[]
    activitiesLoading?: boolean
  }>(),
  {
    statsData: () => ({
      totalFunctions: 0,
      totalBCPs: 0,
      totalTests: 0,
      complianceRate: 0,
    }),
    chartData: null,
    maturityLevel: 0,
    complianceData: () => [],
    recentActivities: () => [],
    activitiesLoading: false,
  }
)

const stats = computed(() => [
  {
    label: 'Critical Functions',
    value: props.statsData.totalFunctions,
    color: 'primary',
    icon: 'functions',
  },
  {
    label: 'BCPs Created',
    value: props.statsData.totalBCPs,
    color: 'green',
    icon: 'description',
  },
  {
    label: 'Exercise Tests',
    value: props.statsData.totalTests,
    color: 'orange',
    icon: 'playlist_add_check',
  },
  {
    label: 'Compliance Rate',
    value: props.statsData.complianceRate + '%',
    color: 'purple',
    icon: 'verified',
  },
])
</script>