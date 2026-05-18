<template>
  <q-page padding>
    <div v-if="isLoading" class="text-center q-pa-xl"><LoadingSpinner /></div>
    <div v-else-if="bia">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to BIAs"
        class="q-mb-md"
        @click="$router.push('/bcm/bia')"
      />

      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h5 class="text-h5 q-mb-xs">{{ bia.critical_function?.name }}</h5>
              <p class="text-grey-7">
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

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered
            ><q-card-section
              ><div class="text-h6 q-mb-md">
                <q-icon name="attach_money" color="primary" size="sm" class="q-mr-sm" />Financial
                Impact
              </div>
              <div class="text-h3 text-primary text-center q-my-lg">
                {{ formatCurrency(bia.financial_impact_per_day) }}
              </div>
              <p class="text-grey-7 text-center">per day of disruption</p></q-card-section
            ></q-card
          >
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered
            ><q-card-section
              ><div class="text-h6 q-mb-md">
                <q-icon name="star" color="warning" size="sm" class="q-mr-sm" />Reputational Impact
              </div>
              <div class="text-center q-my-lg">
                <q-icon
                  :name="
                    bia.reputational_impact === 'High'
                      ? 'sentiment_very_dissatisfied'
                      : bia.reputational_impact === 'Med'
                      ? 'sentiment_neutral'
                      : 'sentiment_satisfied'
                  "
                  :color="getImpactColor(bia.reputational_impact)"
                  size="80px"
                />
              </div>
              <p
                class="text-center text-h5"
                :class="'text-' + getImpactColor(bia.reputational_impact)"
              >
                {{ bia.reputational_impact }}
              </p></q-card-section
            ></q-card
          >
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered
            ><q-card-section
              ><div class="text-h6 q-mb-md">
                <q-icon name="engineering" color="info" size="sm" class="q-mr-sm" />Operational
                Impact
              </div>
              <p class="text-body1">{{ bia.operational_impact }}</p></q-card-section
            ></q-card
          >
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered
            ><q-card-section
              ><div class="text-h6 q-mb-md">
                <q-icon name="gavel" color="negative" size="sm" class="q-mr-sm" />Regulatory Impact
              </div>
              <p class="text-body1">{{ bia.regulatory_impact }}</p></q-card-section
            ></q-card
          >
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-btn
            color="primary"
            icon="edit"
            label="Edit BIA"
            class="full-width"
            unelevated
            @click="editBIA"
          />
        </div>
        <div class="col-6">
          <q-btn
            v-if="!bia?.critical_function?.business_continuity_plan"
            color="secondary"
            icon="description"
            label="Create BCP"
            class="full-width"
            unelevated
            @click="createBCP"
          /><q-btn
            v-else
            color="info"
            icon="visibility"
            label="View BCP"
            class="full-width"
            outline
            @click="$router.push(`/bcm/bcp/${bia?.critical_function?.business_continuity_plan.uuid}`)"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBcmStore } from '../../stores/bcm/bcm.store'
import { formatDate } from '../../utils/date.utils'
import { formatCurrency } from '../../utils/formatters'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const bcmStore = useBcmStore()
const bia = computed(() => bcmStore.selectedBIA)
const isLoading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await bcmStore.loadBIA(id)
    isLoading.value = false
  }
})
function getImpactColor(impact: string): string {
  return { Low: 'green', Med: 'orange', High: 'red' }[impact] || 'grey'
}
function editBIA(): void {
  console.log('Edit:', bia.value?.uuid)
}
function createBCP(): void {
  router.push(`/bcm/bcp/create?function_id=${bia.value?.function_id}`)
}
</script>
