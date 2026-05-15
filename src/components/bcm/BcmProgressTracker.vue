<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">BCM Lifecycle Progress</div>
      <q-stepper v-model="currentStep" vertical color="primary" animated>
        <q-step
          v-for="step in steps"
          :key="step.name"
          :name="step.name"
          :title="step.title"
          :caption="step.caption"
          :done="step.completed"
          :error="step.hasError"
          :icon="step.icon"
          :color="step.completed ? 'green' : 'primary'"
        >
          <div v-if="step.description" class="q-mb-sm">{{ step.description }}</div>
          <q-btn
            v-if="!step.completed && step.action"
            :label="step.actionLabel"
            :color="step.actionColor || 'primary'"
            :icon="step.actionIcon"
            flat
            @click="$emit('navigate', step.action)"
          />
        </q-step>
      </q-stepper>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  functionId?: string
  hasBIA?: boolean
  hasBCP?: boolean
  hasStrategies?: boolean
  hasTests?: boolean
}>()

defineEmits<{ navigate: [route: string] }>()

const steps = computed(() => [
  {
    name: 'function',
    title: 'Critical Function',
    caption: 'Identify critical business function',
    icon: 'functions',
    completed: !!props.functionId,
    description: 'Define MTO and WRT for the function',
    action: '/bcm/critical-functions',
    actionLabel: 'Define Function',
    actionIcon: 'add',
    hasError: false,
    actionColor: 'primary'
  },
  {
    name: 'bia',
    title: 'Business Impact Analysis',
    caption: 'Assess business impact',
    icon: 'assessment',
    completed: props.hasBIA,
    description: 'Analyze financial, operational, and regulatory impact',
    action: '/bcm/bia',
    actionLabel: 'Complete BIA',
    actionIcon: 'assessment',
    hasError: false,
    actionColor: 'primary'
  },
  {
    name: 'bcp',
    title: 'Business Continuity Plan',
    caption: 'Develop continuity plan',
    icon: 'description',
    completed: props.hasBCP,
    description: 'Create plan with emergency contacts and procedures',
    action: '/bcm/bcp',
    actionLabel: 'Create BCP',
    actionIcon: 'description',
    hasError: false,
    actionColor: 'primary'
  },
  {
    name: 'strategy',
    title: 'Recovery Strategies',
    caption: 'Define recovery strategies',
    icon: 'restore',
    completed: props.hasStrategies,
    description: 'Design recovery approaches with cost estimates',
    action: '/bcm/recovery-strategies',
    actionLabel: 'Add Strategy',
    actionIcon: 'restore',
    hasError: false,
    actionColor: 'primary'
  },
  {
    name: 'test',
    title: 'Exercise Tests',
    caption: 'Test and validate plans',
    icon: 'playlist_add_check',
    completed: props.hasTests,
    description: 'Conduct tests and document lessons learned',
    action: '/bcm/exercise-tests',
    actionLabel: 'Schedule Test',
    actionIcon: 'playlist_add_check',
    hasError: false,
    actionColor: 'primary'
  },
])

const currentStep = computed(() => {
  if (!props.functionId) return 'function'
  if (!props.hasBIA) return 'bia'
  if (!props.hasBCP) return 'bcp'
  if (!props.hasStrategies) return 'strategy'
  if (!props.hasTests) return 'test'
  return 'test'
})
</script>
