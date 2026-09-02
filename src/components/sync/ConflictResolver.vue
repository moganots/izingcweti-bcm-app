<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Resolve Conflict</div>

      <q-banner class="bg-orange-1 text-orange-8 q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="warning" color="orange-8" />
        </template>
        A conflict was detected between your local changes and the server version. Choose how to
        resolve it.
      </q-banner>

      <!-- Conflict Details -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6">
          <q-card flat bordered class="bg-blue-1">
            <q-card-section>
              <div class="text-subtitle2 text-blue-8 q-mb-sm">Your Version (Client)</div>
              <pre class="conflict-data">{{ formatJSON(conflict?.client_version) }}</pre>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card flat bordered class="bg-green-1">
            <q-card-section>
              <div class="text-subtitle2 text-green-8 q-mb-sm">Server Version</div>
              <pre class="conflict-data">{{ formatJSON(conflict?.server_version) }}</pre>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Resolution Strategy -->
      <q-select v-model="strategy" :options="strategyOptions" label="Resolution Strategy" outlined dense class="q-mb-md"
        emit-value map-options />

      <!-- Custom Resolution Data (for merge/manual) -->
      <q-input v-if="strategy === 'manual'" v-model="resolvedData" label="Resolved Data (JSON)" outlined dense
        type="textarea" rows="5" class="q-mb-md" />

      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
        </div>
        <div class="col-6">
          <q-btn color="primary" label="Resolve Conflict" class="full-width" :loading="submitting" unelevated
            @click="handleResolve" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatJSON } from '../../utils/formatters'

const props = defineProps<{
  conflict: any
  submitting?: boolean
}>()

const emit = defineEmits<{
  resolve: [data: { strategy: string; resolvedData?: any }]
  cancel: []
}>()

const strategy = ref('last_write_wins')
const resolvedData = ref('')

const strategyOptions = [
  { label: 'Last Write Wins (Keep Latest)', value: 'last_write_wins' },
  { label: 'Client Wins (Keep My Version)', value: 'client_wins' },
  { label: 'Server Wins (Keep Server Version)', value: 'server_wins' },
  { label: 'Manual Resolution', value: 'manual' },
]

function handleResolve(): void {
  const data: any = { strategy: strategy.value }
  if (strategy.value === 'manual' && resolvedData.value) {
    try {
      data.resolvedData = JSON.parse(resolvedData.value)
    } catch {
      data.resolvedData = resolvedData.value
    }
  }
  emit('resolve', data)
}
</script>

<style lang="scss" scoped>
.conflict-data {
  font-size: 11px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>
