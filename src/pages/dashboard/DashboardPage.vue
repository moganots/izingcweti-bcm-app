<template>
  <div class="dashboard-page">
    <div class="q-mb-md">
      <div class="text-h4">Welcome back, {{ authStore.fullName }}</div>
      <div class="text-subtitle1 text-grey-7">
        Here's what's happening with your BCM program today
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-list bordered separator class="rounded-borders">
          <q-item-label header>Quick Actions</q-item-label>
          <div class="row q-pa-md">
            <div class="col-6 col-sm-3 q-pa-sm">
              <q-btn
                outline
                color="primary"
                icon="add"
                label="New Risk"
                class="full-width"
                @click="openRiskDialog"
              />
            </div>
            <div class="col-6 col-sm-3 q-pa-sm">
              <q-btn
                outline
                color="primary"
                icon="add"
                label="BCP Plan"
                class="full-width"
                @click="openBCPDialog"
              />
            </div>
            <div class="col-6 col-sm-3 q-pa-sm">
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Report Incident"
                class="full-width"
                @click="openIncidentDialog"
              />
            </div>
            <div class="col-6 col-sm-3 q-pa-sm">
              <q-btn
                outline
                color="primary"
                icon="picture_as_pdf"
                label="Generate Report"
                class="full-width"
                @click="openReportDialog"
              />
            </div>
          </div>
        </q-list>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Recent Risks</div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="risk in recentRisks" :key="risk.id" clickable>
              <q-item-section avatar>
                <q-icon name="warning" :color="riskLevelColor(risk.level)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ risk.title }}</q-item-label>
                <q-item-label caption
                  >{{ risk.category }} • Updated {{ risk.updatedAt }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-badge :color="riskLevelColor(risk.level)" :label="risk.level" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="View All Risks" :to="{ name: 'Risks' }" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Upcoming Training</div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="training in upcomingTraining" :key="training.id" clickable>
              <q-item-section avatar>
                <q-icon name="school" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ training.title }}</q-item-label>
                <q-item-label caption
                  >{{ training.dueDate }} • {{ training.duration }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-progress :percentage="training.progress" size="40px" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="View All Training" :to="{ name: 'Training' }" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth/auth.store'

const $q = useQuasar()
const authStore = useAuthStore()

const recentRisks = ref([
  {
    id: 1,
    title: 'Data Breach Risk',
    category: 'Cybersecurity',
    level: 'High',
    updatedAt: '2h ago',
  },
  {
    id: 2,
    title: 'Supply Chain Disruption',
    category: 'Operational',
    level: 'Medium',
    updatedAt: '1d ago',
  },
  {
    id: 3,
    title: 'Regulatory Compliance',
    category: 'Compliance',
    level: 'Low',
    updatedAt: '3d ago',
  },
])

const upcomingTraining = ref([
  { id: 1, title: 'BCM Fundamentals', dueDate: 'Due in 2 days', duration: '2 hours', progress: 0 },
  {
    id: 2,
    title: 'Risk Assessment Workshop',
    dueDate: 'Due in 5 days',
    duration: '4 hours',
    progress: 30,
  },
  {
    id: 3,
    title: 'Incident Response Planning',
    dueDate: 'Due in 10 days',
    duration: '3 hours',
    progress: 60,
  },
])

function riskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    High: 'red',
    Medium: 'orange',
    Low: 'green',
  }
  return colors[level] || 'grey'
}

function openRiskDialog() {
  $q.notify({ message: 'New Risk dialog would open here' })
}

function openBCPDialog() {
  $q.notify({ message: 'New BCP Plan dialog would open here' })
}

function openIncidentDialog() {
  $q.notify({ message: 'Report Incident dialog would open here' })
}

function openReportDialog() {
  $q.notify({ message: 'Generate Report dialog would open here' })
}

onMounted(() => {
  // Fetch dashboard data
})
</script>
