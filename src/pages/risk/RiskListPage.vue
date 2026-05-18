<template>
  <q-page padding>
    <PageHeader
      title="Risk Management"
      subtitle="Identify, assess, and manage risks"
      show-refresh
      @refresh="loadRisks"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Add Risk" unelevated @click="openCreateDialog" />
      </template>
    </PageHeader>

    <!-- Stats Overview -->
    <RiskStatsOverview :risks="risks" class="q-mb-lg" />

    <!-- Risk Matrix & Filters Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-7">
        <RiskMatrix :risks="risks" @cell-click="filterByCell" />
      </div>
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Filters</div>
            <SearchBar
              v-model="filters.search"
              placeholder="Search risks..."
              @search="loadRisks"
              class="q-mb-md"
            />
            <q-select
              v-model="filters.category"
              :options="categoryOptions"
              outlined
              dense
              label="Category"
              clearable
              class="q-mb-sm"
              @update:model-value="loadRisks"
            />
            <q-select
              v-model="filters.severity"
              :options="severityOptions"
              outlined
              dense
              label="Impact Severity"
              clearable
              class="q-mb-sm"
              @update:model-value="loadRisks"
            />
            <q-select
              v-model="filters.sortBy"
              :options="sortOptions"
              outlined
              dense
              label="Sort By"
              emit-value
              map-options
              @update:model-value="loadRisks"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading risks..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="risks.length === 0"
      icon="warning"
      title="No Risks Found"
      description="Start identifying risks for your organisation."
      :action="{ label: 'Add Risk', handler: openCreateDialog }"
    />

    <!-- Risk Cards -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="risk in risks" :key="risk.uuid" class="col-12 col-md-6 col-lg-4">
        <RiskCard
          :risk="risk"
          @click="$router.push(`/risks/${risk.uuid}`)"
          @edit="openEditDialog(risk)"
          @reassess="openReassessDialog(risk)"
          @add-controls="openAddControlsDialog(risk)"
          @delete="confirmDelete(risk)"
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
        @update:model-value="loadRisks"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card style="width: 550px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ editingRisk ? 'Edit Risk' : 'Create Risk' }}</div>
        </q-card-section>
        <q-card-section>
          <RiskAssessmentForm
            :editing="!!editingRisk"
            :initial-data="editingRisk"
            :submitting="saving"
            :error-message="formError"
            @submit="handleSaveRisk"
            @cancel="closeFormDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reassess Dialog -->
    <q-dialog v-model="showReassessDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section><div class="text-h6">Reassess Risk</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="handleReassess" class="q-gutter-md">
            <q-input
              v-model.number="reassessForm.likelihood"
              label="Likelihood (0-1) *"
              type="number"
              outlined
              dense
              min="0"
              max="1"
              step="0.01"
              :rules="[requiredRule, likelihoodRule]"
            />
            <q-select
              v-model="reassessForm.impact_severity"
              :options="severityOptions"
              label="Impact Severity *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-input
              v-model.number="reassessForm.inherent_score"
              label="Inherent Risk Score *"
              type="number"
              outlined
              dense
              min="0"
              :rules="[requiredRule]"
            />
            <q-input
              v-model.number="reassessForm.residual_score"
              label="Residual Risk Score *"
              type="number"
              outlined
              dense
              min="0"
              :rules="[requiredRule, residualRule]"
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Reassess"
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

    <!-- Add Controls Dialog -->
    <q-dialog v-model="showControlsDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section><div class="text-h6">Add Mitigation Controls</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="handleAddControls" class="q-gutter-md">
            <q-select
              v-model="controlsForm.control_ids"
              :options="availableControls"
              label="Select Controls"
              outlined
              dense
              multiple
              use-chips
              emit-value
              map-options
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Add Controls"
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
import { useRiskStore } from '../../stores/risk/risk.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import RiskCard from '../../components/risk/RiskCard.vue'
import RiskStatsOverview from '../../components/risk/RiskStatsOverview.vue'
import RiskMatrix from '../../components/risk/RiskMatrix.vue'
import RiskAssessmentForm from '../../components/risk/RiskAssessmentForm.vue'
import { ImpactSeverity, RiskCategory } from 'src/models/entities'

const $q = useQuasar()
const riskStore = useRiskStore()

// State
const risks = computed(() => riskStore.risks)
const isLoading = computed(() => riskStore.isLoading)
const totalPages = computed(() => riskStore.totalPages)
const currentPage = ref(1)
const saving = ref(false)
const formError = ref('')

// Dialogs
const showFormDialog = ref(false)
const showReassessDialog = ref(false)
const showControlsDialog = ref(false)
const editingRisk = ref<any>(null)
const reassessingRisk = ref<any>(null)
const controlsRisk = ref<any>(null)

// Filters
const filters = reactive({
  search: '',
  category: null as string | null,
  severity: null as string | null,
  sortBy: 'inherent_risk_score',
})

