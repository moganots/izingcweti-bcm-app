<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ editing ? 'Edit Rule' : 'Create Rule' }}</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <!-- Basic Info -->
        <q-input v-model="form.name" label="Rule Name *" outlined dense :rules="[requiredRule]" autofocus />
        <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2" />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select v-model="form.rule_type" :options="typeOptions" label="Rule Type *" outlined dense
              :rules="[requiredRule]" emit-value map-options />
          </div>
          <div class="col-6">
            <q-select v-model="form.rule_trigger" :options="triggerOptions" label="Trigger *" outlined dense
              :rules="[requiredRule]" emit-value map-options />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select v-model="form.entity_type" :options="entityOptions" label="Entity Type *" outlined dense
              :rules="[requiredRule]" />
          </div>
          <div class="col-6">
            <q-select v-model="form.priority" :options="priorityOptions" label="Priority" outlined dense emit-value
              map-options />
          </div>
        </div>

        <q-select v-model="form.organisation_id" :options="orgOptions" label="Organisation (optional)" outlined dense
          clearable emit-value map-options />

        <!-- Conditions -->
        <q-separator />
        <div class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">Conditions</div>
          <q-btn flat color="primary" icon="add" label="Add Condition" @click="addCondition" />
        </div>
        <div v-if="form.conditions.length === 0" class="text-center q-py-sm text-grey-7 bg-grey-1 rounded-borders">
          No conditions defined. Add at least one condition.
        </div>
        <div v-for="(condition, index) in form.conditions" :key="index"
          class="condition-item q-pa-sm bg-grey-1 rounded-borders">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-4">
              <q-input v-model="condition.field" label="Field" outlined dense size="sm" />
            </div>
            <div class="col-3">
              <q-select v-model="condition.operator" :options="operatorOptions" label="Operator" outlined dense
                size="sm" emit-value map-options />
            </div>
            <div class="col-4">
              <q-input v-model="condition.value" label="Value" outlined dense size="sm" />
            </div>
            <div class="col-1">
              <q-btn flat round color="negative" icon="close" size="sm" @click="removeCondition(index)" />
            </div>
          </div>
          <div v-if="index < form.conditions.length - 1" class="q-mt-sm">
            <q-select v-model="condition.logical_operator" :options="logicalOptions" label="AND/OR" outlined dense
              size="sm" emit-value map-options />
          </div>
        </div>

        <!-- Actions -->
        <q-separator />
        <div class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">Actions</div>
          <q-btn flat color="primary" icon="add" label="Add Action" @click="addAction" />
        </div>
        <div v-if="form.actions.length === 0" class="text-center q-py-sm text-grey-7 bg-grey-1 rounded-borders">
          No actions defined. Add at least one action.
        </div>
        <div v-for="(action, index) in form.actions" :key="index" class="action-item q-pa-sm bg-grey-1 rounded-borders">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-5">
              <q-select v-model="action.type" :options="actionTypeOptions" label="Action Type" outlined dense size="sm"
                emit-value map-options />
            </div>
            <div class="col-6">
              <q-input v-model="action.params" label="Params (JSON)" outlined dense size="sm" />
            </div>
            <div class="col-1">
              <q-btn flat round color="negative" icon="close" size="sm" @click="removeAction(index)" />
            </div>
          </div>
        </div>

        <!-- Error -->
        <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>{{
          errorMessage
        }}</q-banner>

        <!-- Submit -->
        <div class="row q-col-gutter-md q-mt-lg">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn type="submit" color="primary" :label="editing ? 'Update' : 'Create'" :loading="submitting"
              class="full-width" unelevated />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    editing?: boolean
    initialData?: any
    submitting?: boolean
    errorMessage?: string
    organisationOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    editing: false,
    initialData: null,
    submitting: false,
    errorMessage: '',
    organisationOptions: () => [],
  }
)

const emit = defineEmits<{ submit: [data: any]; cancel: [] }>()

const form = reactive({
  name: '',
  description: '',
  rule_type: '',
  rule_trigger: '',
  entity_type: '',
  priority: 2,
  organisation_id: '',
  conditions: [] as any[],
  actions: [] as any[],
})

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.name = data.name || ''
      form.description = data.description || ''
      form.rule_type = data.rule_type || ''
      form.rule_trigger = data.rule_trigger || ''
      form.entity_type = data.entity_type || ''
      form.priority = data.priority || 2
      form.organisation_id = data.organisation_id || ''
      form.conditions = data.conditions?.length ? [...data.conditions] : []
      form.actions = data.actions?.length ? [...data.actions] : []
    }
  },
  { immediate: true }
)

