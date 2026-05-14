<!-- src/pages/bcm/BiaDetailPage.vue -->
<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Content -->
    <div v-else-if="bia" class="bia-detail">
      <!-- Back Button -->
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to BIAs"
        class="q-mb-md"
        @click="$router.push('/bcm/bia')"
      />

      <!-- Header Card -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h5 class="text-h5 q-mb-xs">{{ bia.critical_function?.name }}</h5>
              <p class="text-grey-7 q-mb-none">
                {{ bia.critical_function?.department?.name }} | Assessed:
                {{ formatDate(bia.assessed_date) }}
              </p>
            </div>
            <q-badge
              :color="getImpactColor(bia.reputational_impact)"
              :label="bia.reputational_impact + ' Impact'"
              class="q-px-lg q-py-sm"
              style="font-size: 16px"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Impact Assessment -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Financial Impact -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="attach_money" color="primary" size="sm" class="q-mr-sm" />
                Financial Impact
              </div>
              <div class="text-h3 text-primary text-center q-my-lg">
                {{ formatCurrency(bia.financial_impact_per_day) }}
              </div>
              <p class="text-grey-7 text-center">per day of disruption</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Reputational Impact -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="star" color="warning" size="sm" class="q-mr-sm" />
                Reputational Impact
              </div>
              <div class="text-center q-my-lg">
                <q-icon
                  :name="getReputationIcon(bia.reputational_impact)"
                  :color="getImpactColor(bia.reputational_impact)"
                  size="80px"
                />
              </div>
              <p
                class="text-center text-h5"
                :class="'text-' + getImpactColor(bia.reputational_impact)"
              >
                {{ bia.reputational_impact }}
              </p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Operational Impact -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="engineering" color="info" size="sm" class="q-mr-sm" />
                Operational Impact
              </div>
              <p class="text-body1 q-mb-none">{{ bia.operational_impact }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Regulatory Impact -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="gavel" color="negative" size="sm" class="q-mr-sm" />
                Regulatory Impact
              </div>
              <p class="text-body1 q-mb-none">{{ bia.regulatory_impact }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Related Information -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Critical Function Details</div>

          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label caption>Maximum Tolerable Outage</q-item-label>
                <q-item-label>{{ bia.critical_function?.max_tolerable_outage }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Work Recovery Time</q-item-label>
                <q-item-label>{{ bia.critical_function?.work_recovery_time }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="bia.critical_function?.dependency_ids?.length">
              <q-item-section>
                <q-item-label caption>Dependencies</q-item-label>
                <q-item-label
                  >{{ bia.critical_function.dependency_ids.length }} dependent
                  functions</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Actions -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-btn
            color="primary"
            icon="edit"
            label="Edit BIA"
            class="full-width"
            unelevated
            @click="editBIA"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-btn
            v-if="!bia.business_continuity_plan"
            color="secondary"
            icon="description"
            label="Create BCP"
            class="full-width"
            unelevated
            @click="createBCP"
          />
          <q-btn
            v-else
            color="info"
            icon="visibility"
            label="View BCP"
            class="full-width"
            outline
            @click="$router.push(`/bcm/bcp/${bia.business_continuity_plan.uuid}`)"
          />
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">BIA Not Found</h5>
      <q-btn color="primary" label="Back to BIAs" @click="$router.push('/bcm/bia')" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BcmService } from '../../services/api/BcmService'
import { formatDate, formatCurrency } from '../../utils/formatters'

const route = useRoute()
const router = useRouter()

const bia = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await loadBIA(id)
  }
})

async function loadBIA(id: string): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getBIA(id)
    bia.value = response.data
  } catch (error) {
    console.error('Failed to load BIA:', error)
  } finally {
    isLoading.value = false
  }
}

function getImpactColor(impact: string): string {
  const colors: Record<string, string> = { Low: 'green', Med: 'orange', High: 'red' }
  return colors[impact] || 'grey'
}

function getReputationIcon(impact: string): string {
  const icons: Record<string, string> = {
    Low: 'sentiment_satisfied',
    Med: 'sentiment_neutral',
    High: 'sentiment_very_dissatisfied',
  }
  return icons[impact] || 'help'
}

function editBIA(): void {
  // Navigate to edit page or open edit dialog
  console.log('Edit BIA:', bia.value?.uuid)
}

function createBCP(): void {
  router.push(`/bcm/bcp/create?function_id=${bia.value?.function_id}`)
}
</script>
