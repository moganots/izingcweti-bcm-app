<template>
  <div class="document-stats">
    <div class="row q-col-gutter-md">
      <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
            <q-icon :name="stat.icon" :color="stat.color" size="28px" class="q-mb-sm" />
            <div class="text-h4" :class="'text-' + stat.color">{{ stat.value }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatFileSize } from 'src/utils/formatters'
import { computed } from 'vue'

const props = defineProps<{ documents?: any[] }>()

const stats = computed(() => {
  const data = props.documents || []
  const totalSize = data.reduce((sum, d) => sum + (d.file_size || 0), 0)
  const totalDownloads = data.reduce((sum, d) => sum + (d.download_count || 0), 0)

  return [
    { label: 'Total', value: data.length, color: 'primary', icon: 'folder' },
    {
      label: 'Published',
      value: data.filter((d) => d.status === 'PUBLISHED').length,
      color: 'green',
      icon: 'publish',
    },
    {
      label: 'Under Review',
      value: data.filter((d) => d.status === 'UNDER_REVIEW').length,
      color: 'orange',
      icon: 'visibility',
    },
    {
      label: 'Drafts',
      value: data.filter((d) => d.status === 'DRAFT').length,
      color: 'grey',
      icon: 'edit',
    },
    { label: 'Total Size', value: formatFileSize(totalSize), color: 'blue', icon: 'storage' },
    { label: 'Downloads', value: totalDownloads, color: 'info', icon: 'download' },
  ]
})
</script>
