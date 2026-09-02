<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ editing ? 'Edit Incident' : 'Report New Incident' }}</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-select
          v-model="form.incident_severity"
          :options="severityOptions"
          label="Severity *"
          outlined
          dense
          :rules="[requiredRule]"
          emit-value
          map-options
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          v-model="form.root_cause"
          label="Root Cause *"
          outlined
          dense
          :rules="[requiredRule]"
          autocomplete="off"
        />

        <q-select
          v-model="form.bcp_id"
          :options="bcpOptions"
          label="Activated BCP"
          outlined
          dense
          emit-value
          map-options
          clearable
        />

        <q-input
          v-model="form.recovery_actual_time"
          label="Recovery Actual Time"
          outlined
          dense
          placeholder="e.g., 3 hours"
          hint="Estimated or actual time to recover"
        />

        <q-input
          v-model="form.notes"
          label="Additional Notes"
          outlined
          dense
          type="textarea"
          rows="3"
        />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="negative"
              :label="editing ? 'Update Incident' : 'Report Incident'"
              :loading="submitting"
              class="full-width"
              unelevated
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    editing?: boolean
    initialData?: any
    bcps?: any[]
    submitting?: boolean
  }>(),
  {
    editing: false,
    initialData: null,
    bcps: () => [],
    submitting: false,
  }
)

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const form = reactive({
  incident_severity: props.initialData?.incident_severity || '',
  root_cause: props.initialData?.root_cause || '',
  bcp_id: props.initialData?.business_continuity_plan_id_activated || '',
  recovery_actual_time: props.initialData?.recovery_actual_time || '',
  notes: '',
})

const severityOptions = [
  { label: 'Critical', value: 'Critical', icon: 'error', color: 'red' },
  { label: 'High', value: 'High', icon: 'warning', color: 'orange' },
  { label: 'Medium', value: 'Medium', icon: 'info', color: 'yellow' },
  { label: 'Low', value: 'Low', icon: 'notifications', color: 'green' },
  { label: 'Informational', value: 'Informational', icon: 'info', color: 'blue' },
]

const bcpOptions = computed(() =>
  props.bcps.map((b: any) => ({
    label: b.critical_function?.name || 'Unknown BCP',
    value: b.uuid,
  }))
)

const requiredRule = (val: any) => !!val || 'This field is required'

function handleSubmit(): void {
  if (!form.incident_severity || !form.root_cause) return
  emit('submit', { ...form })
}
</script>
