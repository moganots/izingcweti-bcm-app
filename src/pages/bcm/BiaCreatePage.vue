<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="Back to BIAs"
      class="q-mb-md"
      @click="$router.push('/bcm/bia')"
    />

    <div class="create-container">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Create Business Impact Analysis</div>
          <p class="text-grey-7 q-mb-lg">
            Assess the business impact for a critical function. All fields marked with * are
            required.
          </p>

          <q-form @submit.prevent="handleCreate" class="q-gutter-md">
            <!-- Critical Function Selection -->
            <q-select
              v-model="form.function_id"
              :options="functionOptions"
              label="Critical Function *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
              :disable="!!preSelectedFunction"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Assessment Date -->
            <q-input
              v-model="form.assessed_date"
              label="Assessment Date *"
              type="date"
              outlined
              dense
              :rules="[requiredRule]"
            />

            <!-- Financial Impact -->
            <q-input
              v-model.number="form.financial_impact_per_day"
              label="Financial Impact per Day ($) *"
              type="number"
              outlined
              dense
              prefix="$"
              :rules="[requiredRule, positiveRule]"
              hint="Estimated financial loss per day of disruption"
            />

            <!-- Operational Impact -->
            <q-input
              v-model="form.operational_impact"
              label="Operational Impact *"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[requiredRule]"
              placeholder="Describe the operational impact of disruption..."
            />

            <!-- Regulatory Impact -->
            <q-input
              v-model="form.regulatory_impact"
              label="Regulatory Impact *"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[requiredRule]"
              placeholder="Describe the regulatory/compliance impact..."
            />

            <!-- Reputational Impact -->
            <q-select
              v-model="form.reputational_impact"
              :options="reputationalOptions"
              label="Reputational Impact *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />

            <!-- Error Message -->
            <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
              {{ errorMessage }}
            </q-banner>

            <!-- Submit -->
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-btn
                  flat
                  color="grey"
                  label="Cancel"
                  class="full-width"
                  @click="$router.push('/bcm/bia')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Create BIA"
                  :loading="saving"
                  class="full-width"
                  unelevated
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Guidelines -->
      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">BIA Guidelines</div>
          <q-list dense>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section
                >Financial impact should reflect estimated daily revenue loss</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section
                >Operational impact describes effects on business operations</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section
                >Regulatory impact covers compliance and legal consequences</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section
                >Reputational impact assesses brand and customer trust damage</q-item-section
              >
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBcmStore } from '../../stores/bcm.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const bcmStore = useBcmStore()

const saving = ref(false)
const errorMessage = ref('')
const preSelectedFunction = ref('')

const form = reactive({
  function_id: '',
  assessed_date: new Date().toISOString().split('T')[0],
  financial_impact_per_day: 0,
  operational_impact: '',
  regulatory_impact: '',
  reputational_impact: '',
})

const functionOptions = computed(() => {
  const functions = bcmStore.criticalFunctions || []
  return functions.map((f: any) => ({
    label: f.name,
    description: `Department: ${f.department?.name || 'N/A'} | MTO: ${f.max_tolerable_outage}`,
    value: f.uuid,
  }))
})

const reputationalOptions = [
  { label: 'Low - Minor reputational impact', value: 'Low' },
  { label: 'Medium - Moderate reputational damage', value: 'Med' },
  { label: 'High - Severe reputational crisis', value: 'High' },
]

const requiredRule = (val: any) => !!val || val === 0 || 'Required'
const positiveRule = (val: number) => val >= 0 || 'Must be a positive number'

onMounted(async () => {
  await bcmStore.loadCriticalFunctions()

  // Check if function_id was passed in query params
  const functionId = route.query.function_id as string
  if (functionId) {
    form.function_id = functionId
    preSelectedFunction.value = functionId
  }
})

async function handleCreate(): Promise<void> {
  if (
    !form.function_id ||
    !form.assessed_date ||
    form.financial_impact_per_day < 0 ||
    !form.operational_impact ||
    !form.regulatory_impact ||
    !form.reputational_impact
  ) {
    $q.notify({ type: 'negative', message: 'Please fill all required fields' })
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    await bcmStore.createBIA(form as any)
    $q.notify({ type: 'positive', message: 'BIA created successfully!' })
    router.push('/bcm/bia')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to create BIA'
    $q.notify({ type: 'negative', message: errorMessage.value })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-container {
  max-width: 800px;
}
</style>
