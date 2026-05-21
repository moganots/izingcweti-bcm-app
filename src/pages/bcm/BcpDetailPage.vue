<template>
  <q-page padding>
    <div v-if="isLoading" class="text-center q-pa-xl"><LoadingSpinner /></div>
    <div v-else-if="bcp">
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back to BCPs"
          @click="$router.push('/bcm/bcp')"
        />
        <div class="q-gutter-sm">
          <q-btn outline color="primary" icon="edit" label="Edit" @click="editBCP" />
          <q-btn
            v-if="bcp.plan_status === 'Draft'"
            color="green"
            icon="check"
            label="Submit"
            @click="submitBCP"
          />
          <q-btn
            v-if="bcp.plan_status === 'Approved'"
            color="primary"
            icon="play_arrow"
            label="Activate"
            @click="activateBCP"
          />
        </div>
      </div>

      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h5 class="text-h5 q-mb-xs">{{ bcp.critical_function?.name }}</h5>
              <p class="text-grey-7">{{ bcp.critical_function?.department?.name }}</p>
            </div>
            <div class="text-right">
              <q-badge
                :color="getStatusColor(bcp.plan_status)"
                :label="bcp.plan_status"
                class="q-px-lg q-py-sm q-mb-sm"
                style="font-size: 16px"
              />
              <div class="text-caption text-grey-7">Version {{ bcp.version }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3" v-for="date in keyDates" :key="date.label">
          <q-card flat bordered
            ><q-card-section class="text-center"
              ><q-icon :name="date.icon" :color="date.color" size="30px" class="q-mb-sm" />
              <div class="text-caption text-grey-7">{{ date.label }}</div>
              <div class="text-body2 text-weight-medium">
                {{ formatDate(date.value) }}
              </div></q-card-section
            ></q-card
          >
        </div>
      </div>

      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="contact_emergency" color="negative" size="sm" class="q-mr-sm" />Emergency
            Contacts
          </div>
          <div v-if="bcp.emergency_contact_list" class="row q-col-gutter-md">
            <div
              v-for="(contact, key) in bcp.emergency_contact_list"
              :key="key"
              class="col-12 col-md-6"
            >
              <q-item
                ><q-item-section avatar
                  ><q-icon
                    :name="key === 'primary' ? 'star' : 'person'"
                    :color="key === 'primary' ? 'warning' : 'grey'" /></q-item-section
                ><q-item-section
                  ><q-item-label class="text-weight-medium">{{ contact.name }}</q-item-label
                  ><q-item-label caption>{{ contact.phone }}</q-item-label></q-item-section
                ><q-item-section side
                  ><q-btn
                    flat
                    round
                    icon="phone"
                    color="primary"
                    @click="callContact(contact.phone)" /></q-item-section
              ></q-item>
            </div>
          </div>
          <div v-else class="text-grey-7">No emergency contacts configured</div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="restore" color="primary" size="sm" class="q-mr-sm" />Recovery Strategies
            </div>
            <q-btn color="primary" icon="add" label="Add" unelevated @click="addStrategy" />
          </div>
          <div v-if="bcp.recovery_strategies?.length" class="row q-col-gutter-md">
            <div v-for="s in bcp.recovery_strategies" :key="s.uuid" class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1"
                ><q-card-section
                  ><q-badge :label="s.recovery_strategy_type" color="primary" class="q-mb-sm" />
                  <div class="text-body2">
                    Cost: {{ formatCurrency(s.estimated_recovery_cost) }}
                  </div>
                  <q-linear-progress
                    :value="s.test_success_rate / 100"
                    color="green"
                    class="q-mt-sm"
                  />
                  <div class="text-caption text-grey-7">
                    Success: {{ s.test_success_rate }}%
                  </div></q-card-section
                ></q-card
              >
            </div>
          </div>
          <div v-else class="text-grey-7">No recovery strategies defined</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="playlist_add_check" color="info" size="sm" class="q-mr-sm" />Exercise
              Tests
            </div>
            <q-btn color="info" icon="add" label="Schedule" outline @click="scheduleTest" />
          </div>
          <q-timeline v-if="bcp.exercise_tests?.length" color="primary">
            <q-timeline-entry
              v-for="test in bcp.exercise_tests"
              :key="test.uuid"
              :icon="test.passed ? 'check_circle' : 'cancel'"
              :color="test.passed ? 'green' : 'red'"
              :title="test.exercise_test_type"
              :subtitle="formatDate(test.date)"
              ><div v-if="test.lessons_learned" class="q-mt-sm">
                <strong>Lessons:</strong> {{ test.lessons_learned }}
              </div></q-timeline-entry
            >
          </q-timeline>
          <div v-else class="text-grey-7">No exercise tests conducted</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBcmStore } from '../../stores/bcm/bcm.store'
import { formatDate } from '../../utils/date.utils'
import { formatCurrency } from '../../utils/formatters'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'

const route = useRoute()
const $q = useQuasar()
const bcmStore = useBcmStore()
const bcp = computed(() => bcmStore.selectedBCP)
const isLoading = ref(true)

const keyDates = computed(() => [
  { label: 'Created', icon: 'event', color: 'primary', value: bcp.value?.created_at },
  { label: 'Approval', icon: 'check_circle', color: 'green', value: bcp.value?.approval_date },
  {
    label: 'Review Due',
    icon: 'event_available',
    color: 'orange',
    value: bcp.value?.review_due_date,
  },
  { label: 'Updated', icon: 'update', color: 'grey', value: bcp.value?.updated_at },
])

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await bcmStore.loadBCP(id)
    isLoading.value = false
  }
})

function getStatusColor(status: string): string {
  return { Draft: 'grey', Approved: 'blue', Active: 'green', Archived: 'orange' }[status] || 'grey'
}
async function submitBCP(): Promise<void> {
  await bcmStore.approveBCP(bcp?.value?.uuid!)
  $q.notify({ type: 'positive', message: 'Submitted' })
  await bcmStore.loadBCP(bcp?.value?.uuid!)
}
async function activateBCP(): Promise<void> {
  await bcmStore.activateBCP(bcp?.value?.uuid!)
  $q.notify({ type: 'positive', message: 'Activated' })
  await bcmStore.loadBCP(bcp?.value?.uuid!)
}
function callContact(phone: string): void {
  window.open(`tel:${phone}`, '_system')
}
function editBCP(): void {
  console.log('Edit BCP')
}
function addStrategy(): void {
  console.log('Add strategy')
}
function scheduleTest(): void {
  console.log('Schedule test')
}
</script>
