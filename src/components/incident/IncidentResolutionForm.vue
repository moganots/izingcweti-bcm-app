<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Close Incident</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="form.closed_at"
          label="Closed At *"
          outlined
          dense
          type="datetime-local"
          :rules="[requiredRule]"
          :hint="'Current time: ' + currentTime"
        />

        <q-input
          v-model="form.resolution_summary"
          label="Resolution Summary *"
          outlined
          dense
          type="textarea"
          rows="3"
          :rules="[requiredRule]"
          placeholder="Describe how the incident was resolved"
        />

        <q-select
          v-model="form.final_severity"
          :options="severityOptions"
          label="Final Severity Assessment"
          outlined
          dense
          emit-value
          map-options
        />

        <q-input
          v-model="form.lessons_learned"
          label="Lessons Learned"
          outlined
          dense
          type="textarea"
          rows="3"
          placeholder="What can be improved?"
        />

        <q-input
          v-model="form.preventive_actions"
          label="Preventive Actions"
          outlined
          dense
          type="textarea"
          rows="2"
          placeholder="Actions to prevent recurrence"
        />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="green"
              label="Close Incident"
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
import { formatDate } from '../../utils/date.utils'

withDefaults(defineProps<{ submitting?: boolean }>(), { submitting: false })
const emit = defineEmits<{ submit: [data: any]; cancel: [] }>()

const form = reactive({
  closed_at: new Date().toISOString().slice(0, 16),
  resolution_summary: '',
  final_severity: '',
  lessons_learned: '',
  preventive_actions: '',
})

const currentTime = computed(() => formatDate(new Date(), 'MMM DD, YYYY HH:mm'))

const severityOptions = [
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
  { label: 'Informational', value: 'Informational' },
]

const requiredRule = (val: any) => !!val || 'This field is required'

function handleSubmit(): void {
  if (!form.closed_at || !form.resolution_summary) return
  emit('submit', { ...form })
}
</script>
