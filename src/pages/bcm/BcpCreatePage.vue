<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="Back to BCPs"
      class="q-mb-md"
      @click="$router.push('/bcm/bcp')"
    />

    <div class="create-container">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Create Business Continuity Plan</div>
          <p class="text-grey-7 q-mb-lg">
            Create a business continuity plan for a critical function. All fields marked with * are
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
                  <q-item-section side>
                    <q-badge v-if="scope.opt.hasBIA" color="green" label="BIA Done" />
                    <q-badge v-else color="orange" label="BIA Pending" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-separator />

            <div class="text-subtitle1 text-weight-bold">Emergency Contacts</div>

            <!-- Primary Contact -->
            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Primary Contact</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-input
                      v-model="form.primary_contact.name"
                      label="Name *"
                      outlined
                      dense
                      :rules="[requiredRule]"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="form.primary_contact.phone"
                      label="Phone *"
                      outlined
                      dense
                      :rules="[requiredRule]"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="form.primary_contact.email"
                      label="Email"
                      outlined
                      dense
                      type="email"
                    />
                  </div>
                  <div class="col-12">
                    <q-input v-model="form.primary_contact.role" label="Role" outlined dense />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Secondary Contact -->
            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2">Secondary Contact</div>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="add"
                    label="Add"
                    v-if="!showSecondary"
                    @click="showSecondary = true"
                  />
                  <q-btn
                    flat
                    dense
                    color="negative"
                    icon="close"
                    label="Remove"
                    v-else
                    @click="removeSecondary"
                  />
                </div>
                <template v-if="showSecondary">
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input v-model="form.secondary_contact.name" label="Name" outlined dense />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="form.secondary_contact.phone"
                        label="Phone"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="form.secondary_contact.email"
                        label="Email"
                        outlined
                        dense
                        type="email"
                      />
                    </div>
                    <div class="col-12">
                      <q-input v-model="form.secondary_contact.role" label="Role" outlined dense />
                    </div>
                  </div>
                </template>
              </q-card-section>
            </q-card>

            <q-separator />

            <div class="text-subtitle1 text-weight-bold">Plan Details</div>

            <!-- Review Due Date -->
            <q-input
              v-model="form.review_due_date"
              label="Review Due Date *"
              type="date"
              outlined
              dense
              :rules="[requiredRule, futureDateRule]"
              hint="Date when this plan should be reviewed"
            />

            <!-- Plan Document URL -->
            <q-input
              v-model="form.plan_document_url"
              label="Plan Document URL"
              outlined
              dense
              placeholder="https://..."
              hint="Link to the plan document (optional)"
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
                  @click="$router.push('/bcm/bcp')"
                />
              </div>
              <div class="col-6">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Create BCP"
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
          <div class="text-subtitle2 q-mb-md">BCP Guidelines</div>
          <q-list dense>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section
                >Ensure a BIA has been completed for the selected function</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section
                >Primary contact should be available 24/7 during incidents</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section>Review date should be set at least annually</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="info" color="blue" size="sm" /></q-item-section>
              <q-item-section>Plan document can be uploaded after creation</q-item-section>
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
import { useBcmStore } from '../../stores/bcm/bcm.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const bcmStore = useBcmStore()

const saving = ref(false)
const errorMessage = ref('')
const preSelectedFunction = ref('')
const showSecondary = ref(false)

const form = reactive({
  function_id: '',
  primary_contact: { name: '', phone: '', email: '', role: '' },
  secondary_contact: { name: '', phone: '', email: '', role: '' },
  review_due_date: '',
  plan_document_url: '',
})

const functionOptions = computed(() => {
  const functions = bcmStore.criticalFunctions || []
  return functions.map((f: any) => ({
    label: f.name,
    description: `Department: ${f.department?.name || 'N/A'} | MTO: ${f.max_tolerable_outage}`,
    value: f.uuid,
    hasBIA: !!f.business_impact_assessment,
  }))
})

const requiredRule = (val: any) => !!val || 'Required'
const futureDateRule = (val: string) => {
  if (!val) return true
  return new Date(val) > new Date() || 'Date must be in the future'
}

onMounted(async () => {
  await bcmStore.loadCriticalFunctions()

  const functionId = route.query.function_id as string
  if (functionId) {
    form.function_id = functionId
    preSelectedFunction.value = functionId
  }
})

function removeSecondary(): void {
  showSecondary.value = false
  form.secondary_contact = { name: '', phone: '', email: '', role: '' }
}

async function handleCreate(): Promise<void> {
  if (
    !form.function_id ||
    !form.primary_contact.name ||
    !form.primary_contact.phone ||
    !form.review_due_date
  ) {
    $q.notify({ type: 'negative', message: 'Please fill all required fields' })
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    const emergencyContacts: Record<string, any> = {
      primary: form.primary_contact,
    }
    if (showSecondary.value && form.secondary_contact.name) {
      emergencyContacts.secondary = form.secondary_contact
    }

    await bcmStore.createBCP({
      function_id: form.function_id,
      emergency_contact_list: emergencyContacts,
      review_due_date: form.review_due_date,
      plan_document_url: form.plan_document_url || undefined,
    } as any)

    $q.notify({ type: 'positive', message: 'BCP created successfully!' })
    router.push('/bcm/bcp')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to create BCP'
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
