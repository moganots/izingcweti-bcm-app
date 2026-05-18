<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading risk details..." />
    </div>

    <!-- Not Found -->
    <div v-else-if="!risk" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Risk Not Found</h5>
      <q-btn color="primary" label="Back to Risks" @click="$router.push('/risks')" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back & Actions -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back to Risks"
          @click="$router.push('/risks')"
        />
        <div class="q-gutter-sm">
          <q-btn color="primary" icon="edit" label="Edit" outline @click="openEditDialog" />
          <q-btn
            color="orange"
            icon="refresh"
            label="Reassess"
            outline
            @click="openReassessDialog"
          />
          <q-btn color="negative" icon="delete" label="Delete" outline @click="confirmDelete" />
        </div>
      </div>

      <!-- Header Card -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-badge
                :color="getCategoryColor(risk.risk_category)"
                :label="formatCategory(risk.risk_category)"
                class="q-px-lg q-py-sm q-mb-sm"
                style="font-size: 16px"
              />
              <h5 class="text-h5 q-mb-xs">Risk Assessment</h5>
              <p class="text-grey-7 q-mb-none">
                Created: {{ formatDate(risk.created_at) }}
                <span v-if="risk.updated_at !== risk.created_at">
                  | Updated: {{ formatDate(risk.updated_at) }}</span
                >
              </p>
            </div>
            <q-badge
              :color="getScoreColor(risk.inherent_risk_score)"
              :label="getScoreLabel(risk.inherent_risk_score)"
              class="q-px-lg q-py-sm"
              style="font-size: 18px"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Risk Scores -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h6 q-mb-md">Inherent Risk</div>
              <RiskScoreGauge
                :score="risk.inherent_risk_score"
                :max-score="10"
                size="140px"
                font-size="28px"
                label="Pre-mitigation"
              />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h6 q-mb-md">Residual Risk</div>
              <RiskScoreGauge
                :score="risk.residual_risk_score"
                :max-score="10"
                size="140px"
                font-size="28px"
                label="Post-mitigation"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Risk Details -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="trending_up" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Likelihood</div>
              <div class="text-h6">{{ formatPercentage(risk.likelihood * 100) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="warning" size="30px" color="warning" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Impact</div>
              <div class="text-h6">{{ risk.impact_severity }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="business" size="30px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Organisation</div>
              <div class="text-body2">{{ risk.organisation?.name || 'N/A' }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon
                name="shield"
                size="30px"
                :color="controlCount > 0 ? 'green' : 'red'"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">Controls</div>
              <div class="text-h6">{{ controlCount }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mitigation Controls -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="shield" color="info" size="sm" class="q-mr-sm" />Mitigation Controls
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Add Controls"
              unelevated
              @click="openAddControlsDialog"
            />
          </div>
          <MitigationControlsList
            :controls="mitigationControls"
            @add="openAddControlsDialog"
            @remove="handleRemoveControl"
          />
        </q-card-section>
      </q-card>

      <!-- Risk Reduction -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Risk Reduction</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-card flat bordered class="bg-green-1">
                <q-card-section class="text-center">
                  <div class="text-caption text-grey-7">Points Reduced</div>
                  <div class="text-h4 text-green">{{ riskReduction.toFixed(1) }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6">
              <q-card flat bordered class="bg-blue-1">
                <q-card-section class="text-center">
                  <div class="text-caption text-grey-7">Reduction %</div>
                  <div class="text-h4 text-blue">{{ reductionPercentage }}%</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <q-linear-progress :value="reductionPercentage / 100" color="green" size="20px" rounded />
        </q-card-section>
      </q-card>
    </template>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="width: 550px; max-width: 90vw">
        <q-card-section><div class="text-h6">Edit Risk</div></q-card-section>
        <q-card-section>
          <RiskAssessmentForm
            :editing="true"
            :initial-data="risk"
            :submitting="saving"
            :error-message="formError"
            @submit="handleUpdate"
            @cancel="showEditDialog = false"
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
              v-model="reassessForm.severity"
              :options="severityOptions"
              label="Impact *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-input
              v-model.number="reassessForm.inherent"
              label="Inherent Score *"
              type="number"
              outlined
              dense
              min="0"
              :rules="[requiredRule]"
            />
            <q-input
              v-model.number="reassessForm.residual"
              label="Residual Score *"
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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRiskStore } from '../../stores/risk/risk.store'
import { formatDate } from '../../utils/date.utils'
import { formatPercentage } from '../../utils/formatters'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import RiskScoreGauge from '../../components/risk/RiskScoreGauge.vue'
import MitigationControlsList from '../../components/risk/MitigationControlsList.vue'
import RiskAssessmentForm from '../../components/risk/RiskAssessmentForm.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const riskStore = useRiskStore()

// State
const risk = computed(() => riskStore.selectedRisk)
const isLoading = ref(true)
const saving = ref(false)
const formError = ref('')
const showEditDialog = ref(false)
const showReassessDialog = ref(false)
const showControlsDialog = ref(false)

// Forms
const reassessForm = reactive({ likelihood: 0, severity: '', inherent: 0, residual: 0 })
const controlsForm = reactive({ control_ids: [] as string[] })

// Options
const severityOptions = ['Insignificant', 'Low', 'Medium', 'High', 'Critical']
const availableControls = [
  { label: 'Control-001: Access Control', value: 'Control-001' },
  { label: 'Control-002: Encryption', value: 'Control-002' },
  { label: 'Control-003: Monitoring', value: 'Control-003' },
  { label: 'Control-004: Backup', value: 'Control-004' },
  { label: 'Control-005: Training', value: 'Control-005' },
]

// Computed
const controlCount = computed(() => risk.value?.mitigation_control_ids?.length || 0)

const mitigationControls = computed(() => {
  if (!risk.value?.mitigation_control_ids) return []
  return risk.value.mitigation_control_ids.map((id: string) => ({
    id,
    name: id,
    description: 'Mitigation control',
    status: 'active',
  }))
})

const riskReduction = computed(() => {
  if (!risk.value) return 0
  return risk.value.inherent_risk_score - risk.value.residual_risk_score
})

const reductionPercentage = computed(() => {
  if (!risk.value || risk.value.inherent_risk_score === 0) return 0
  return Math.round((riskReduction.value / risk.value.inherent_risk_score) * 100)
})

// Validation
const requiredRule = (val: any) => !!val || val === 0 || 'Required'
const likelihoodRule = (val: number) => (val >= 0 && val <= 1) || 'Must be between 0 and 1'
const residualRule = (val: number) => {
  if (val > reassessForm.inherent) return 'Residual cannot exceed inherent'
  return true
}

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await riskStore.loadRisk(id)
    isLoading.value = false
  }
})

// Methods
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Financial: 'blue',
    Operational: 'orange',
    Compliance_and_Legal: 'purple',
    Reputational: 'red',
    People_and_Safety: 'green',
    Assets_and_IT: 'teal',
    Cyber: 'deep-orange',
    Natural: 'brown',
    Human: 'pink',
    Supply: 'indigo',
  }
  return colors[category] || 'grey'
}