const typeOptions = [
  { label: 'Validation', value: 'VALIDATION' },
  { label: 'Notification', value: 'NOTIFICATION' },
  { label: 'Approval', value: 'APPROVAL' },
  { label: 'Escalation', value: 'ESCALATION' },
  { label: 'Compliance', value: 'COMPLIANCE' },
  { label: 'Risk Calculation', value: 'RISK_CALCULATION' },
  { label: 'BCM Automation', value: 'BCM_AUTOMATION' },
  { label: 'Workflow Automation', value: 'WORKFLOW_AUTOMATION' },
  { label: 'Access Control', value: 'ACCESS_CONTROL' },
  { label: 'Custom', value: 'CUSTOM' },
]

const triggerOptions = [
  { label: 'On Create', value: 'ON_CREATE' },
  { label: 'On Update', value: 'ON_UPDATE' },
  { label: 'On Delete', value: 'ON_DELETE' },
  { label: 'On Status Change', value: 'ON_STATUS_CHANGE' },
  { label: 'On Schedule', value: 'ON_SCHEDULE' },
  { label: 'On Threshold Breach', value: 'ON_THRESHOLD_BREACH' },
  { label: 'On Approval', value: 'ON_APPROVAL' },
  { label: 'On Rejection', value: 'ON_REJECTION' },
  { label: 'On Escalation', value: 'ON_ESCALATION' },
  { label: 'On Sync', value: 'ON_SYNC' },
  { label: 'Manual', value: 'ON_MANUAL' },
]

const entityOptions = [
  'incident',
  'risk',
  'bcp',
  'workflow',
  'document',
  'compliance',
  'notification',
]
const priorityOptions = [
  { label: 'Critical (1)', value: 1 },
  { label: 'High (2)', value: 2 },
  { label: 'Medium (3)', value: 3 },
  { label: 'Low (4)', value: 4 },
]
const orgOptions = computed(() => props.organisationOptions)

const operatorOptions = [
  { label: 'Equals', value: 'EQUALS' },
  { label: 'Not Equals', value: 'NOT_EQUALS' },
  { label: 'Greater Than', value: 'GREATER_THAN' },
  { label: 'Less Than', value: 'LESS_THAN' },
  { label: 'Greater or Equal', value: 'GREATER_THAN_OR_EQUAL' },
  { label: 'Less or Equal', value: 'LESS_THAN_OR_EQUAL' },
  { label: 'Contains', value: 'CONTAINS' },
  { label: 'In', value: 'IN' },
  { label: 'Between', value: 'BETWEEN' },
  { label: 'Exists', value: 'EXISTS' },
  { label: 'Matches Regex', value: 'MATCHES_REGEX' },
]
const logicalOptions = [
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' },
  { label: 'NOT', value: 'NOT' },
]
const actionTypeOptions = [
  { label: 'Set Field', value: 'SET_FIELD' },
  { label: 'Send Notification', value: 'SEND_NOTIFICATION' },
  { label: 'Change Status', value: 'CHANGE_STATUS' },
  { label: 'Calculate Risk', value: 'CALCULATE_RISK' },
  { label: 'Trigger Workflow', value: 'TRIGGER_WORKFLOW' },
  { label: 'Log Event', value: 'LOG_EVENT' },
  { label: 'Escalate', value: 'ESCALATE' },
]

const requiredRule = (val: any) => !!val || 'Required'
function addCondition(): void {
  form.conditions.push({ field: '', operator: 'EQUALS', value: '', logical_operator: 'AND' })
}
function removeCondition(index: number): void {
  form.conditions.splice(index, 1)
}
function addAction(): void {
  form.actions.push({ type: 'SET_FIELD', params: '{}' })
}
function removeAction(index: number): void {
  form.actions.splice(index, 1)
}

function handleSubmit(): void {
  if (
    !form.name ||
    !form.rule_type ||
    !form.rule_trigger ||
    form.conditions.length === 0 ||
    form.actions.length === 0
  )
    return
  emit('submit', { ...form })
}
</script>

<style lang="scss" scoped>
.condition-item,
.action-item {
  border-left: 3px solid var(--q-primary);
  margin-bottom: 8px;
}
</style>
