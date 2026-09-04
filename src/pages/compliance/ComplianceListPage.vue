<template>
  <q-page padding>
    <PageHeader
      title="Compliance Management"
      subtitle="Track compliance against standards and regulations"
      show-refresh
      @refresh="loadRecords"
    >
      <template #actions>
        <q-btn dense round color="primary" icon="note_add" @click="openCreateDialog" />
      </template>
    </PageHeader>

    <!-- Stats Overview -->
    <ComplianceStatsOverview :records="records" class="q-mb-lg" />

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <SearchBar
              v-model="filters.search"
              placeholder="Search records..."
              @search="loadRecords"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.standard"
              :options="standardOptions"
              outlined
              dense
              label="Standard"
              clearable
              @update:model-value="loadRecords"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusFilterOptions"
              outlined
              dense
              label="Status"
              clearable
              @update:model-value="loadRecords"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filters.sortBy"
              :options="sortOptions"
              outlined
              dense
              label="Sort"
              emit-value
              map-options
              @update:model-value="loadRecords"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading compliance records..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="records.length === 0"
      icon="verified_user"
      title="No Compliance Records"
      description="Add your first compliance record to track regulatory compliance."
      :action="{ label: 'Add Record', handler: openCreateDialog }"
    />

    <!-- Compliance Cards -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="record in records" :key="record.uuid" class="col-12 col-md-6 col-lg-4">
        <ComplianceCard
          :record="record"
          @click="$router.push(`/compliance/${record.uuid}`)"
          @edit="openEditDialog(record)"
          @update-status="openStatusDialog(record)"
          @add-evidence="openEvidenceDialog(record)"
          @delete="confirmDelete(record)"
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
        @update:model-value="loadRecords"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card style="width: 550px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ editingRecord ? 'Edit' : 'Add' }} Compliance Record</div>
        </q-card-section>
        <q-card-section>
          <ComplianceForm
            :editing="!!editingRecord"
            :initial-data="editingRecord"
            :submitting="saving"
            :error-message="formError"
            :organisation-options="orgOptions"
            @submit="handleSave"
            @cancel="closeFormDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Update Status Dialog -->
    <q-dialog v-model="showStatusDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Update Compliance Status</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="handleStatusUpdate" class="q-gutter-md">
            <q-select
              v-model="statusForm.compliance_status"
              :options="statusFilterOptions"
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

    <!-- Add Evidence Dialog -->
    <q-dialog v-model="showEvidenceDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Add Evidence</div>
        </q-card-section>
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
              placeholder="Enter URLs separated by commas"
              hint="Add links to compliance evidence documents"
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
import { useQuasar } from 'quasar'
import { useComplianceStore } from '../../stores/compliance/compliance.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import ComplianceCard from '../../components/compliance/ComplianceCard.vue'
import ComplianceStatsOverview from '../../components/compliance/ComplianceStatsOverview.vue'
import ComplianceForm from '../../components/compliance/ComplianceForm.vue'

const $q = useQuasar()
const complianceStore = useComplianceStore()

// State
const records = computed(() => complianceStore.records || [])
const isLoading = ref(false)
const totalPages = ref(1)
const currentPage = ref(1)
const saving = ref(false)
const formError = ref('')

// Dialogs
const showFormDialog = ref(false)
const showStatusDialog = ref(false)
const showEvidenceDialog = ref(false)
const editingRecord = ref<any>(null)
const statusRecord = ref<any>(null)
const evidenceRecord = ref<any>(null)

// Filters
const filters = reactive({
  search: '',
  standard: null,
  status: null,
  sortBy: 'next_audit_due',
})

// Forms
const statusForm = reactive({
  compliance_status: '',
  last_audit_date: '',
})

const evidenceForm = reactive({
  links: '',
})

// Options
const standardOptions = [
  { label: 'ISO 22301', value: 'ISO22301' },
  { label: 'NIST 800-34', value: 'NIST800-34' },
  { label: 'FFIEC', value: 'FFIEC' },
  { label: 'COBIT 2019', value: 'COBIT2019' },
]

