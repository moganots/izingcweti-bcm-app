<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 450px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Assign Incident</div>
        <div class="text-subtitle2 text-grey-7">{{ incident?.incidentTitle || incident?.root_cause }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-select
            v-model="form.assignedTo"
            :options="userOptions"
            label="Assign To *"
            outlined
            dense
            :rules="[requiredRule]"
            emit-value
            map-options
            use-input
            @filter="filterUsers"
          />

          <q-input
            v-model="form.notes"
            label="Assignment Notes"
            outlined
            dense
            type="textarea"
            rows="2"
            placeholder="Instructions or context for the assignee..."
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
                icon="assignment"
                label="Assign"
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

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    incident?: any
    users?: any[]
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    incident: null,
    users: () => [],
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
  assignedTo: null as string | null,
  notes: '',
})

const userOptions = computed(() =>
  props.users.map((u: any) => ({
    label: u.email || u.name || 'Unknown User',
    value: u.id || u.uuid,
  }))
)

const requiredRule = (val: any) => !!val || 'This field is required'

function filterUsers(_val: string, update: (fn: () => void) => void): void {
  // Filter logic would be handled by parent component
  update(() => {})
}

function handleSubmit(): void {
  if (!form.assignedTo) return
  emit('submit', { ...form })
}
</script>