<template>
  <q-page padding>
    <PageHeader
      title="Business Rules"
      subtitle="Manage automation and validation rules"
      show-refresh
      @refresh="loadRules"
    >
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="Create Rule"
          unelevated
          @click="openCreateDialog"
        />
      </template>
    </PageHeader>

    <!-- Stats Overview -->
    <RuleStatsOverview :rules="rules" class="q-mb-lg" />

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <SearchBar v-model="filters.search" placeholder="Search rules..." @search="loadRules" />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.rule_type"
              :options="typeOptions"
              outlined
              dense
              label="Type"
              clearable
              @update:model-value="loadRules"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              outlined
              dense
              label="Status"
              clearable
              @update:model-value="loadRules"
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
              @update:model-value="loadRules"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading rules..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="rules.length === 0"
      icon="rule"
      title="No Rules Found"
      description="Create your first business rule to automate processes."
      :action="{ label: 'Create Rule', handler: openCreateDialog }"
    />

    <!-- Rules Grid -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="rule in rules" :key="rule.uuid" class="col-12 col-md-6 col-lg-4">
        <RuleCard
          :rule="rule"
          @click="$router.push(`/rules/${rule.uuid}`)"
          @edit="openEditDialog(rule)"
          @test="openTestDialog(rule)"
          @activate="handleActivate(rule)"
          @deactivate="handleDeactivate(rule)"
          @duplicate="handleDuplicate(rule)"
          @delete="confirmDelete(rule)"
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
        @update:model-value="loadRules"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showFormDialog" persistent maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div>{{ editingRule ? 'Edit Rule' : 'Create Rule' }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <RuleBuilder
            :editing="!!editingRule"
            :initial-data="editingRule"
            :submitting="saving"
            :error-message="formError"
            :organisation-options="organisationOptions"
            @submit="handleSaveRule"
            @cancel="closeFormDialog"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRulesStore } from '../../stores/rules/rules.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import RuleCard from '../../components/rules/RuleCard.vue'
import RuleStatsOverview from '../../components/rules/RuleStatsOverview.vue'
import RuleBuilder from '../../components/rules/RuleBuilder.vue'
import RuleTestPanel from '../../components/rules/RuleTestPanel.vue'

const $q = useQuasar()
const rulesStore = useRulesStore()

// State
const rules = computed(() => rulesStore.rules || [])
const isLoading = computed(() => rulesStore.isLoading)
const totalPages = computed(() => rulesStore.totalPages || 1)
const currentPage = ref(1)
const saving = ref(false)
const testing = ref(false)
const formError = ref('')

// Dialogs
const showFormDialog = ref(false)
const showTestDialog = ref(false)
const editingRule = ref<any>(null)
const testingRule = ref<any>(null)
const testPanelRef = ref<any>(null)

// Filters
const filters = reactive({
  search: '',
  rule_type: null,
  status: null,
  sortBy: 'created_at',
})

// Options
const typeOptions = [
  'VALIDATION',
  'NOTIFICATION',
  'APPROVAL',
  'ESCALATION',
  'COMPLIANCE',
  'RISK_CALCULATION',
  'BCM_AUTOMATION',
  'WORKFLOW_AUTOMATION',
  'ACCESS_CONTROL',
  'CUSTOM',
]
const statusOptions = ['ACTIVE', 'INACTIVE', 'DRAFT', 'TESTING', 'DEPRECATED']
const sortOptions = [
  { label: 'Created Date', value: 'created_at' },
  { label: 'Name', value: 'name' },
  { label: 'Type', value: 'rule_type' },
  { label: 'Status', value: 'status' },
  { label: 'Executions', value: 'execution_count' },
]
const organisationOptions: Array<{ label: string; value: string }> = []

// Lifecycle
onMounted(() => loadRules())

// Methods
async function loadRules(): Promise<void> {
  await rulesStore.loadRules({
    search: filters.search,
    rule_type: filters.rule_type,
    status: filters.status,
    page: currentPage.value,
  } as any)
}

function openCreateDialog(): void {
  editingRule.value = null
  formError.value = ''
  showFormDialog.value = true
}

function openEditDialog(rule: any): void {
  editingRule.value = rule
  formError.value = ''
  showFormDialog.value = true
}

function closeFormDialog(): void {
  showFormDialog.value = false
  editingRule.value = null
  formError.value = ''
}

async function handleSaveRule(data: any): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (editingRule.value) {
      await rulesStore.updateRule(editingRule.value.uuid, data)
      $q.notify({ type: 'positive', message: 'Rule updated successfully' })
    } else {
      await rulesStore.createRule(data)
      $q.notify({ type: 'positive', message: 'Rule created successfully' })
    }
    closeFormDialog()
    await loadRules()
  } catch (err: any) {
    formError.value = err.response?.data?.message || err.message || 'Failed to save rule'
    $q.notify({ type: 'negative', message: formError.value })
  } finally {
    saving.value = false
  }
}

async function handleActivate(rule: any): Promise<void> {
  try {
    await rulesStore.activateRule(rule.uuid)
    $q.notify({ type: 'positive', message: 'Rule activated' })
    await loadRules()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to activate rule' })
  }
}

async function handleDeactivate(rule: any): Promise<void> {
  try {
    await rulesStore.deactivateRule(rule.uuid)
    $q.notify({ type: 'positive', message: 'Rule deactivated' })
    await loadRules()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to deactivate rule' })
  }
}

async function handleDuplicate(rule: any): Promise<void> {
  $q.dialog({
    title: 'Duplicate Rule',
    message: 'Enter a name for the duplicated rule:',
    prompt: { model: `${rule.name} (Copy)`, type: 'text' },
    cancel: true,
  }).onOk(async (name: string) => {
    try {
      await rulesStore.duplicateRule(rule.uuid, name)
      $q.notify({ type: 'positive', message: 'Rule duplicated' })
      await loadRules()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to duplicate' })
    }
  })
}

function openTestDialog(rule: any): void {
  testingRule.value = rule
  showTestDialog.value = true
}

async function handleTestRule(data: { testData: any }): Promise<void> {
  testing.value = true
  try {
    const result = await rulesStore.testRule({
      conditions: testingRule.value?.conditions || [],
      actions: testingRule.value?.actions || [],
      test_data: data.testData,
    })
    testPanelRef.value?.setResult(result)
  } catch (err: any) {
    testPanelRef.value?.setResult({ success: false, error: err.message })
  } finally {
    testing.value = false
  }
}

function confirmDelete(rule: any): void {
  $q.dialog({
    title: 'Delete Rule',
    message: `Are you sure you want to delete "${rule.name}"? This cannot be undone.`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await rulesStore.deleteRule(rule.uuid)
      $q.notify({ type: 'positive', message: 'Rule deleted' })
      await loadRules()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete' })
    }
  })
}
</script>
