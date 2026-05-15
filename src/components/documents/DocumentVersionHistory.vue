<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Version History</div>

      <div v-if="!versions || versions.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="history" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No previous versions</div>
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="(version, index) in sortedVersions"
          :key="version.version_number"
          :icon="index === 0 ? 'star' : 'history'"
          :color="index === 0 ? 'primary' : 'grey'"
          :title="'Version ' + version.version_number"
          :subtitle="formatDate(version.archived_at || version.created_at)"
        >
          <div class="row q-col-gutter-sm text-caption">
            <div class="col-6"><strong>File:</strong> {{ version.file_name }}</div>
            <div class="col-6"><strong>Size:</strong> {{ formatFileSize(version.file_size) }}</div>
          </div>
          <q-badge
            v-if="version.checksum"
            outline
            color="grey"
            :label="'Checksum: ' + version.checksum.substring(0, 8)"
            class="q-mt-sm"
          />
          <div class="q-mt-sm">
            <q-btn
              v-if="index > 0"
              flat
              dense
              color="primary"
              icon="restore"
              label="Restore"
              size="sm"
              @click="$emit('restore', version)"
            />
            <q-btn
              flat
              dense
              color="primary"
              icon="download"
              label="Download"
              size="sm"
              @click="$emit('download-version', version)"
              class="q-ml-sm"
            />
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'
import { formatFileSize } from '../../utils/formatters'

const props = defineProps<{
  versions?: any[]
  currentVersion?: number
}>()

defineEmits<{
  restore: [version: any]
  'download-version': [version: any]
}>()

const sortedVersions = computed(() => {
  if (!props.versions) return []
  return [...props.versions].sort((a, b) => b.version_number - a.version_number)
})
</script>
