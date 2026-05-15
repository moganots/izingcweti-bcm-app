<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 450px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Export Audit Logs</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleExport" class="q-gutter-md">
          <q-select
            v-model="form.audit_category"
            :options="categoryOptions"
            label="Category (Optional)"
            outlined
            dense
            clearable
          />
          <q-input
            v-model="form.start_date"
            label="Start Date (Optional)"
            type="date"
            outlined
            dense
            clearable
          />
          <q-input
            v-model="form.end_date"
            label="End Date (Optional)"
            type="date"
            outlined
            dense
            clearable
          />
          <q-select
            v-model="form.format"
            :options="formatOptions"
            label="Export Format"
            outlined
            dense
            emit-value
            map-options
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" v-close-popup />
        <q-btn
          color="primary"
          icon="download"
          label="Export"
          :loading="exporting"
          @click="handleExport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    exporting?: boolean
  }>(),
  {
    exporting: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  export: [
    data: { audit_category?: string; start_date?: string; end_date?: string; format: string }
  ]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const form = reactive({
  audit_category: null,
  start_date: '',
  end_date: '',
  format: 'csv',
})

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
const formatOptions = [
  { label: 'CSV', value: 'csv' },
  { label: 'JSON', value: 'json' },
]

function handleExport(): void {
  emit('export', { ...form })
}
</script>