function formatCategory(category: string): string {
  return category?.replace(/_/g, ' ') || category
}

function getScoreColor(score: number): string {
  if (score >= 8.5) return 'red'
  if (score >= 7) return 'orange'
  if (score >= 5) return 'yellow'
  if (score >= 3) return 'light-green'
  return 'green'
}

function getScoreLabel(score: number): string {
  if (score >= 8.5) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 5) return 'Medium'
  if (score >= 3) return 'Low'
  return 'Very Low'
}

function openEditDialog(): void {
  formError.value = ''
  showEditDialog.value = true
}

async function handleUpdate(data: any): Promise<void> {
  if (!risk.value) return
  saving.value = true
  formError.value = ''
  try {
    await riskStore.updateRisk(risk.value.uuid, data)
    $q.notify({ type: 'positive', message: 'Risk updated' })
    showEditDialog.value = false
    await riskStore.loadRisk(risk.value.uuid)
  } catch (err: any) {
    formError.value = err.message || 'Failed to update'
  } finally {
    saving.value = false
  }
}

function openReassessDialog(): void {
  if (!risk.value) return
  reassessForm.likelihood = risk.value.likelihood || 0
  reassessForm.severity = risk.value.impact_severity || ''
  reassessForm.inherent = risk.value.inherent_risk_score || 0
  reassessForm.residual = risk.value.residual_risk_score || 0
  showReassessDialog.value = true
}

async function handleReassess(): Promise<void> {
  if (!risk.value) return
  saving.value = true
  try {
    await riskStore.reassessRisk(risk.value.uuid, {
      likelihood: reassessForm.likelihood,
      impact_severity: reassessForm.severity,
      inherent_risk_score: reassessForm.inherent,
      residual_risk_score: reassessForm.residual,
    })
    $q.notify({ type: 'positive', message: 'Risk reassessed' })
    showReassessDialog.value = false
    await riskStore.loadRisk(risk.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to reassess' })
  } finally {
    saving.value = false
  }
}

function openAddControlsDialog(): void {
  controlsForm.control_ids = risk.value?.mitigation_control_ids || []
  showControlsDialog.value = true
}

async function handleAddControls(): Promise<void> {
  if (!risk.value) return
  saving.value = true
  try {
    await riskStore.addMitigationControls(risk.value.uuid, controlsForm.control_ids)
    $q.notify({ type: 'positive', message: 'Controls added' })
    showControlsDialog.value = false
    await riskStore.loadRisk(risk.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to add controls' })
  } finally {
    saving.value = false
  }
}

async function handleRemoveControl(control: any): Promise<void> {
  if (!risk.value) return
  $q.dialog({
    title: 'Remove Control',
    message: `Remove ${control.name}?`,
    cancel: true,
    ok: { color: 'negative' },
  }).onOk(async () => {
    try {
      await riskStore.removeMitigationControl(risk?.value!?.uuid, control.id)
      $q.notify({ type: 'positive', message: 'Control removed' })
      await riskStore.loadRisk(risk?.value!?.uuid)
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to remove control' })
    }
  })
}

function confirmDelete(): void {
  $q.dialog({
    title: 'Delete Risk',
    message: 'Are you sure? This action cannot be undone.',
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await riskStore.deleteRisk(risk!?.value!?.uuid)
      $q.notify({ type: 'positive', message: 'Risk deleted' })
      router.push('/risks')
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete' })
    }
  })
}
</script>
