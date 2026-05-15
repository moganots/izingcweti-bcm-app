<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading rule details..." />
    </div>

    <!-- Not Found -->
    <div v-else-if="!rule" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Rule Not Found</h5>
      <q-btn color="primary" label="Back to Rules" @click="$router.push('/rules')" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back & Actions -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back to Rules"
          @click="$router.push('/rules')"
        />
        <div class="q-gutter-sm">
          <q-btn color="primary" icon="edit" label="Edit" outline @click="openEditDialog" />
          <q-btn color="info" icon="play_arrow" label="Test" outline @click="openTestDialog" />
          <q-btn
            v-if="rule.status === 'ACTIVE'"
            color="orange"
            icon="pause"
            label="Deactivate"
            outline
            @click="handleDeactivate"
          />
          <q-btn
            v-if="rule.status !== 'ACTIVE'"
            color="green"
            icon="play_arrow"
            label="Activate"
            outline
            @click="handleActivate"
          />
          <q-btn color="negative" icon="delete" label="Delete" outline @click="confirmDelete" />
        </div>
      </div>

      <!-- Header -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-badge
                  :color="getTypeColor(rule.rule_type)"
                  :label="formatType(rule.rule_type)"
                  class="q-px-sm q-py-xs"
                />
                <q-badge :color="getStatusColor(rule.status)" :label="rule.status" outline />
                <q-badge
                  :color="getPriorityColor(rule.priority)"
                  :label="'Priority: ' + rule.priority"
                  outline
                />
              </div>
              <h5 class="text-h5 q-mb-xs">{{ rule.name }}</h5>
              <p v-if="rule.description" class="text-grey-7 q-mb-none">{{ rule.description }}</p>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Rule Details -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="bolt" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Trigger</div>
              <div class="text-body2 text-weight-medium">
                {{ formatTrigger(rule.rule_trigger) }}
              </div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="category" size="30px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Entity Type</div>
              <div class="text-body2 text-weight-medium">{{ rule.entity_type }}</div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="play_circle" size="30px" color="blue" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Executions</div>
              <div class="text-h6">{{ rule.execution_count || 0 }}</div>
            </q-card-section></q-card
          >
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered
            ><q-card-section class="text-center">
              <q-icon name="error" size="30px" color="red" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Failures</div>
              <div class="text-h6">{{ rule.failure_count || 0 }}</div>
            </q-card-section></q-card
          >
        </div>
      </div>

      <!-- Conditions -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="filter_list" size="sm" class="q-mr-sm" />Conditions ({{ conditionCount }})
          </div>
          <div v-if="conditionCount === 0" class="text-grey-7 q-pa-sm">No conditions defined</div>
          <q-list v-else separator>
            <q-item v-for="(condition, index) in rule.conditions" :key="index">
              <q-item-section avatar>
                <q-icon name="checklist" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  >{{ condition.field }} {{ formatOperator(condition.operator) }}
                  {{ condition.value }}</q-item-label
                >
              </q-item-section>
              <q-item-section side v-if="index < rule.conditions.length - 1">
                <q-badge
                  :color="condition.logical_operator === 'OR' ? 'orange' : 'blue'"
                  :label="condition.logical_operator || 'AND'"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Actions -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="play_arrow" size="sm" class="q-mr-sm" />Actions ({{ actionCount }})
          </div>
          <div v-if="actionCount === 0" class="text-grey-7 q-pa-sm">No actions defined</div>
          <q-list v-else separator>
            <q-item v-for="(action, index) in rule.actions" :key="index">
              <q-item-section avatar>
                <q-icon name="settings" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ formatActionType(action.type) }}</q-item-label>
                <q-item-label caption>{{ formatJSON(action.params) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Execution Log -->
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="history" size="sm" class="q-mr-sm" />Execution Log
            </div>
          </div>
          <RuleExecutionLog
            :logs="executionLogs"
            :loading="loadingLogs"
            :has-more="hasMoreLogs"
            @load-more="loadMoreLogs"
          />
        </q-card-section>
      </q-card>
    </template>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div>Edit Rule</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <RuleBuilder
            :editing="true"
            :initial-data="rule"
            :submitting="saving"
            @submit="handleUpdate"
            @cancel="showEditDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Test Dialog -->
    <q-dialog v-model="showTestDialog" persistent>
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section><div class="text-h6">Test Rule</div></q-card-section>
        <q-card-section>
          <RuleTestPanel ref="testPanelRef" :running="testing" @test="handleTestRule" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRulesStore } from '../../stores/rule.store'
import { formatJSON } from '../../utils/formatters'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import RuleBuilder from '../../components/rules/RuleBuilder.vue'
import RuleTestPanel from '../../components/rules/RuleTestPanel.vue'
import RuleExecutionLog from '../../components/rules/RuleExecutionLog.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const rulesStore = useRulesStore()

// State
const rule = computed(() => rulesStore.selectedRule)
const isLoading = ref(true)
const saving = ref(false)
const testing = ref(false)
const loadingLogs = ref(false)
const hasMoreLogs = ref(false)
const showEditDialog = ref(false)
const showTestDialog = ref(false)
const testPanelRef = ref<any>(null)
const executionLogs = ref<any[]>([])

// Computed
const conditionCount = computed(() => rule.value?.conditions?.length || 0)
const actionCount = computed(() => rule.value?.actions?.length || 0)

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await rulesStore.loadRule(id)
    await loadExecutionLogs()
    isLoading.value = false
  }
})

