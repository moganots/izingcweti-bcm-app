<template>
  <q-card class="function-card cursor-pointer" flat bordered @click="$emit('click', func)">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getPriorityColor(func.max_tolerable_outage)"
          :label="'MTO: ' + func.max_tolerable_outage"
          class="q-px-sm q-py-xs"
        />
        <q-btn flat round size="sm" icon="more_vert" @click.stop>
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="$emit('edit', func)">
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('view-bia', func)">
                <q-item-section avatar><q-icon name="assessment" /></q-item-section>
                <q-item-section>View BIA</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', func)">
                <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="text-h6 q-mb-xs">{{ func.name }}</div>
      <p class="text-grey-7 text-body2 q-mb-md">{{ func.department?.name || 'No department' }}</p>

      <q-separator class="q-mb-sm" />

      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <div class="text-caption text-grey-6">Work Recovery Time</div>
          <div class="text-body2 text-weight-medium">{{ func.work_recovery_time }}</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Dependencies</div>
          <div class="text-body2 text-weight-medium">
            {{ func.dependency_ids?.length || 0 }} functions
          </div>
        </div>
      </div>

      <div class="q-mt-sm">
        <q-badge
          :color="func.business_impact_assessment ? 'green' : 'orange'"
          :label="func.business_impact_assessment ? 'BIA Completed' : 'BIA Pending'"
          class="q-px-sm q-py-xs"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ func: any }>()
defineEmits<{
  click: [func: any]
  edit: [func: any]
  'view-bia': [func: any]
  delete: [func: any]
}>()

function getPriorityColor(mto: string): string {
  if (!mto) return 'grey'
  const hours = parseInt(mto)
  if (hours <= 1) return 'red'
  if (hours <= 4) return 'orange'
  if (hours <= 8) return 'yellow'
  return 'green'
}
</script>

<style lang="scss" scoped>
.function-card {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
