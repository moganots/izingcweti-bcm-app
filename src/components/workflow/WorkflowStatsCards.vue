<template>
  <div class="workflow-stats">
    <div class="row q-col-gutter-md">
      <div class="col-4 col-md-2" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
            <div class="text-h5" :class="'text-' + stat.color">{{ stat.value }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ workflows?: any[] }>()

const stats = computed(() => {
  const data = props.workflows || []
  return [
    { label: 'Total', value: data.length, color: 'primary' },
    {
      label: 'Draft',
      value: data.filter((w: any) => w.workflow_state === 'Draft').length,
      color: 'grey',
    },
    {
      label: 'Pending',
      value: data.filter((w: any) => ['Submitted', 'InReview'].includes(w.workflow_state)).length,
      color: 'orange',
    },
    {
      label: 'Approved',
      value: data.filter((w: any) => w.workflow_state === 'Approved').length,
      color: 'green',
    },
    {
      label: 'Overdue',
      value: data.filter(
        (w: any) => w.due_date && new Date(w.due_date) < new Date() && !w.completed_at
      ).length,
      color: 'red',
    },
    {
      label: 'Completed',
      value: data.filter((w: any) => w.workflow_state === 'Completed').length,
      color: 'blue',
    },
  ]
})
</script>
