<template>
  <div class="compliance-stats">
    <div class="row q-col-gutter-md">
      <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
            <q-icon :name="stat.icon" :color="stat.color" size="28px" class="q-mb-sm" />
            <div class="text-h4" :class="'text-' + stat.color">{{ stat.value }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ records?: any[] }>()

const stats = computed(() => {
  const data = props.records || []
  const now = new Date()

  return [
    { label: 'Total Records', value: data.length, color: 'primary', icon: 'verified_user' },
    {
      label: 'Compliant',
      value: data.filter((r: any) => r.compliance_status === 'Compliant').length,
      color: 'green',
      icon: 'check_circle',
    },
    {
      label: 'Partially',
      value: data.filter((r: any) => r.compliance_status === 'Partially').length,
      color: 'orange',
      icon: 'warning',
    },
    {
      label: 'Non-Compliant',
      value: data.filter((r: any) => r.compliance_status === 'NonCompliant').length,
      color: 'red',
      icon: 'error',
    },
    {
      label: 'Overdue Audits',
      value: data.filter((r: any) => r.next_audit_due && new Date(r.next_audit_due) < now).length,
      color: 'deep-orange',
      icon: 'event_busy',
    },
    {
      label: 'Due Soon (30d)',
      value: data.filter((r: any) => {
        if (!r.next_audit_due) return false
        const due = new Date(r.next_audit_due)
        const thirtyDays = new Date()
        thirtyDays.setDate(now.getDate() + 30)
        return due <= thirtyDays && due > now
      }).length,
      color: 'warning',
      icon: 'event',
    },
    {
      label: 'Compliance Rate',
      value: getComplianceRate(data) + '%',
      color: 'blue',
      icon: 'trending_up',
    },
  ]
})

function getComplianceRate(data: any[]): number {
  if (data.length === 0) return 0
  const compliant = data.filter((r: any) => r.compliance_status === 'Compliant').length
  return Math.round((compliant / data.length) * 100)
}
</script>
