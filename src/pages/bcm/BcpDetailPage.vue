<!-- src/pages/bcm/BcpDetailPage.vue -->
<template>
  <q-page padding>
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <div v-else-if="bcp" class="bcp-detail">
      <!-- Back & Actions -->
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
            label="Submit for Approval"
            @click="submitForApproval"
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

      <!-- BCP Header -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h5 class="text-h5 q-mb-xs">{{ bcp.critical_function?.name }}</h5>
              <p class="text-grey-7 q-mb-none">{{ bcp.critical_function?.department?.name }}</p>
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

      <!-- Key Dates -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3" v-for="date in keyDates" :key="date.label">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon :name="date.icon" :color="date.color" size="30px" class="q-mb-sm" />
              <div class="text-caption text-grey-7">{{ date.label }}</div>
              <div class="text-body2 text-weight-medium">{{ formatDate(date.value) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Emergency Contacts -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="contact_emergency" color="negative" size="sm" class="q-mr-sm" />
            Emergency Contacts
          </div>
          <div v-if="bcp.emergency_contact_list" class="row q-col-gutter-md">
            <div
              v-for="(contact, key) in bcp.emergency_contact_list"
              :key="key"
              class="col-12 col-md-6"
            >
              <q-item>
                <q-item-section avatar>
                  <q-icon
                    :name="key === 'primary' ? 'star' : 'person'"
                    :color="key === 'primary' ? 'warning' : 'grey'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ contact.name }}</q-item-label>
                  <q-item-label caption>{{ contact.phone }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    icon="phone"
                    color="primary"
                    @click="callContact(contact.phone)"
                  />
                </q-item-section>
              </q-item>
            </div>
          </div>
          <div v-else class="text-grey-7">No emergency contacts configured</div>
        </q-card-section>
      </q-card>

      <!-- Recovery Strategies -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="restore" color="primary" size="sm" class="q-mr-sm" />
              Recovery Strategies
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Add Strategy"
              unelevated
              @click="addStrategy"
            />
          </div>
          <div v-if="bcp.recovery_strategies?.length" class="row q-col-gutter-md">
            <div
              v-for="strategy in bcp.recovery_strategies"
              :key="strategy.uuid"
              class="col-12 col-md-6"
            >
              <q-card flat bordered class="bg-grey-1">
                <q-card-section>
                  <q-badge
                    :label="strategy.recovery_strategy_type"
                    color="primary"
                    class="q-mb-sm"
                  />
                  <div class="text-body2 q-mb-sm">
                    Cost: {{ formatCurrency(strategy.estimated_recovery_cost) }}
                  </div>
                  <q-linear-progress
                    :value="strategy.test_success_rate / 100"
                    color="green"
                    class="q-mb-xs"
                  />
                  <div class="text-caption text-grey-7">
                    Test Success: {{ strategy.test_success_rate }}%
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div v-else class="text-grey-7">No recovery strategies defined</div>
        </q-card-section>
      </q-card>

      <!-- Exercise Tests -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="playlist_add_check" color="info" size="sm" class="q-mr-sm" />
              Exercise Tests
            </div>
            <q-btn color="info" icon="add" label="Schedule Test" outline @click="scheduleTest" />
          </div>
          <q-timeline v-if="bcp.exercise_tests?.length" color="primary">
            <q-timeline-entry
              v-for="test in bcp.exercise_tests"
              :key="test.uuid"
              :icon="test.passed ? 'check_circle' : 'cancel'"
              :color="test.passed ? 'green' : 'red'"
              :title="test.exercise_test_type"
              :subtitle="formatDate(test.date)"
            >
              <div v-if="test.lessons_learned" class="q-mt-sm">
                <strong>Lessons Learned:</strong> {{ test.lessons_learned }}
              </div>
            </q-timeline-entry>
          </q-timeline>
          <div v-else class="text-grey-7">No exercise tests conducted</div>
        </q-card-section>
      </q-card>

      <!-- Document Link -->
      <q-card v-if="bcp.plan_document_url" flat bordered>
        <q-card-section>
          <q-btn
            color="primary"
            icon="download"
            label="Download BCP Document"
            outline
            class="full-width"
            @click="downloadDocument"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">BCP Not Found</h5>
      <q-btn color="primary" label="Back to BCPs" @click="$router.push('/bcm/bcp')" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { BcmService } from '../../services/api/BcmService'
import { formatDate, formatCurrency } from '../../utils/formatters'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const bcp = ref<any>(null)
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
  { label: 'Last Updated', icon: 'update', color: 'grey', value: bcp.value?.updated_at },
])

onMounted(async () => {
  const id = route.params.id as string
  if (id) await loadBCP(id)
})

async function loadBCP(id: string): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getBCP(id)
    bcp.value = response.data
  } catch (error) {
    console.error('Failed to load BCP:', error)
  } finally {
    isLoading.value = false
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Draft: 'grey',
    Approved: 'blue',
    Active: 'green',
    Archived: 'orange',
  }
  return colors[status] || 'grey'
}

async function submitForApproval(): Promise<void> {
  try {
    await BcmService.approveBCP(bcp.value.uuid)
    $q.notify({ type: 'positive', message: 'BCP submitted for approval' })
    await loadBCP(bcp.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to submit BCP' })
  }
}

async function activateBCP(): Promise<void> {
  try {
    await BcmService.activateBCP(bcp.value.uuid)
    $q.notify({ type: 'positive', message: 'BCP activated successfully' })
    await loadBCP(bcp.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to activate BCP' })
  }
}

function callContact(phone: string): void {
  window.open(`tel:${phone}`, '_system')
}

function downloadDocument(): void {
  if (bcp.value?.plan_document_url) {
    window.open(bcp.value.plan_document_url, '_blank')
  }
}

function editBCP(): void {
  console.log('Edit BCP:', bcp.value?.uuid)
}
function addStrategy(): void {
  console.log('Add strategy')
}
function scheduleTest(): void {
  console.log('Schedule test')
}
</script>
