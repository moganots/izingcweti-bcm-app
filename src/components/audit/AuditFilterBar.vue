<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.action"
            :options="actionOptions"
            outlined
            dense
            label="Action"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.audit_category"
            :options="categoryOptions"
            outlined
            dense
            label="Category"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.severity"
            :options="severityOptions"
            outlined
            dense
            label="Severity"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.entity_type"
            :options="entityOptions"
            outlined
            dense
            label="Entity Type"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
      </div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.start_date"
            outlined
            dense
            type="date"
            label="Start Date"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.end_date"
            outlined
            dense
            type="date"
            label="End Date"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.user_id"
            outlined
            dense
            label="User ID"
            clearable
            @update:model-value="$emit('filter-change', filters)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const filters = reactive({
  action: null,
  audit_category: null,
  severity: null,
  entity_type: null,
  start_date: '',
  end_date: '',
  user_id: '',
})

defineEmits<{ 'filter-change': [filters: any] }>()

const actionOptions = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
  'SYNC',
  'CONFLICT_RESOLVE',
]
const categoryOptions = [
  'USER_ACTIVITY',
  'SYSTEM_EVENT',
  'SECURITY',
  'DATA_CHANGE',
  'ACCESS_CONTROL',
  'WORKFLOW',
  'COMPLIANCE',
  'SYNC',
  'CONFIGURATION',
]
const severityOptions = ['INFO', 'WARNING', 'ERROR', 'CRITICAL']
const entityOptions = [
  'incident',
  'risk',
  'bcp',
  'workflow',
  'document',
  'compliance',
  'user',
  'organisation',
]
</script>