// Methods
async function loadExecutionLogs(): Promise<void> {
  loadingLogs.value = true
  try {
    executionLogs.value = [] // Replace with actual API call
    hasMoreLogs.value = false
  } finally {
    loadingLogs.value = false
  }
}

function loadMoreLogs(): void {
  /* Pagination logic */
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    VALIDATION: 'blue',
    NOTIFICATION: 'green',
    APPROVAL: 'purple',
    ESCALATION: 'orange',
    COMPLIANCE: 'red',
    RISK_CALCULATION: 'brown',
    BCM_AUTOMATION: 'teal',
    WORKFLOW_AUTOMATION: 'deep-orange',
    CUSTOM: 'grey',
  }
  return colors[type] || 'grey'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'grey',
    DRAFT: 'orange',
    TESTING: 'blue',
    DEPRECATED: 'red',
  }
  return colors[status] || 'grey'
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = { 1: 'red', 2: 'orange', 3: 'yellow', 4: 'blue' }
  return colors[priority] || 'grey'
}

function formatType(type: string): string {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || type
}

function formatTrigger(trigger: string): string {
  return trigger?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || trigger
}

function formatOperator(op: string): string {
  return op?.replace(/_/g, ' ').toLowerCase() || op
}

function formatActionType(type: string): string {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || type
}

async function handleActivate(): Promise<void> {
  try {
    await rulesStore.activateRule(rule!?.value!?.uuid)
    $q.notify({ type: 'positive', message: 'Rule activated' })
    await rulesStore.loadRule(rule!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to activate' })
  }
}

async function handleDeactivate(): Promise<void> {
  try {
    await rulesStore.deactivateRule(rule!?.value!?.uuid)
    $q.notify({ type: 'positive', message: 'Rule deactivated' })
    await rulesStore.loadRule(rule!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to deactivate' })
  }
}

function openEditDialog(): void {
  showEditDialog.value = true
}

async function handleUpdate(data: any): Promise<void> {
  saving.value = true
  try {
    await rulesStore.updateRule(rule!?.value!?.uuid, data)
    $q.notify({ type: 'positive', message: 'Rule updated' })
    showEditDialog.value = false
    await rulesStore.loadRule(rule!?.value!?.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to update' })
  } finally {
    saving.value = false
  }
}

function openTestDialog(): void {
  showTestDialog.value = true
}

async function handleTestRule(data: { testData: any }): Promise<void> {
  testing.value = true
  try {
    const result = await rulesStore.testRule({
      conditions: rule!?.value!?.conditions,
      actions: rule!?.value!?.actions,
      test_data: data.testData,
    })
    testPanelRef.value?.setResult(result)
  } catch (err: any) {
    testPanelRef.value?.setResult({ success: false, error: err.message })
  } finally {
    testing.value = false
  }
}

function confirmDelete(): void {
  $q.dialog({
    title: 'Delete Rule',
    message: `Delete "${rule!?.value!?.name}"? This cannot be undone.`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await rulesStore.deleteRule(rule!?.value!?.uuid)
      $q.notify({ type: 'positive', message: 'Rule deleted' })
      router.push('/rules')
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete' })
    }
  })
}
</script>
