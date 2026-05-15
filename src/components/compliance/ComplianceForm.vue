<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        {{ editing ? 'Edit Compliance Record' : 'Add Compliance Record' }}
      </div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-select
          v-model="form.organisation_id"
          :options="organisationOptions"
          label="Organisation *"
          outlined
          dense
          :rules="[requiredRule]"
          emit-value
          map-options
          :disable="editing"
        />

        <q-select
          v-model="form.compliance_standard"
          :options="standardOptions"
          label="Compliance Standard *"
          outlined
          dense
          :rules="[requiredRule]"
          emit-value
          map-options
          :disable="editing"
        />

        <q-select
          v-model="form.compliance_status"
          :options="statusOptions"
          label="Compliance Status *"
          outlined
          dense
          :rules="[requiredRule]"
          emit-value
          map-options
        />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model="form.last_audit_date"
              label="Last Audit Date *"
              type="date"
              outlined
              dense
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.next_audit_due"
              label="Next Audit Due *"
              type="date"
              outlined
              dense
              :rules="[requiredRule, futureDateRule]"
              hint="Must be after last audit date"
            />
          </div>
        </div>

        <q-input
          v-model="evidenceInput"
          label="Evidence Links"
          outlined
          dense
          type="textarea"
          rows="2"
          placeholder="Enter URLs separated by commas"
          hint="Optional: Links to compliance evidence documents"
        />

        <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
          {{ errorMessage }}
        </q-banner>

        <div class="row q-gutter-md">
          <div class="col">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col">
            <q-btn
              type="submit"
              color="primary"
              :label="editing ? 'Update' : 'Create'"
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
import { ref, reactive, watch } from 'vue'

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
  organisation_id: '',
  compliance_standard: '',
  compliance_status: 'Partially',
  last_audit_date: '',
  next_audit_due: '',
  evidence_links: [] as string[],
})

const evidenceInput = ref('')

const standardOptions = [
  { label: 'ISO 22301', value: 'ISO22301' },
  { label: 'NIST 800-34', value: 'NIST800-34' },
  { label: 'FFIEC', value: 'FFIEC' },
  { label: 'COBIT 2019', value: 'COBIT2019' },
]

const statusOptions = [
  { label: 'Compliant', value: 'Compliant' },
  { label: 'Partially Compliant', value: 'Partially' },
  { label: 'Non-Compliant', value: 'NonCompliant' },
]

const requiredRule = (val: any) => !!val || 'Required'
const futureDateRule = (val: string) => {
  if (!val || !form.last_audit_date) return true
  return new Date(val) > new Date(form.last_audit_date) || 'Must be after last audit date'
}

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.organisation_id = data.organisation_id || ''
      form.compliance_standard = data.compliance_standard || ''
      form.compliance_status = data.compliance_status || 'Partially'
      form.last_audit_date = data.last_audit_date || ''
      form.next_audit_due = data.next_audit_due || ''
      form.evidence_links = data.evidence_links || []
      evidenceInput.value = (data.evidence_links || []).join(', ')
    }
  },
  { immediate: true }
)

function handleSubmit(): void {
  // Parse evidence links from comma-separated input
  const links = evidenceInput.value
    .split(',')
    .map((link) => link.trim())
    .filter(Boolean)

  emit('submit', {
    ...form,
    evidence_links: links,
  })
}
</script>
