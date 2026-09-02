<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Cache Entry Detail</div>

      <div v-if="!entry" class="text-center q-py-md text-grey-7">
        Select an entry to view details
      </div>

      <div v-else>
        <q-list separator>
          <q-item>
            <q-item-section>
              <q-item-label caption>Key</q-item-label>
              <q-item-label class="text-weight-medium">{{ entry.key }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round icon="content_copy" size="sm" @click="copyKey" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Status</q-item-label>
              <q-badge :color="isExpired ? 'orange' : 'green'" :label="isExpired ? 'Expired' : 'Active'" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Size</q-item-label>
              <q-item-label>{{ formatFileSize(entry.size_bytes || 0) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Hit Count</q-item-label>
              <q-item-label>{{ entry.hit_count || 0 }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="entry.tags">
            <q-item-section>
              <q-item-label caption>Tags</q-item-label>
              <div class="q-gutter-xs q-mt-xs">
                <q-badge v-for="tag in tagList" :key="tag" outline color="primary" :label="tag" />
              </div>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Created</q-item-label>
              <q-item-label>{{ formatDateTime(entry.created_at) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Last Accessed</q-item-label>
              <q-item-label>{{ formatDateTime(entry.last_accessed_at) || 'Never' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="entry.expires_at">
            <q-item-section>
              <q-item-label caption>Expires</q-item-label>
              <q-item-label :class="isExpired ? 'text-orange' : ''">
                {{ formatDateTime(entry.expires_at) }}
                ({{ isExpired ? 'Expired' : formatTimeAgo(entry.expires_at) }})
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="entry.is_compressed">
            <q-item-section>
              <q-item-label caption>Compression</q-item-label>
              <q-item-label>{{ entry.compression_algorithm || 'gzip' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Value Preview -->
        <q-separator class="q-my-md" />
        <div class="text-subtitle2 q-mb-sm">Cached Value</div>
        <pre class="value-preview">{{ formattedValue }}</pre>

        <!-- Actions -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-6">
            <q-btn color="primary" icon="refresh" label="Refresh TTL" class="full-width" outline
              @click="$emit('refresh', entry)" />
          </div>
          <div class="col-6">
            <q-btn color="negative" icon="delete" label="Delete Entry" class="full-width" outline
              @click="$emit('delete', entry)" />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime, formatTimeAgo } from '../../utils/date.utils'
import { formatFileSize, formatJSON } from '../../utils/formatters'

const props = defineProps<{ entry?: any }>()
defineEmits<{ refresh: [entry: any]; delete: [entry: any] }>()

const isExpired = computed(() => {
  if (!props.entry?.expires_at) return false
  return new Date(props.entry.expires_at) < new Date()
})

const tagList = computed(() => {
  if (!props.entry?.tags) return []
  return props.entry.tags
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean)
})

const formattedValue = computed(() => {
  if (!props.entry?.value) return ''
  try {
    const parsed =
      typeof props.entry.value === 'string' ? JSON.parse(props.entry.value) : props.entry.value
    return formatJSON(parsed)
  } catch {
    return String(props.entry.value)
  }
})

function copyKey(): void {
  if (props.entry?.key) {
    navigator.clipboard.writeText(props.entry.key)
  }
}
</script>

<style lang="scss" scoped>
.value-preview {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>