const statusFilterOptions = [
  { label: 'Compliant', value: 'Compliant' },
  { label: 'Partially Compliant', value: 'Partially' },
  { label: 'Non-Compliant', value: 'NonCompliant' },
]

const sortOptions = [
  { label: 'Next Audit Due', value: 'next_audit_due' },
  { label: 'Standard', value: 'compliance_standard' },
  { label: 'Status', value: 'compliance_status' },
  { label: 'Created Date', value: 'created_at' },
]

const orgOptions = [
  { label: 'BCM Test Corp', value: 'org-1' },
  { label: 'Healthcare Testing Ltd', value: 'org-2' },
]

const requiredRule = (val: any) => !!val || 'Required'

// Lifecycle
onMounted(() => loadRecords())

// Methods
async function loadRecords(): Promise<void> {
  isLoading.value = true
  try {
    await complianceStore.loadRecords({
      search: filters.search,
      standard: filters.standard,
      status: filters.status,
      page: currentPage.value,
    } as any)
  } finally {
    isLoading.value = false
  }
}

function openCreateDialog(): void {
  editingRecord.value = null
  formError.value = ''
  showFormDialog.value = true
}

function openEditDialog(record: any): void {
  editingRecord.value = record
  formError.value = ''
  showFormDialog.value = true
}

function closeFormDialog(): void {
  showFormDialog.value = false
  editingRecord.value = null
  formError.value = ''
}

async function handleSave(data: any): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (editingRecord.value) {
      await complianceStore.updateRecord(editingRecord.value.uuid, data)
      $q.notify({ type: 'positive', message: 'Record updated successfully' })
    } else {
      await complianceStore.createRecord(data)
      $q.notify({ type: 'positive', message: 'Record created successfully' })
    }
    closeFormDialog()
    await loadRecords()
  } catch (err: any) {
    formError.value = err.response?.data?.message || err.message || 'Failed to save'
    $q.notify({ type: 'negative', message: formError.value })
  } finally {
    saving.value = false
  }
}

function openStatusDialog(record: any): void {
  statusRecord.value = record
  statusForm.compliance_status = record.compliance_status || ''
  statusForm.last_audit_date = formatISO(new Date())!
  showStatusDialog.value = true
}

async function handleStatusUpdate(): Promise<void> {
  if (!statusRecord.value || !statusForm.compliance_status) return
  saving.value = true
  try {
    await complianceStore.updateStatus(statusRecord.value.uuid, {
      compliance_status: statusForm.compliance_status,
      last_audit_date: statusForm.last_audit_date || undefined,
    })
    $q.notify({ type: 'positive', message: 'Status updated' })
    showStatusDialog.value = false
    statusRecord.value = null
    await loadRecords()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to update status' })
  } finally {
    saving.value = false
  }
}

function openEvidenceDialog(record: any): void {
  evidenceRecord.value = record
  evidenceForm.links = (record.evidence_links || []).join(', ')
  showEvidenceDialog.value = true
}

async function handleAddEvidence(): Promise<void> {
  if (!evidenceRecord.value || !evidenceForm.links) return
  saving.value = true
  try {
    const links = evidenceForm.links
      .split(',')
      .map((l: string) => l.trim())
      .filter(Boolean)
    await complianceStore.addEvidence(evidenceRecord.value.uuid, links)
    $q.notify({ type: 'positive', message: 'Evidence added' })
    showEvidenceDialog.value = false
    evidenceRecord.value = null
    await loadRecords()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to add evidence' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(record: any): void {
  $q.dialog({
    title: 'Delete Compliance Record',
    message: `Are you sure you want to delete this record? This cannot be undone.`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await complianceStore.deleteRecord(record.uuid)
      $q.notify({ type: 'positive', message: 'Record deleted' })
      await loadRecords()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete' })
    }
  })
}
</script>
