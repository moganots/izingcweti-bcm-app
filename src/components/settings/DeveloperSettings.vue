<template>
  <q-card flat bordered v-if="visible">
    <q-card-section>
      <div class="text-h6 q-mb-md">Developer Options</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Debug Mode</q-item-label>
            <q-item-label caption>Enable detailed logging</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="debugMode"
              color="warning"
              @update:model-value="$emit('update:debug-mode', debugMode)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>API Base URL</q-item-label>
            <q-item-label caption>Current: {{ apiUrl }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round icon="edit" size="sm" @click="$emit('edit-api-url')" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="$emit('view-logs')">
          <q-item-section avatar>
            <q-icon name="terminal" color="grey" />
          </q-item-section>
          <q-item-section>
            <q-item-label>View Logs</q-item-label>
            <q-item-label caption>Application logs</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="$emit('export-database')">
          <q-item-section avatar>
            <q-icon name="download" color="grey" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Export Database</q-item-label>
            <q-item-label caption>Download local database as JSON</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="$emit('import-database')">
          <q-item-section avatar>
            <q-icon name="upload" color="grey" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Import Database</q-item-label>
            <q-item-label caption>Restore local database from JSON</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="$emit('reset-app')">
          <q-item-section avatar>
            <q-icon name="delete_forever" color="negative" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-negative">Reset Application</q-item-label>
            <q-item-label caption>Clear all data and reset to defaults</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    visible?: boolean
    apiUrl?: string
  }>(),
  {
    visible: false,
    apiUrl: 'http://localhost:9810/api',
  }
)

defineEmits<{
  'update:debug-mode': [value: boolean]
  'edit-api-url': []
  'view-logs': []
  'export-database': []
  'import-database': []
  'reset-app': []
}>()

const debugMode = ref(false)
</script>
