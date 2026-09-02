<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 450px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Duplicate Rule</div>
        <div class="text-subtitle2 text-grey-7">{{ rule?.name }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.newName"
            label="New Rule Name *"
            outlined
            dense
            :rules="[requiredRule]"
            hint="Enter a unique name for the duplicated rule"
            autofocus
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-toggle
                v-model="form.copyConditions"
                label="Copy Conditions"
                color="primary"
              />
            </div>
            <div class="col-6">
              <q-toggle
                v-model="form.copyActions"
                label="Copy Actions"
                color="primary"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-toggle
                v-model="form.copySchedule"
                label="Copy Schedule"
                color="primary"
              />
            </div>
            <div class="col-6">
              <q-toggle
                v-model="form.copyMetadata"
                label="Copy Metadata"
                color="primary"
              />
            </div>
          </div>

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
                icon="content_copy"
                label="Duplicate"
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
    rule?: any
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    rule: null,
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
  newName: props.rule?.name ? `${props.rule.name} (Copy)` : '',
  copyConditions: true,
  copyActions: true,
  copySchedule: true,
  copyMetadata: false,
})

const requiredRule = (val: any) => !!val || 'This field is required'

function handleSubmit(): void {
  if (!form.newName) return
  emit('submit', { ...form })
}
</script>