// Reassess form
const reassessForm = reactive({
  likelihood: 0,
  impact_severity: '',
  inherent_score: 0,
  residual_score: 0,
})

// Controls form
const controlsForm = reactive({
  control_ids: [] as string[],
})

// Options
const categoryOptions = [
  'Financial',
  'Operational',
  'Compliance_and_Legal',
  'Reputational',
  'People_and_Safety',
  'Assets_and_IT',
  'Cyber',
  'Natural',
  'Human',
  'Supply',
]
const severityOptions = ['Insignificant', 'Low', 'Medium', 'High', 'Critical']
const sortOptions = [
  { label: 'Risk Score (High-Low)', value: 'inherent_risk_score' },
  { label: 'Category', value: 'risk_category' },
  { label: 'Likelihood', value: 'likelihood' },
  { label: 'Created Date', value: 'created_at' },
]
const availableControls = [
  { label: 'Control-001: Access Control', value: 'Control-001' },
  { label: 'Control-002: Encryption', value: 'Control-002' },
  { label: 'Control-003: Monitoring', value: 'Control-003' },
  { label: 'Control-004: Backup', value: 'Control-004' },
  { label: 'Control-005: Training', value: 'Control-005' },
]

// Validation
const requiredRule = (val: any) => !!val || val === 0 || 'Required'
const likelihoodRule = (val: number) => (val >= 0 && val <= 1) || 'Must be between 0 and 1'
const residualRule = (val: number) => {
  if (val > reassessForm.inherent_score) return 'Residual cannot exceed inherent score'
  return true
}

// Lifecycle
onMounted(() => loadRisks())

// Methods
async function loadRisks(): Promise<void> {
  await riskStore.loadRisks({
    search: filters.search,
    risk_category: filters.category as RiskCategory,
    impact_severity: filters.severity as ImpactSeverity,
    page: currentPage.value,
  })
}

function filterByCell(cell: { impact: string; likelihood: number }): void {
  filters.severity = cell.impact
  loadRisks()
}

function openCreateDialog(): void {
  editingRisk.value = null
  formError.value = ''
  showFormDialog.value = true
}

function openEditDialog(risk: any): void {
  editingRisk.value = risk
  formError.value = ''
  showFormDialog.value = true
}

function closeFormDialog(): void {
  showFormDialog.value = false
  editingRisk.value = null
  formError.value = ''
}

async function handleSaveRisk(data: any): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (editingRisk.value) {
      await riskStore.updateRisk(editingRisk.value.uuid, data)
      $q.notify({ type: 'positive', message: 'Risk updated successfully' })
    } else {
      await riskStore.createRisk(data)
      $q.notify({ type: 'positive', message: 'Risk created successfully' })
    }
    closeFormDialog()
    await loadRisks()
  } catch (err: any) {
    formError.value = err.response?.data?.message || err.message || 'Failed to save risk'
    $q.notify({ type: 'negative', message: formError.value })
  } finally {
    saving.value = false
  }
}

function openReassessDialog(risk: any): void {
  reassessingRisk.value = risk
  reassessForm.likelihood = risk.likelihood || 0
  reassessForm.impact_severity = risk.impact_severity || ''
  reassessForm.inherent_score = risk.inherent_risk_score || 0
  reassessForm.residual_score = risk.residual_risk_score || 0
  showReassessDialog.value = true
}

async function handleReassess(): Promise<void> {
  if (!reassessingRisk.value) return
  saving.value = true
  try {
    await riskStore.reassessRisk(reassessingRisk.value.uuid, {
      likelihood: reassessForm.likelihood,
      impact_severity: reassessForm.impact_severity,
      inherent_risk_score: reassessForm.inherent_score,
      residual_risk_score: reassessForm.residual_score,
    })
    $q.notify({ type: 'positive', message: 'Risk reassessed successfully' })
    showReassessDialog.value = false
    reassessingRisk.value = null
    await loadRisks()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to reassess risk' })
  } finally {
    saving.value = false
  }
}

function openAddControlsDialog(risk: any): void {
  controlsRisk.value = risk
  controlsForm.control_ids = risk.mitigation_control_ids || []
  showControlsDialog.value = true
}

async function handleAddControls(): Promise<void> {
  if (!controlsRisk.value) return
  saving.value = true
  try {
    await riskStore.addMitigationControls(controlsRisk.value.uuid, controlsForm.control_ids)
    $q.notify({ type: 'positive', message: 'Controls added successfully' })
    showControlsDialog.value = false
    controlsRisk.value = null
    await loadRisks()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to add controls' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(risk: any): void {
  $q.dialog({
    title: 'Delete Risk',
    message: `Are you sure you want to delete this risk? This action cannot be undone.`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await riskStore.deleteRisk(risk.uuid)
      $q.notify({ type: 'positive', message: 'Risk deleted successfully' })
      await loadRisks()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete risk' })
    }
  })
}
</script>
