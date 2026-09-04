<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Governance Health</div>

      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else-if="!data" class="text-center q-py-lg text-grey-7">
        <q-icon name="health_and_safety" size="48px" color="grey-4" class="q-mb-sm" />
        <div>No health data available</div>
      </div>

      <div v-else>
        <!-- Health Status -->
        <div class="row items-center q-gutter-md q-mb-md">
          <div class="health-indicator" :class="data.overallHealth">
            {{ healthLabel }}
          </div>
          <div class="text-caption text-grey-7">
            {{ healthDescription }}
          </div>
        </div>

        <!-- Health Metrics -->
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <div class="metric-card">
              <div class="metric-value" :class="getMetricColor(data.complianceRate, 70, 50)">
                {{ Math.round(data.complianceRate) }}%
              </div>
              <div class="metric-label">Compliance Rate</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="metric-card">
              <div class="metric-value" :class="getMetricColor(data.policyCoverage, 80, 60)">
                {{ Math.round(data.policyCoverage) }}%
              </div>
              <div class="metric-label">Policy Coverage</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="metric-card">
              <div class="metric-value" :class="getMetricColor(data.maturityScore, 60, 40)">
                {{ Math.round(data.maturityScore) }}
              </div>
              <div class="metric-label">Maturity Score</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="metric-card">
              <div class="metric-value" :class="getMetricColor(100 - data.issuesCount, 20, 10)">
                {{ data.issuesCount }}
              </div>
              <div class="metric-label">Issues</div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="recommendations.length > 0" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Recommendations</div>
          <q-list bordered separator dense>
            <q-item v-for="(rec, index) in recommendations" :key="index">
              <q-item-section avatar>
                <q-icon :name="rec.icon" :color="rec.color" size="20px" />
              </q-item-section>
              <q-item-section>
                {{ rec.text }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GovernanceHealth } from 'src/models/entities/governance/governance.entity'

// ============================================
// Props
// ============================================
const props = defineProps<{
  data: GovernanceHealth | null
  loading?: boolean
}>()

// ============================================
// Computed
// ============================================
const healthLabel = computed(() => {
  if (!props.data) return 'Unknown'
  const labels: Record<string, string> = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
  }
  return labels[props.data.overallHealth] || props.data.overallHealth
})

const healthDescription = computed(() => {
  if (!props.data) return ''
  const descriptions: Record<string, string> = {
    healthy: 'All governance metrics are within acceptable ranges',
    warning: 'Some governance metrics require attention',
    critical: 'Immediate action required to address governance issues',
  }
  return descriptions[props.data.overallHealth] || ''
})

const recommendations = computed(() => {
  if (!props.data) return []

  const recs = []

  if (props.data.complianceRate < 70) {
    recs.push({
      icon: 'gavel',
      color: 'orange',
      text: 'Improve compliance rate by reviewing and updating policies',
    })
  }

  if (props.data.policyCoverage < 80) {
    recs.push({
      icon: 'description',
      color: 'blue',
      text: 'Increase policy coverage by creating policies for missing areas',
    })
  }

  if (props.data.maturityScore < 50) {
    recs.push({
      icon: 'trending_up',
      color: 'purple',
      text: 'Conduct maturity assessment to identify improvement areas',
    })
  }

  if (props.data.issuesCount > 5) {
    recs.push({
      icon: 'warning',
      color: 'red',
      text: `Address ${props.data.issuesCount} outstanding issues to improve governance health`,
    })
  }

  if (recs.length === 0) {
    recs.push({
      icon: 'check_circle',
      color: 'green',
      text: 'All governance metrics are in good standing. Continue monitoring.',
    })
  }

  return recs
})

// ============================================
// Methods
// ============================================
function getMetricColor(value: number, goodThreshold: number, warningThreshold: number): string {
  if (value >= goodThreshold) return 'text-positive'
  if (value >= warningThreshold) return 'text-warning'
  return 'text-negative'
}
</script>

<style lang="scss" scoped>
.health-indicator {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;

  &.healthy {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.warning {
    background: #fff3e0;
    color: #e65100;
  }

  &.critical {
    background: #fce4ec;
    color: #c62828;
  }
}

.metric-card {
  text-align: center;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .metric-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  @media (max-width: 400px) {
    padding: 8px;

    .metric-value {
      font-size: 1.25rem;
    }

    .metric-label {
      font-size: 0.65rem;
    }
  }
}

.text-positive {
  color: #2e7d32;
}
.text-warning {
  color: #e65100;
}
.text-negative {
  color: #c62828;
}
</style>