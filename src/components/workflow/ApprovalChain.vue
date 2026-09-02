<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="account_tree" size="sm" class="q-mr-sm" />Approval Chain
      </div>

      <div v-if="!steps || steps.length === 0" class="text-center q-py-md text-grey-7">
        No approval chain defined
      </div>

      <div v-else class="approval-chain">
        <div v-for="(step, index) in steps" :key="index" class="chain-step">
          <div class="step-connector" v-if="index > 0">
            <div class="connector-line" :class="step.status === 'approved' ? 'bg-green' : 'bg-grey-3'"></div>
          </div>
          <div class="step-content">
            <div class="step-indicator" :class="'step-' + step.status">
              <q-icon :name="getStepIcon(step.status)" size="18px" />
            </div>
            <div class="step-details">
              <div class="step-title">
                {{ step.approver_name || 'Approver ' + (step.order || index + 1) }}
              </div>
              <div class="step-role text-caption text-grey-7" v-if="step.required_role">
                {{ step.required_role }}
              </div>
              <div class="step-status text-caption">
                <q-badge :color="getStatusColor(step.status)" :label="formatStatus(step.status)" />
              </div>
              <div v-if="step.timestamp" class="text-caption text-grey-6 q-mt-xs">
                {{ formatDateTime(step.timestamp) }}
              </div>
              <div v-if="step.comments" class="text-caption text-grey-7 q-mt-xs">
                {{ step.comments }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatDateTime } from '../../utils/date.utils'

defineProps<{ steps?: any[] }>()

function getStepIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: 'radio_button_unchecked',
    approved: 'check_circle',
    rejected: 'cancel',
    skipped: 'skip_next',
  }
  return icons[status] || 'radio_button_unchecked'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'grey',
    approved: 'green',
    rejected: 'red',
    skipped: 'orange',
  }
  return colors[status] || 'grey'
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
</script>

<style lang="scss" scoped>
.approval-chain {
  padding: 8px 0;
}

.chain-step {
  position: relative;
}

.step-connector {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.connector-line {
  width: 2px;
  height: 20px;
}

.step-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px;
}

.step-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-pending {
  background: #f5f5f5;
  color: #9e9e9e;
}

.step-approved {
  background: #e8f5e9;
  color: #4caf50;
}

.step-rejected {
  background: #ffebee;
  color: #f44336;
}

.step-skipped {
  background: #fff3e0;
  color: #ff9800;
}

.step-details {
  flex: 1;
}

.step-title {
  font-weight: 500;
}
</style>
