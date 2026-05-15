<template>
  <q-card class="test-card" flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getTypeColor(test.exercise_test_type)"
          :label="test.exercise_test_type"
          class="q-px-sm q-py-xs"
        />
        <q-icon
          :name="test.passed ? 'check_circle' : 'schedule'"
          :color="test.passed ? 'green' : 'orange'"
          size="24px"
        />
      </div>

      <div class="text-h6 q-mb-xs">
        {{ test.business_continuity_plan?.critical_function?.name }}
      </div>
      <div class="text-grey-7 text-body2 q-mb-sm">{{ formatDate(test.date) }}</div>

      <q-separator class="q-mb-sm" />

      <div class="row items-center q-mb-sm">
        <q-icon name="people" size="20px" color="grey" class="q-mr-sm" />
        <span>{{ test.participants?.length || 0 }} participants</span>
      </div>

      <div v-if="test.passed" class="bg-green-1 q-pa-sm rounded-borders">
        <div class="text-green-8 text-caption font-weight-bold">Lessons Learned:</div>
        <div class="text-body2">{{ truncateText(test.lessons_learned, 100) }}</div>
      </div>

      <div v-if="test.corrective_actions" class="bg-orange-1 q-pa-sm rounded-borders q-mt-sm">
        <div class="text-orange-8 text-caption font-weight-bold">Corrective Actions:</div>
        <div class="text-body2">{{ truncateText(test.corrective_actions, 100) }}</div>
      </div>
    </q-card-section>

    <q-card-actions v-if="!test.passed" align="right">
      <q-btn
        flat
        color="green"
        icon="check"
        label="Record Result"
        @click="$emit('record-result', test)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

defineProps<{ test: any }>()
defineEmits<{ 'record-result': [test: any] }>()

function getTypeColor(type: string): string {
  const colors: Record<string, string> = { Tabletop: 'blue', Walkthrough: 'orange', Full: 'red' }
  return colors[type] || 'grey'
}

function truncateText(text: string, max: number): string {
  return text?.length > max ? text.substring(0, max) + '...' : text || ''
}
</script>
