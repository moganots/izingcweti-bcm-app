<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          Pending Workflows
          <q-badge v-if="count > 0" color="orange" class="q-ml-sm">{{ count }}</q-badge>
        </div>
        <q-btn flat color="primary" label="View All" to="/workflows" dense no-caps />
      </div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else-if="workflows.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="check_circle" size="40px" color="green" class="q-mb-sm" />
        <div>No pending workflows</div>
      </div>
      <q-list v-else separator>
        <q-item
          v-for="workflow in workflows"
          :key="workflow.uuid"
          clickable
          v-ripple
          @click="$router.push(`/workflows/${workflow.uuid}`)"
        >
          <q-item-section avatar>
            <q-icon
              :name="getStateIcon(workflow.workflow_state)"
              :color="getStateColor(workflow.workflow_state)"
              size="24px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ workflow.title }}</q-item-label>
            <q-item-label caption
              >{{ workflow.workflow_type }} | {{ workflow.workflow_state }}</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="getPriorityColor(workflow.priority)"
              :label="'P' + workflow.priority"
            />
            <div v-if="workflow.due_date" class="text-caption text-grey-6 q-mt-xs">
              {{ formatDate(workflow.due_date) }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'

const props = withDefaults(defineProps<{ workflows?: any[]; loading?: boolean }>(), {
  workflows: () => [],
  loading: false,
})

const count = computed(() => props.workflows.length)

function getStateIcon(state: string): string {
  const icons: Record<string, string> = { Submitted: 'send', InReview: 'visibility', Draft: 'edit' }
  return icons[state] || 'circle'
}

function getStateColor(state: string): string {
  const colors: Record<string, string> = { Submitted: 'blue', InReview: 'orange', Draft: 'grey' }
  return colors[state] || 'grey'
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'blue',
    5: 'grey',
  }
  return colors[priority] || 'grey'
}
</script>
