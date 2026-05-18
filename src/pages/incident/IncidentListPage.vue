<template>
  <q-page padding>
    <PageHeader
      title="Incident Management"
      subtitle="Track and manage incidents"
      show-refresh
      @refresh="loadIncidents"
    >
      <template #actions>
        <q-btn
          color="negative"
          icon="add"
          label="Report Incident"
          unelevated
          @click="showCreateDialog = true"
        />
      </template>
    </PageHeader>

    <!-- Stats Overview -->
    <IncidentStatsCards :incidents="incidents" class="q-mb-lg" />

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <SearchBar
              v-model="filters.search"
              placeholder="Search incidents..."
              @search="loadIncidents"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.severity"
              :options="severityOptions"
              outlined
              dense
              label="Severity"
              clearable
              @update:model-value="loadIncidents"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              outlined
              dense
              label="Status"
              clearable
              @update:model-value="loadIncidents"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading incidents..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="incidents.length === 0"
      icon="report"
      title="No Incidents"
      description="No incidents reported yet. Report your first incident to get started."
      :action="{ label: 'Report Incident', handler: () => (showCreateDialog = true) }"
    />

    <!-- Incident List -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="incident in incidents" :key="incident.uuid" class="col-12 col-md-6">
        <IncidentCard
          :incident="incident"
          @click="$router.push(`/incidents/${incident.uuid}`)"
          @close="handleClose(incident)"
          @escalate="handleEscalate(incident)"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        direction-links
        color="primary"
        @update:model-value="loadIncidents"
      />
    </div>

    <!-- Create Incident Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Report New Incident</div>
        </q-card-section>
        <q-card-section>
          <IncidentReportForm
            :submitting="saving"
            :bcps="bcps"
            @submit="handleCreateIncident"
            @cancel="showCreateDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Close Incident Dialog -->
    <q-dialog v-model="showCloseDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Close Incident</div>
        </q-card-section>
        <q-card-section>
          <IncidentResolutionForm
            :submitting="saving"
            @submit="handleCloseIncident"
            @cancel="showCloseDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useIncidentStore } from '../../stores/incident.store'
import { useBcmStore } from '../../stores/bcm/bcm.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import IncidentCard from '../../components/incident/IncidentCard.vue'
import IncidentStatsCards from '../../components/incident/IncidentStatsCards.vue'
import IncidentReportForm from '../../components/incident/IncidentReportForm.vue'
import IncidentResolutionForm from '../../components/incident/IncidentResolutionForm.vue'
import { IncidentSeverity } from 'src/models/entities'

const $q = useQuasar()
const incidentStore = useIncidentStore()
const bcmStore = useBcmStore()

const incidents = computed(() => incidentStore.incidents)
const isLoading = computed(() => incidentStore.isLoading)
const totalPages = computed(() => incidentStore.totalPages)
const currentPage = ref(1)
const saving = ref(false)
const showCreateDialog = ref(false)
const showCloseDialog = ref(false)
const closingIncident = ref<any>(null)

const filters = reactive({
  search: '',
  severity: null,
  status: null,
})

const bcps = computed(() => bcmStore.activeBCPs || [])

const severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Informational']
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
]

onMounted(async () => {
  await Promise.all([loadIncidents(), bcmStore.loadBCPs()])
})

async function loadIncidents(): Promise<void> {
  await incidentStore.loadIncidents({
    search: filters.search,
    incident_severity: (filters.severity || 'Critical') as IncidentSeverity,
    active_only:
      filters.status === 'active' ? true : filters.status === 'closed' ? false : undefined,
    page: currentPage.value,
  } as any)
}

async function handleCreateIncident(data: any): Promise<void> {
  saving.value = true
  try {
    await incidentStore.createIncident({
      organisation_id: 'org-1', // Replace with actual org ID
      incident_severity: data.incident_severity,
      root_cause: data.root_cause,
      business_continuity_plan_id_activated: data.bcp_id,
      recovery_actual_time: data.recovery_actual_time,
    })
    $q.notify({ type: 'positive', message: 'Incident reported successfully' })
    showCreateDialog.value = false
    await loadIncidents()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to report incident' })
  } finally {
    saving.value = false
  }
}

function handleClose(incident: any): void {
  closingIncident.value = incident
  showCloseDialog.value = true
}

async function handleCloseIncident(data: any): Promise<void> {
  if (!closingIncident.value) return
  saving.value = true
  try {
    await incidentStore.closeIncident(closingIncident.value.uuid, {
      closed_at: data.closed_at,
    })
    $q.notify({ type: 'positive', message: 'Incident closed successfully' })
    showCloseDialog.value = false
    closingIncident.value = null
    await loadIncidents()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to close incident' })
  } finally {
    saving.value = false
  }
}

async function handleEscalate(incident: any): Promise<void> {
  try {
    await incidentStore.escalateIncident(incident.uuid)
    $q.notify({ type: 'positive', message: 'Incident escalated' })
    await loadIncidents()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to escalate' })
  }
}
</script>
