<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Schedule Rule</div>
        <div class="text-subtitle2 text-grey-7">{{ rule?.name }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.cron"
            label="Cron Expression *"
            outlined
            dense
            :rules="[requiredRule]"
            placeholder="0 0 * * *"
            hint="Minute Hour Day Month DayOfWeek"
          >
            <template v-slot:append>
              <q-btn flat dense icon="help" @click="showCronHelp = true">
                <q-tooltip>Cron Help</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <q-select
            v-model="form.timezone"
            :options="timezoneOptions"
            label="Timezone *"
            outlined
            dense
            :rules="[requiredRule]"
            emit-value
            map-options
            use-input
            @filter="filterTimezones"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.startDate"
                label="Start Date (Optional)"
                type="date"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.endDate"
                label="End Date (Optional)"
                type="date"
                outlined
                dense
                clearable
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
                icon="schedule"
                label="Set Schedule"
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
import { ref, reactive, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    rule?: any
    schedule?: any
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    rule: null,
    schedule: null,
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

const showCronHelp = ref(false)

const form = reactive({
  cron: props.schedule?.cron || '',
  timezone: props.schedule?.timezone || 'UTC',
  startDate: props.schedule?.startDate || '',
  endDate: props.schedule?.endDate || '',
})

const timezoneOptions = ref([
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
].map((tz) => ({ label: tz, value: tz })))

const requiredRule = (val: any) => !!val || 'This field is required'

function filterTimezones(val: string, update: (fn: () => void) => void): void {
  update(() => {
    const needle = val.toLowerCase()
    timezoneOptions.value = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Dubai',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Pacific/Auckland',
    ]
      .filter((tz) => tz.toLowerCase().includes(needle))
      .map((tz) => ({ label: tz, value: tz }))
  })
}

function handleSubmit(): void {
  if (!form.cron || !form.timezone) return
  emit('submit', { ...form })
}
</script>