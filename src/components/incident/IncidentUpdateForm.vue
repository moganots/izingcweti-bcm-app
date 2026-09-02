<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Update Incident</div>
        <div class="text-subtitle2 text-grey-7">{{ incident?.incidentTitle || incident?.root_cause }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.updateText"
            label="Update *"
            outlined
            dense
            type="textarea"
            rows="4"
            :rules="[requiredRule]"
            placeholder="Describe the current status, actions taken, or new information..."
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Status (Optional)"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.severity"
                :options="severityOptions"
                label="Severity (Optional)"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>
          </div>

          <q-input
            v-model="form.notes"
            label="Additional Notes"
            outlined
            dense
            type="textarea"
            rows="2"
            placeholder="Any additional context..."
          />

          <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
            {{ errorMessage }}
          </q-banner>

          <div class="row q-gutter-md">
            <div class="col">
              <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup @click="$emit('cancel')" />
            </div>
            <div class="col">
              <q-btn
                type="submit"
                color="primary"
                icon="edit"
                label="Update"
                :loading="submitting"
                class="full-width"
                unelevated
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import {
  IncidentStatus,
  IncidentSeverity,
  getIncidentStatusLabel,
  getIncidentSeverityLabel,
} from './../../models/entities/incident/incident.entity'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    incident?: any
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    incident: null,
    submitting: false,
    errorMessage: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
  cancel: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const form = reactive({
  updateText: '',
  status: null as string | null,
  severity: null as string | null,
  notes: '',
})

const statusOptions = Object.values(IncidentStatus).map((value) => ({
  label: getIncidentStatusLabel(value),
  value,
}))

const severityOptions = Object.values(IncidentSeverity).map((value) => ({
  label: getIncidentSeverityLabel(value),
  value,
}))

const requiredRule = (val: any) => !!val || 'This field is required'

function handleSubmit(): void {
  if (!form.updateText) return
  emit('submit', { ...form })
}
</script>