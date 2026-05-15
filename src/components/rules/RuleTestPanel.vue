<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Test Rule</div>
      <q-banner class="bg-info-1 text-info-8 q-mb-md rounded-borders" rounded>
        Test your rule against sample data before activating it.
      </q-banner>

      <q-input
        v-model="testData"
        label="Test Data (JSON)"
        outlined
        dense
        type="textarea"
        rows="6"
        class="q-mb-md"
        placeholder='{"severity": "Critical"}'
      />

      <q-btn
        color="primary"
        icon="play_arrow"
        label="Run Test"
        :loading="running"
        class="full-width q-mb-md"
        unelevated
        @click="handleTest"
      />

      <!-- Results -->
      <div v-if="result" class="test-results">
        <q-separator class="q-mb-md" />
        <div class="text-subtitle1 q-mb-md">Test Results</div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-card flat bordered :class="result.conditions_met ? 'bg-green-1' : 'bg-red-1'">
              <q-card-section class="text-center">
                <q-icon
                  :name="result.conditions_met ? 'check_circle' : 'cancel'"
                  :color="result.conditions_met ? 'green' : 'red'"
                  size="30px"
                />
                <div class="text-body2 q-mt-sm">
                  Conditions {{ result.conditions_met ? 'Met' : 'Not Met' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section class="text-center">
                <div class="text-h5 text-primary">{{ result.execution_time_ms }}ms</div>
                <div class="text-caption text-grey-7">Execution Time</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-if="result.results?.length" class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Action Results:</div>
          <q-list dense>
            <q-item v-for="(r, i) in result.results" :key="i">
              <q-item-section avatar
                ><q-icon :name="r.success ? 'check' : 'error'" :color="r.success ? 'green' : 'red'"
              /></q-item-section>
              <q-item-section
                ><q-item-label>{{ r.action }}</q-item-label
                ><q-item-label caption>{{ formatJSON(r.result) }}</q-item-label></q-item-section
              >
            </q-item>
          </q-list>
        </div>
        <div v-if="result.error" class="bg-red-1 text-red-8 q-pa-sm rounded-borders q-mt-md">
          {{ result.error }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatJSON } from '../../utils/formatters'

defineProps<{ running?: boolean }>()
const emit = defineEmits<{ test: [data: { testData: any }] }>()

const testData = ref('{\n  \n}')
const result = ref<any>(null)

function handleTest(): void {
  try {
    const parsed = JSON.parse(testData.value)
    result.value = null
    emit('test', { testData: parsed })
  } catch {
    result.value = { success: false, error: 'Invalid JSON in test data' }
  }
}

defineExpose({
  setResult: (r: any) => {
    result.value = r
  },
})
</script>
