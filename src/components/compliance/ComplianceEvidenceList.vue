<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          <q-icon name="attach_file" size="sm" class="q-mr-sm" />Evidence
          <q-badge v-if="items!?.length > 0" color="primary" class="q-ml-sm">{{
            items!?.length
          }}</q-badge>
        </div>
        <q-btn color="primary" icon="add" label="Add Evidence" unelevated @click="$emit('add')" />
      </div>

      <div v-if="!items || items.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="folder_open" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No evidence attached</div>
      </div>

      <q-list v-else separator>
        <q-item v-for="(item, index) in items" :key="index">
          <q-item-section avatar>
            <q-icon :name="getFileIcon(item)" color="primary" size="22px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ getFileName(item) }}</q-item-label>
            <q-item-label caption>{{ getFileDescription(item) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="q-gutter-xs">
              <q-btn flat round size="sm" icon="visibility" @click="$emit('view', item)">
                <q-tooltip>View</q-tooltip>
              </q-btn>
              <q-btn flat round size="sm" icon="download" @click="$emit('download', item)">
                <q-tooltip>Download</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                size="sm"
                icon="delete"
                color="negative"
                @click="$emit('remove', item, index)"
              >
                <q-tooltip>Remove</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ items?: any[] }>()
defineEmits<{
  add: []
  view: [item: any]
  download: [item: any]
  remove: [item: any, index: number]
}>()

function getFileIcon(item: any): string {
  const url = typeof item === 'string' ? item : item.url || ''
  if (url.includes('.pdf')) return 'picture_as_pdf'
  if (url.includes('.doc')) return 'description'
  if (url.includes('.xls')) return 'table_chart'
  return 'insert_drive_file'
}

function getFileName(item: any): string {
  if (typeof item === 'string') {
    const parts = item.split('/')
    return parts[parts.length - 1] || 'Evidence File'
  }
  return item.name || item.title || 'Evidence File'
}

function getFileDescription(item: any): string {
  if (typeof item === 'string') return item
  return item.description || item.url || ''
}
</script>
