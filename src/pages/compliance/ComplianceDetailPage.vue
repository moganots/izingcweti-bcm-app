<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading compliance record..." />
    </div>

    <!-- Not Found -->
    <div v-else-if="!record" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Record Not Found</h5>
      <q-btn color="primary" label="Back to Compliance" @click="$router.push('/compliance')" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back & Actions -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back"
          @click="$router.push('/compliance')"
        />
        <div class="q-gutter-sm">
          <q-btn color="primary" icon="edit" label="Edit" outline @click="openEditDialog" />
          <q-btn
            color="orange"
            icon="refresh"
            label="Update Status"
            outline
            @click="openStatusDialog"
          />
          <q-btn
            color="info"
            icon="attach_file"
            label="Add Evidence"
            outline
            @click="openEvidenceDialog"
          />
          <q-btn color="negative" icon="delete" label="Delete" outline @click="confirmDelete" />
        </div>
      </div>

      <!-- Header Card -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-badge
                  :color="getStandardColor(record.compliance_standard)"
                  :label="formatStandard(record.compliance_standard)"
                  class="q-px-sm q-py-xs"
                />
                <ComplianceStatusBadge :status="record.compliance_status" />
              </div>
              <h5 class="text-h5 q-mb-xs">
                {{ record.organisation?.name || 'Unknown Organisation' }}
              </h5>
              <p class="text-grey-7 q-mb-none">
                Created: {{ formatDate(record.created_at) }}
                <span v-if="record.updated_at !== record.created_at">
                  | Updated: {{ formatDate(record.updated_at) }}</span
                >
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Details Grid -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="event" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Last Audit</div>
              <div class="text-body2 text-weight-medium">
                {{ formatDate(record.last_audit_date) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon
                name="event_available"
                size="30px"
                :color="isOverdue ? 'red' : 'info'"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">Next Audit Due</div>
              <div class="text-body2" :class="isOverdue ? 'text-negative text-weight-bold' : ''">
                {{ formatDate(record.next_audit_due) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="business" size="30px" color="secondary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Organisation</div>
              <div class="text-body2">{{ record.organisation?.name || 'N/A' }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon
                name="attach_file"
                size="30px"
                :color="evidenceCount > 0 ? 'green' : 'grey'"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">Evidence Items</div>
              <div class="text-h6">{{ evidenceCount }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Compliance Progress -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Compliance Status</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-4">
              <q-card
                flat
                bordered
                :class="record.compliance_status === 'Compliant' ? 'bg-green-1' : 'bg-grey-1'"
              >
                <q-card-section class="text-center">
                  <q-icon
                    name="check_circle"
                    size="30px"
                    :color="record.compliance_status === 'Compliant' ? 'green' : 'grey'"
                  />
                  <div class="text-body2 q-mt-sm">Compliant</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card
                flat
                bordered
                :class="record.compliance_status === 'Partially' ? 'bg-orange-1' : 'bg-grey-1'"
              >
                <q-card-section class="text-center">
                  <q-icon
                    name="warning"
                    size="30px"
                    :color="record.compliance_status === 'Partially' ? 'orange' : 'grey'"
                  />
                  <div class="text-body2 q-mt-sm">Partially</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card
                flat
                bordered
                :class="record.compliance_status === 'NonCompliant' ? 'bg-red-1' : 'bg-grey-1'"
              >
                <q-card-section class="text-center">
                  <q-icon
                    name="error"
                    size="30px"
                    :color="record.compliance_status === 'NonCompliant' ? 'red' : 'grey'"
                  />
                  <div class="text-body2 q-mt-sm">Non-Compliant</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <q-linear-progress
            :value="complianceProgress"
            :color="progressColor"
            size="20px"
            rounded
            class="q-mb-sm"
          />
          <div class="text-center text-caption text-grey-7">{{ complianceLabel }}</div>
        </q-card-section>
      </q-card>

      <!-- Evidence List -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <ComplianceEvidenceList
            :items="record.evidence_links"
            @add="openEvidenceDialog"
            @view="viewEvidence"
            @download="downloadEvidence"
            @remove="removeEvidence"
          />
        </q-card-section>
      </q-card>

      <!-- Audit Timeline -->
      <q-card flat bordered>
        <q-card-section>
          <ComplianceAuditTimeline :audits="auditHistory" />
        </q-card-section>
      </q-card>
    </template>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="width: 550px; max-width: 90vw">
        <q-card-section><div class="text-h6">Edit Compliance Record</div></q-card-section>
        <q-card-section>
          <ComplianceForm
            :editing="true"
            :initial-data="record"
            :submitting="saving"
            :error-message="formError"
            :organisation-options="orgOptions"
            @submit="handleUpdate"
            @cancel="showEditDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Status Dialog -->
    <q-dialog v-model="showStatusDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section><div class="text-h6">Update Status</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="handleStatusUpdate" class="q-gutter-md">
            <q-select
              v-model="statusForm.compliance_status"
              :options="statusOptions"
              label="Status *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-input
              v-model="statusForm.last_audit_date"
              label="Last Audit Date"
              type="date"
              outlined
              dense
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Update"
                  :loading="saving"
                  class="full-width"
                  unelevated
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Evidence Dialog -->
    <q-dialog v-model="showEvidenceDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Add Evidence</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="handleAddEvidence" class="q-gutter-md">
            <q-input
              v-model="evidenceForm.links"
              label="Evidence Links *"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[requiredRule]"
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Add"
                  :loading="saving"
                  class="full-width"
                  unelevated
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useComplianceStore } from '../../stores/compliance/compliance.store'
import { formatDate } from '../../utils/date.utils'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import ComplianceStatusBadge from '../../components/compliance/ComplianceStatusBadge.vue'
import ComplianceEvidenceList from '../../components/compliance/ComplianceEvidenceList.vue'
import ComplianceAuditTimeline from '../../components/compliance/ComplianceAuditTimeline.vue'
import ComplianceForm from '../../components/compliance/ComplianceForm.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const complianceStore = useComplianceStore()

// State
const record = computed(() => complianceStore.selectedRecord)
const isLoading = ref(true)
const saving = ref(false)
const formError = ref('')
const showEditDialog = ref(false)
const showStatusDialog = ref(false)
const showEvidenceDialog = ref(false)

// Forms
const statusForm = reactive({ compliance_status: '', last_audit_date: '' })
const evidenceForm = reactive({ links: '' })

// Options
const statusOptions = [
  { label: 'Compliant', value: 'Compliant' },
  { label: 'Partially Compliant', value: 'Partially' },
  { label: 'Non-Compliant', value: 'NonCompliant' },
]
const orgOptions = [{ label: 'BCM Test Corp', value: 'org-1' }]
const requiredRule = (val: any) => !!val || 'Required'

// Computed
const isOverdue = computed(() => {
  if (!record.value?.next_audit_due) return false
  return new Date(record.value.next_audit_due) < new Date()
})
const evidenceCount = computed(() => record.value?.evidence_links?.length || 0)
const complianceProgress = computed(() => {
  switch (record.value?.compliance_status) {
    case 'Compliant':
      return 1
    case 'Partially':
      return 0.5
    case 'NonCompliant':
      return 0.1
    default:
      return 0
  }
})
const progressColor = computed(() => {
  switch (record.value?.compliance_status) {
    case 'Compliant':
      return 'green'
    case 'Partially':
      return 'orange'
    case 'NonCompliant':
      return 'red'
    default:
      return 'grey'
  }
})
const complianceLabel = computed(() => {
  switch (record.value?.compliance_status) {
    case 'Compliant':
      return 'Fully Compliant'
    case 'Partially':
      return 'Partially Compliant'
    case 'NonCompliant':
      return 'Non-Compliant - Action Required'
    default:
      return 'Unknown'
  }
})

// Mock audit history
const auditHistory = computed(() => [
  {
    title: 'Annual Audit',
    date: record.value?.last_audit_date,
    description: 'Regular compliance audit conducted',
    status: 'Completed',
    auditor: 'External Auditor',
  },
  {
    title: 'Next Audit',
    date: record.value?.next_audit_due,
    description: 'Scheduled compliance audit',
    status: 'Scheduled',
  },
])

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await complianceStore.loadRecord(id)
    isLoading.value = false
  }
})

// Methods
function getStandardColor(standard: string): string {
  const colors: Record<string, string> = {
    ISO22301: 'blue',
    'NIST800-34': 'green',
    FFIEC: 'orange',
    COBIT2019: 'purple',
  }
  return colors[standard] || 'grey'
}
function formatStandard(standard: string): string {
  const labels: Record<string, string> = {
    ISO22301: 'ISO 22301',
    'NIST800-34': 'NIST 800-34',
    FFIEC: 'FFIEC',
    COBIT2019: 'COBIT 2019',
  }
  return labels[standard] || standard
}

function openEditDialog(): void {
  formError.value = ''
  showEditDialog.value = true
}
async function handleUpdate(data: any): Promise<void> {
  saving.value = true
  try {
    await complianceStore.updateRecord(record.value.uuid, data)
    $q.notify({ type: 'positive', message: 'Record updated' })
    showEditDialog.value = false
    await complianceStore.loadRecord(record.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to update' })
  } finally {
    saving.value = false
  }
}

function openStatusDialog(): void {
  statusForm.compliance_status = record.value?.compliance_status || ''
  statusForm.last_audit_date = formatISO(new Date())!
  showStatusDialog.value = true
}
async function handleStatusUpdate(): Promise<void> {
  saving.value = true
  try {
    await complianceStore.updateStatus(record.value.uuid, {
      compliance_status: statusForm.compliance_status,
      last_audit_date: statusForm.last_audit_date,
    })
    $q.notify({ type: 'positive', message: 'Status updated' })
    showStatusDialog.value = false
    await complianceStore.loadRecord(record.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to update' })
  } finally {
    saving.value = false
  }
}

function openEvidenceDialog(): void {
  evidenceForm.links = (record.value?.evidence_links || []).join(', ')
  showEvidenceDialog.value = true
}
async function handleAddEvidence(): Promise<void> {
  saving.value = true
  try {
    const links = evidenceForm.links
      .split(',')
      .map((l: string) => l.trim())
      .filter(Boolean)
    await complianceStore.addEvidence(record.value.uuid, links)
    $q.notify({ type: 'positive', message: 'Evidence added' })
    showEvidenceDialog.value = false
    await complianceStore.loadRecord(record.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to add evidence' })
  } finally {
    saving.value = false
  }
}

function viewEvidence(item: any): void {
  window.open(typeof item === 'string' ? item : item.url, '_blank')
}
function downloadEvidence(item: any): void {
  window.open(typeof item === 'string' ? item : item.url, '_blank')
}
async function removeEvidence(item: any, index: number): Promise<void> {
  try {
    await complianceStore.removeEvidence(record.value.uuid, index)
    $q.notify({ type: 'positive', message: 'Evidence removed' })
    await complianceStore.loadRecord(record.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to remove' })
  }
}

function confirmDelete(): void {
  $q.dialog({
    title: 'Delete',
    message: 'Delete this record?',
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await complianceStore.deleteRecord(record.value.uuid)
      $q.notify({ type: 'positive', message: 'Deleted' })
      router.push('/compliance')
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete' })
    }
  })
}
</script>
