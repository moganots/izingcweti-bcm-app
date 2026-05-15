<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading incident..." />
    </div>

    <!-- Content -->
    <div v-else-if="incident">
      <!-- Back Button -->
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to Incidents"
        class="q-mb-md"
        @click="$router.push('/incidents')"
      />

      <!-- Header Card -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <IncidentSeverityBadge :severity="incident.incident_severity" class="q-mb-sm" />
              <h5 class="text-h5 q-mb-xs">{{ incident.root_cause }}</h5>
              <p class="text-grey-7 q-mb-none">
                Declared: {{ formatDateTime(incident.declared_at) }}
                <span v-if="incident.closed_at">
                  | Closed: {{ formatDateTime(incident.closed_at) }}</span
                >
              </p>
            </div>
            <IncidentStatusBadge :incident="incident" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Details Grid -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="schedule" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Recovery Time</div>
              <div class="text-h6">{{ incident.recovery_actual_time || 'N/A' }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="business" size="30px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Organisation</div>
              <div class="text-body2">{{ incident.organisation?.name || 'N/A' }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="description" size="30px" color="secondary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">BCP Activated</div>
              <div class="text-body2">{{ bcpName || 'None' }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon
                name="timer"
                size="30px"
                :color="incident.closed_at ? 'green' : 'orange'"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">Duration</div>
              <div class="text-h6">{{ incidentDuration }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Timeline -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <IncidentTimeline :entries="timelineEntries" />
        </q-card-section>
      </q-card>

      <!-- Actions -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-btn
            v-if="!incident.closed_at"
            color="green"
            icon="check"
            label="Close Incident"
            class="full-width"
            unelevated
            @click="showCloseDialog = true"
          />
          <q-btn
            v-else
            color="orange"
            icon="refresh"
            label="Reopen Incident"
            class="full-width"
            outline
            @click="handleReopen"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-btn
            v-if="!incident.closed_at"
            color="orange"
            icon="arrow_upward"
            label="Escalate"
            class="full-width"
            outline
            @click="handleEscalate"
          />
          <q-btn
            color="primary"
            icon="edit"
            label="Edit"
            class="full-width q-mt-sm"
            outline
            @click="editIncident"
          />
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Incident Not Found</h5>
      <q-btn color="primary" label="Back to Incidents" @click="$router.push('/incidents')" />
    </div>

    <!-- Close Dialog -->
    <q-dialog v-model="showCloseDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Close Incident</div>
        </q-card-section>
        <q-card-section>
          <IncidentResolutionForm
            :submitting="saving"
            @submit="handleClose"
            @cancel="showCloseDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useIncidentStore } from '../../stores/incident.store'
import { formatDateTime } from '../../utils/date.utils'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import IncidentSeverityBadge from '../../components/incident/IncidentSeverityBadge.vue'
import IncidentStatusBadge from '../../components/incident/IncidentStatusBadge.vue'
import IncidentTimeline from '../../components/incident/IncidentTimeline.vue'
import IncidentResolutionForm from '../../components/incident/IncidentResolutionForm.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const incidentStore = useIncidentStore()

const incident = computed(() => incidentStore.selectedIncident)
const isLoading = ref(true)
const saving = ref(false)
const showCloseDialog = ref(false)

const bcpName = computed(() => 'BCP Placeholder')

const incidentDuration = computed(() => {
  if (!incident.value) return 'N/A'
  const start = new Date(incident.value.declared_at)
  const end = incident.value.closed_at ? new Date(incident.value.closed_at) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
})

const timelineEntries = computed(() => {
  if (!incident.value) return []
  const entries: any[] = [
    {
      icon: 'report',
      color: 'red',
      title: 'Incident Declared',
      subtitle: formatDateTime(incident.value.declared_at),
      details: {
        Severity: incident.value.incident_severity,
        'Root Cause': incident.value.root_cause,
      },
      badge: incident.value.incident_severity,
      badgeColor: incident.value.incident_severity === 'Critical' ? 'red' : 'orange',
    },
  ]

  if (incident.value.business_continuity_plan_id_activated) {
    entries.push({
      icon: 'description',
      color: 'primary',
      title: 'BCP Activated',
      subtitle: formatDateTime(incident.value.declared_at),
    })
  }

  if (incident.value.closed_at) {
    entries.push({
      icon: 'check_circle',
      color: 'green',
      title: 'Incident Closed',
      subtitle: formatDateTime(incident.value.closed_at),
      description: `Recovery Time: ${incident.value.recovery_actual_time || 'N/A'}`,
    })
  }

  return entries
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await incidentStore.loadIncident(id)
    isLoading.value = false
  }
})

async function handleClose(data: any): Promise<void> {
  if (!incident.value) return
  saving.value = true
  try {
    await incidentStore.closeIncident(incident?.value?.uuid!, { closed_at: data.closed_at })
    $q.notify({ type: 'positive', message: 'Incident closed' })
    showCloseDialog.value = false
    await incidentStore.loadIncident(incident?.value?.uuid!)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to close' })
  } finally {
    saving.value = false
  }
}

async function handleReopen(): Promise<void> {
  if (!incident.value) return
  $q.dialog({
    title: 'Reopen Incident',
    message: 'Are you sure you want to reopen this incident?',
    cancel: true,
  }).onOk(async () => {
    try {
      await incidentStore.reopenIncident(incident?.value?.uuid!)
      $q.notify({ type: 'positive', message: 'Incident reopened' })
      await incidentStore.loadIncident(incident?.value?.uuid!)
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to reopen' })
    }
  })
}

async function handleEscalate(): Promise<void> {
  if (!incident.value) return
  try {
    await incidentStore.escalateIncident(incident?.value?.uuid!)
    $q.notify({ type: 'positive', message: 'Incident escalated' })
    await incidentStore.loadIncident(incident?.value?.uuid!)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to escalate' })
  }
}

function editIncident(): void {
  console.log('Edit incident:', incident.value?.uuid)
}
</script>
