<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Gap Analysis</div>

      <div v-if="!gaps || gaps.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="check_circle" size="40px" color="green" class="q-mb-sm" />
        <div>No compliance gaps identified</div>
      </div>

      <q-list v-else separator>
        <q-item v-for="(gap, index) in gaps" :key="index">
          <q-item-section avatar>
            <q-icon :name="getPriorityIcon(gap.priority)" :color="getPriorityColor(gap.priority)" size="24px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ gap.requirement }}</q-item-label>
            <q-item-label caption>
              Current: {{ gap.currentStatus }} → Target: {{ gap.targetStatus }}
            </q-item-label>
            <div class="q-mt-sm">
              <div v-for="(action, ai) in gap.actionItems" :key="ai" class="text-caption text-grey-7">
                • {{ action }}
              </div>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="getPriorityColor(gap.priority)" :label="gap.priority" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  gaps?: Array<{
    requirement: string
    currentStatus: string
    targetStatus: string
    actionItems: string[]
    priority: 'high' | 'medium' | 'low'
  }>
}>()

function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = { high: 'error', medium: 'warning', low: 'info' }
  return icons[priority] || 'circle'
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = { high: 'red', medium: 'orange', low: 'blue' }
  return colors[priority] || 'grey'
}
</script>
