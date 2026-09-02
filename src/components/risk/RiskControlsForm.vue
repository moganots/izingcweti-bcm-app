<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 600px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Mitigation Controls</div>
        <div class="text-subtitle2 text-grey-7">{{ risk?.title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <!-- Existing Controls -->
          <div v-if="existingControls.length > 0" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Current Controls</div>
            <q-list bordered dense>
              <q-item v-for="(control, index) in existingControls" :key="index">
                <q-item-section avatar>
                  <q-icon name="shield" color="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ control.controlName || control.control_name }}</q-item-label>
                  <q-item-label caption>
                    Effectiveness: {{ formatPercentage((control.effectiveness || 0) * 100) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    size="sm"
                    icon="delete"
                    color="negative"
                    @click="removeControl(index)"
                  >
                    <q-tooltip>Remove</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Add New Control -->
          <div class="text-subtitle2 q-mb-sm">Add New Control</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="newControl.name"
                label="Control Name *"
                outlined
                dense
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="newControl.description"
                label="Description"
                outlined
                dense
                type="textarea"
                rows="2"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="newControl.effectiveness"
                label="Effectiveness (0-1) *"
                type="number"
                outlined
                dense
                min="0"
                max="1"
                step="0.01"
                :rules="[requiredRule, effectivenessRule]"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="newControl.status"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <q-btn
            color="primary"
            icon="add"
            label="Add Control"
            class="full-width"
            outline
            @click="addControl"
            :disable="!newControl.name || !newControl.effectiveness"
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
                label="Save Controls"
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
import { ref, reactive, computed, watch } from 'vue'
import { formatPercentage } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    risk?: any
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    risk: null,
    submitting: false,
    errorMessage: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [controls: any[]]
  cancel: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const existingControls = ref<any[]>([])
const newControl = reactive({
  name: '',
  description: '',
  effectiveness: 0,
  status: 'active',
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Review', value: 'review' },
]

const requiredRule = (val: any) => !!val || 'This field is required'
const effectivenessRule = (val: number) => 
  (val >= 0 && val <= 1) || 'Must be between 0 and 1'

watch(
  () => props.risk,
  (risk) => {
    if (risk) {
      existingControls.value = risk.mitigatingControls || risk.mitigating_controls || []
    }
  },
  { immediate: true }
)

function addControl(): void {
  if (!newControl.name || !newControl.effectiveness) return
  existingControls.value.push({
    controlName: newControl.name,
    control_id: Date.now().toString(),
    description: newControl.description,
    effectiveness: newControl.effectiveness,
    status: newControl.status,
    implementedDate: new Date().toISOString(),
  })
  newControl.name = ''
  newControl.description = ''
  newControl.effectiveness = 0
  newControl.status = 'active'
}

function removeControl(index: number): void {
  existingControls.value.splice(index, 1)
}

function handleSubmit(): void {
  emit('submit', existingControls.value)
}
</script>