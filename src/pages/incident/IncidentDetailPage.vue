<!-- src/pages/incident/IncidentDetailPage.vue -->
<template>
  <q-page padding>
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <div v-else-if="incident" class="incident-detail">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back"
        class="q-mb-md"
        @click="$router.push('/incidents')"
      />

      <!-- Header -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-badge
                :color="getSeverityColor(incident.incident_severity)"
                :label="incident.incident_severity"
                class="q-px-lg q-py-sm q-mb-sm"
                style="font-size: 16px"
              />
              <h5 class="text-h5 q-mb-xs">{{ incident.root_cause }}</h5>
              <p class="text-grey-7 q-mb-none">
                Declared: {{ formatDateTime(incident.declared_at) }}
                <span v-if="incident.closed_at">
                  | Closed: {{ formatDateTime(incident.closed_at) }}</span
                >
              </p>
            </div>
            <q-icon
              :name="incident.closed_at ? 'check_circle' : 'warning'"
              :color="incident.closed_at ? 'green' : 'orange'"
              size="40px"
            />
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
              <div class="text-body2">{{ incident.bcp?.critical_function?.name || 'None' }}</div>
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
          <div class="text-h6 q-mb-md">Incident Timeline</div>
          <q-timeline color="primary">
            <q-timeline-entry
              icon="report"
              title="Incident Declared"
              :subtitle="formatDateTime(incident.declared_at)"
              color="red"
            >
              <div>Severity: {{ incident.incident_severity }}</div>
              <div>Root Cause: {{ incident.root_cause }}</div>
            </q-timeline-entry>
            <q-timeline-entry
              v-if="incident.bcp"
              icon="description"
              title="BCP Activated"
              :subtitle="formatDateTime(incident.declared_at)"
              color="primary"
            >
              <div>{{ incident.bcp.critical_function?.name }}</div>
            </q-timeline-entry>
            <q-timeline-entry
              v-if="incident.closed_at"
              icon="check_circle"
              title="Incident Closed"
              :subtitle="formatDateTime(incident.closed_at)"
              color="green"
            >
              <div>Recovery Time: {{ incident.recovery_actual_time }}</div>
            </q-timeline-entry>
          </q-timeline>
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
            @click="closeIncident"
          />
          <q-btn
            v-else
            color="orange"
            icon="refresh"
            label="Reopen Incident"
            class="full-width"
            outline
            @click="reopenIncident"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-btn
            color="primary"
            icon="edit"
            label="Edit"
            class="full-width"
            outline
            @click="editIncident"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Incident Not Found</h5>
      <q-btn color="primary" label="Back to Incidents" @click="$router.push('/incidents')" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { IncidentService } from '../../services/api/IncidentService'
import { formatDate, formatDateTime } from '../../utils/formatters'

const route = useRoute()
const $q = useQuasar()

const incident = ref<any>(null)
const isLoading = ref(true)

const incidentDuration = computed(() => {
  if (!incident.value) return 'N/A'
  const start = new Date(incident.value.declared_at)
  const end = incident.value.closed_at ? new Date(incident.value.closed_at) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) await loadIncident(id)
})

async function loadIncident(id: string): Promise<void> {
  isLoading.value = true
  try {
    const response = await IncidentService.getIncident(id)
    incident.value = response.data
  } catch (error) {
    console.error('Failed to load incident:', error)
  } finally {
    isLoading.value = false
  }
}

async function closeIncident(): Promise<void> {
  $q.dialog({
    title: 'Close Incident',
    message: 'Are you sure? This will mark the incident as resolved.',
    cancel: true,
  }).onOk(async () => {
    try {
      await IncidentService.closeIncident(incident.value.uuid, {
        closed_at: new Date().toISOString(),
      })
      $q.notify({ type: 'positive', message: 'Incident closed' })
      await loadIncident(incident.value.uuid)
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to close incident' })
    }
  })
}

async function reopenIncident(): Promise<void> {
  $q.dialog({
    title: 'Reopen Incident',
    message: 'Are you sure you want to reopen this incident?',
    cancel: true,
  }).onOk(async () => {
    try {
      await IncidentService.reopenIncident(incident.value.uuid)
      $q.notify({ type: 'positive', message: 'Incident reopened' })
      await loadIncident(incident.value.uuid)
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to reopen incident' })
    }
  })
}

function editIncident(): void {
  console.log('Edit incident:', incident.value?.uuid)
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
