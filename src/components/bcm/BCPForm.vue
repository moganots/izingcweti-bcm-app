<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 700px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit' : 'Create' }} Business Continuity Plan</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <!-- Function Selection -->
          <q-select
            v-model="form.function_id"
            :options="functionOptions"
            label="Critical Function"
            outlined
            dense
            emit-value
            map-options
            :rules="[requiredRule]"
            :disable="isEditing"
          />

          <!-- Plan Details -->
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.plan_status"
                :options="statusOptions"
                label="Plan Status"
                outlined
                dense
                emit-value
                map-options
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.version"
                label="Version"
                outlined
                dense
                type="number"
                :rules="[requiredRule, positiveRule]"
              />
            </div>
          </div>

          <!-- Dates -->
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="form.review_due_date" label="Review Due Date" type="date" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.approval_date" label="Approval Date" type="date" outlined dense />
            </div>
          </div>

          <!-- Emergency Contacts -->
          <div class="text-subtitle1 q-mt-md q-mb-sm">Emergency Contacts</div>
          <div
            v-for="(contact, index) in form.emergency_contacts"
            :key="index"
            class="row q-col-gutter-md q-mb-sm"
          >
            <div class="col-4">
              <q-input v-model="contact.name" label="Name" outlined dense />
            </div>
            <div class="col-3">
              <q-input v-model="contact.role" label="Role" outlined dense />
            </div>
            <div class="col-3">
              <q-input v-model="contact.phone" label="Phone" outlined dense type="tel" />
            </div>
            <div class="col-2">
              <q-btn
                flat
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="removeContact(index)"
              />
            </div>
          </div>
          <q-btn
            flat
            color="primary"
            icon="add"
            label="Add Contact"
            size="sm"
            @click="addContact"
          />

          <!-- Plan Document -->
          <div class="text-subtitle1 q-mt-md q-mb-sm">Plan Document</div>
          <q-input
            v-model="form.plan_document_url"
            label="Document URL"
            outlined
            dense
            type="url"
          />
          <q-file
            v-model="form.plan_document"
            label="Upload Plan Document"
            outlined
            dense
            accept=".pdf,.doc,.docx"
            max-file-size="10485760"
          />

          <!-- Additional Info -->
          <q-input
            v-model="form.additional_notes"
            label="Additional Notes"
            type="textarea"
            outlined
            dense
            rows="3"
          />

          <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
            {{ errorMessage }}
          </q-banner>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" v-close-popup @click="$emit('cancel')" />
        <q-btn
          color="primary"
          :label="isEditing ? 'Update' : 'Create'"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    bcpData?: any
    functions?: any[]
    loading?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    bcpData: null,
    functions: () => [],
    loading: false,
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

const isEditing = computed(() => !!props.bcpData?.id)

const form = reactive({
  function_id: null as string | null,
  plan_status: 'Draft',
  version: 1,
  review_due_date: '',
  approval_date: '',
  emergency_contacts: [] as any[],
  plan_document_url: '',
  plan_document: null as File | null,
  additional_notes: '',
})

watch(
  () => props.bcpData,
  (data) => {
    if (data) {
      Object.assign(form, data)
      if (!form.emergency_contacts || form.emergency_contacts.length === 0) {
        form.emergency_contacts = [{ name: '', role: '', phone: '' }]
      }
    }
  },
  { immediate: true }
)

const functionOptions = computed(() =>
  props.functions.map((f) => ({ label: f.name, value: f.id }))
)

const statusOptions = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Active', value: 'Active' },
  { label: 'Archived', value: 'Archived' },
]

const requiredRule = (val: any) => !!val || 'This field is required'
const positiveRule = (val: number) => val > 0 || 'Must be positive'

function addContact(): void {
  form.emergency_contacts.push({ name: '', role: '', phone: '' })
}

function removeContact(index: number): void {
  form.emergency_contacts.splice(index, 1)
}

function handleSubmit(): void {
  if (!form.function_id || !form.plan_status) return
  emit('submit', { ...form })
}
</script>