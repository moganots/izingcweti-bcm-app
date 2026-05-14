<!-- src/pages/incident/IncidentListPage.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Incident Management</h4>
          <p class="text-grey-7 q-mb-none">Track and manage incidents</p>
        </div>
        <q-btn
          color="negative"
          icon="add"
          label="Report Incident"
          unelevated
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-4 col-md-2" v-for="stat in incidentStats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
            <div class="text-h4" :class="'text-' + stat.color">{{ stat.count }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.search"
              outlined
              dense
              placeholder="Search..."
              clearable
              @update:model-value="loadIncidents"
            >
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.severity"
              outlined
              dense
              :options="severityOptions"
              label="Severity"
              clearable
              @update:model-value="loadIncidents"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              outlined
              dense
              :options="statusFilterOptions"
              label="Status"
              clearable
              @update:model-value="loadIncidents"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.sortBy"
              outlined
              dense
              :options="sortOptions"
              label="Sort"
              emit-value
              map-options
              @update:model-value="loadIncidents"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <EmptyState
      v-else-if="incidents.length === 0"
      icon="report"
      title="No Incidents"
      description="No incidents reported yet."
      :action="{ label: 'Report Incident', handler: () => (showCreateDialog = true) }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="incident in incidents" :key="incident.uuid" class="col-12 col-md-6">
        <q-card
          class="incident-card cursor-pointer"
          flat
          bordered
          :class="'border-left-' + getSeverityColor(incident.incident_severity)"
          @click="$router.push(`/incidents/${incident.uuid}`)"
        >
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getSeverityColor(incident.incident_severity)"
                :label="incident.incident_severity"
                class="q-px-sm q-py-xs"
              />
              <span class="text-caption text-grey-7">{{ formatDate(incident.declared_at) }}</span>
            </div>

            <div class="text-h6 q-mb-xs">{{ incident.root_cause }}</div>
            <div class="text-grey-7 text-body2 q-mb-md">
              Recovery Time: {{ incident.recovery_actual_time || 'In Progress' }}
            </div>

            <q-separator class="q-mb-sm" />

            <div class="row items-center justify-between">
              <q-badge
                :color="incident.closed_at ? 'green' : 'orange'"
                :label="incident.closed_at ? 'Closed' : 'Active'"
              />
              <q-btn
                v-if="!incident.closed_at"
                flat
                color="green"
                icon="check"
                label="Close"
                size="sm"
                @click.stop="closeIncident(incident)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Report New Incident</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveIncident" class="q-gutter-md">
            <q-select
              v-model="form.severity"
              :options="severityOptions"
              label="Severity"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="form.root_cause"
              label="Root Cause"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-select
              v-model="form.bcp_id"
              :options="bcpOptions"
              label="Activated BCP"
              outlined
              dense
              emit-value
              map-options
            />
            <q-input
              v-model="form.recovery_time"
              label="Recovery Actual Time"
              outlined
              dense
              placeholder="e.g., 3 hours"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            color="negative"
            label="Report Incident"
            :loading="isSaving"
            @click="saveIncident"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { IncidentService } from '../../services/api/IncidentService'
import { BcmService } from '../../services/api/BcmService'
import EmptyState from '../../components/common/EmptyState.vue'
import { formatDate } from '../../utils/formatters'

const $q = useQuasar()

const incidents = ref<any[]>([])
const bcps = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showCreateDialog = ref(false)

const filters = reactive({
  search: '',
  severity: null,
  status: null,
  sortBy: 'declared_at',
})

const form = reactive({
  severity: '',
  root_cause: '',
  bcp_id: '',
  recovery_time: '',
})

const severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Informational']
const statusFilterOptions = ['Active', 'Closed']
const sortOptions = [
  { label: 'Date Declared', value: 'declared_at' },
  { label: 'Severity', value: 'incident_severity' },
  { label: 'Status', value: 'closed_at' },
]

const incidentStats = computed(() => [
  { label: 'Total', color: 'primary', count: incidents.value.length },
  {
    label: 'Critical',
    color: 'red',
    count: incidents.value.filter((i) => i.incident_severity === 'Critical' && !i.closed_at).length,
  },
  { label: 'Active', color: 'orange', count: incidents.value.filter((i) => !i.closed_at).length },
  { label: 'Closed', color: 'green', count: incidents.value.filter((i) => i.closed_at).length },
])

const bcpOptions = computed(() =>
  bcps.value.map((b: any) => ({ label: b.critical_function?.name || 'Unknown', value: b.uuid }))
)
const requiredRule = (val: any) => !!val || 'Required'

onMounted(async () => {
  await Promise.all([loadIncidents(), loadBCPs()])
})

async function loadIncidents(): Promise<void> {
  isLoading.value = true
  try {
    const response = await IncidentService.getIncidents(filters)
    incidents.value = response.data || []
  } catch (error) {
    console.error('Failed to load incidents:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadBCPs(): Promise<void> {
  try {
    const response = await BcmService.getBCPs()
    bcps.value = response.data || []
  } catch (error) {
    console.error('Failed to load BCPs:', error)
  }
}

async function saveIncident(): Promise<void> {
  isSaving.value = true
  try {
    await IncidentService.createIncident({
      incident_severity: form.severity,
      root_cause: form.root_cause,
      business_continuity_plan_id_activated: form.bcp_id,
      recovery_actual_time: form.recovery_time,
    })
    $q.notify({ type: 'positive', message: 'Incident reported' })
    showCreateDialog.value = false
    await loadIncidents()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to report incident' })
  } finally {
    isSaving.value = false
  }
}

async function closeIncident(incident: any): Promise<void> {
  $q.dialog({
    title: 'Close Incident',
    message: 'Are you sure you want to close this incident?',
    cancel: true,
  }).onOk(async () => {
    try {
      await IncidentService.closeIncident(incident.uuid, { closed_at: new Date().toISOString() })
      $q.notify({ type: 'positive', message: 'Incident closed' })
      await loadIncidents()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to close incident' })
    }
  })
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'yellow',
    Low: 'green',
    Informational: 'blue',
  }
  return colors[severity] || 'grey'
}
</script>

<style lang="scss" scoped>
.incident-card {
  transition: transform 0.2s;
  border-left: 4px solid transparent;
  &:hover {
    transform: translateY(-2px);
  }
}
.border-left-red {
  border-left-color: var(--q-negative) !important;
}
.border-left-orange {
  border-left-color: var(--q-warning) !important;
}
.border-left-yellow {
  border-left-color: #fbc02d !important;
}
.border-left-green {
  border-left-color: var(--q-positive) !important;
}
.border-left-blue {
  border-left-color: var(--q-info) !important;
}
</style>
