<template>
  <q-page padding>
    <PageHeader
      title="Dashboard Widgets"
      subtitle="Customize your dashboard view"
      show-refresh
      @refresh="loadData"
    />

    <!-- Widget Configuration -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">Active Widgets</div>
        <q-list separator>
          <q-item v-for="widget in widgets" :key="widget.id">
            <q-item-section avatar>
              <q-icon
                :name="widget.icon"
                :color="widget.enabled ? 'primary' : 'grey'"
                size="24px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ widget.title }}</q-item-label>
              <q-item-label caption>{{ widget.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="widget.enabled"
                color="primary"
                @update:model-value="toggleWidget(widget.id, $event)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Widget Preview -->
    <div class="row q-col-gutter-md">
      <template v-for="widget in enabledWidgets" :key="widget.id">
        <div :class="widget.size === 'full' ? 'col-12' : 'col-12 col-md-6'">
          <component :is="widget.component" v-bind="widget.props" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../../components/.common/PageHeader.vue'
import KpiOverview from '../../components/dashboard/KpiOverview.vue'
import RiskHeatMap from '../../components/dashboard/RiskHeatMap.vue'
import ComplianceChart from '../../components/dashboard/ComplianceChart.vue'
import IncidentTrendChart from '../../components/dashboard/IncidentTrendChart.vue'
import MaturityGauge from '../../components/dashboard/MaturityGauge.vue'
import PendingWorkflowsWidget from '../../components/dashboard/PendingWorkflowsWidget.vue'
import RecentActivityList from '../../components/dashboard/RecentActivityList.vue'

interface Widget {
  id: string
  title: string
  description: string
  icon: string
  enabled: boolean
  size: 'half' | 'full'
  component: any
  props?: Record<string, any>
}

const widgets = ref<Widget[]>([
  {
    id: 'kpis',
    title: 'KPI Overview',
    description: 'Key performance indicators at a glance',
    icon: 'dashboard',
    enabled: true,
    size: 'full',
    component: KpiOverview,
  },
  {
    id: 'risk-heatmap',
    title: 'Risk Heat Map',
    description: 'Visual representation of risk distribution',
    icon: 'grid_view',
    enabled: true,
    size: 'half',
    component: RiskHeatMap,
  },
  {
    id: 'compliance',
    title: 'Compliance Status',
    description: 'Compliance standards overview',
    icon: 'verified',
    enabled: true,
    size: 'half',
    component: ComplianceChart,
  },
  {
    id: 'incident-trends',
    title: 'Incident Trends',
    description: 'Incident frequency and severity trends',
    icon: 'trending_up',
    enabled: true,
    size: 'half',
    component: IncidentTrendChart,
  },
  {
    id: 'maturity',
    title: 'BCM Maturity',
    description: 'Maturity level assessment',
    icon: 'stars',
    enabled: true,
    size: 'half',
    component: MaturityGauge,
  },
  {
    id: 'pending-workflows',
    title: 'Pending Workflows',
    description: 'Workflows awaiting action',
    icon: 'account_tree',
    enabled: true,
    size: 'half',
    component: PendingWorkflowsWidget,
  },
  {
    id: 'recent-incidents',
    title: 'Recent Incidents',
    description: 'Latest reported incidents',
    icon: 'report',
    enabled: true,
    size: 'half',
    component: RecentActivityList,
    props: { title: 'Recent Incidents', type: 'incident' },
  },
])

const enabledWidgets = computed(() => widgets.value.filter((w) => w.enabled))

function toggleWidget(id: string, enabled: boolean): void {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.enabled = enabled
    // Save preference
    localStorage.setItem(`widget_${id}`, String(enabled))
  }
}

function loadData(): void {
  // Refresh all widget data
  console.log('Refreshing widgets...')
}
</script>
