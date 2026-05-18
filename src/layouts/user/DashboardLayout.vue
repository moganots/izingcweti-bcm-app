<!-- src/layouts/user/DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <q-page class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Widgets -->
        <div class="col-12 col-sm-6 col-md-3">
          <DashboardCard
            title="Active Risks"
            :value="stats.activeRisks"
            icon="warning"
            color="orange"
            trend="+5%"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <DashboardCard
            title="BCP Plans"
            :value="stats.bcpPlans"
            icon="business_center"
            color="blue"
            trend="Active: 85%"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <DashboardCard
            title="Incidents"
            :value="stats.incidents"
            icon="report_problem"
            color="red"
            trend="Resolved: 92%"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <DashboardCard
            title="Training"
            :value="stats.trainingCompletion"
            icon="school"
            color="green"
            suffix="%"
            trend="Completed: {{ stats.trainingCompleted }}"
          />
        </div>
      </div>
      
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-6">
          <router-view name="left" />
        </div>
        <div class="col-12 col-md-6">
          <router-view name="right" />
        </div>
      </div>
      
      <div class="row q-mt-md">
        <div class="col-12">
          <router-view name="main" />
        </div>
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardCard from 'src/components/dashboard/DashboardCard.vue'

const stats = ref({
  activeRisks: 42,
  bcpPlans: 28,
  incidents: 15,
  trainingCompletion: 78,
  trainingCompleted: 156,
})

onMounted(() => {
  // Fetch dashboard stats
})
</script>