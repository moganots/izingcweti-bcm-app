<template>
  <!-- Quick Actions -->
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Quick Actions</div>
          <div class="quick-actions-container">
            <div class="quick-actions-wrapper">
              <div v-for="action in quickActions" :key="action.name" class="action-item">
                <q-btn
                  size="0.85em"
                  round
                  :outline="action.outline !== false"
                  dense
                  :color="action.color || 'primary'"
                  :icon="action.icon"
                  :loading="loadingStates[action.name] || false"
                  :disable="action.disabled || false"
                  :class="{ 'text-capitalize': action.capitalizeLabel !== false }"
                  @click="handleAction(action)"
                >
                  <q-tooltip v-if="action.tooltip">
                    {{ action.tooltip }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

interface QuickAction {
  name: string
  label: string
  icon: string
  action: () => void | Promise<void>
  color?: string
  outline?: boolean
  flat?: boolean
  tooltip?: string
  disabled?: boolean
  capitalizeLabel?: boolean
  requiresConfirmation?: boolean
  confirmationMessage?: string
  requiresOnline?: boolean
  successMessage?: string
  errorMessage?: string
}

const props = withDefaults(
  defineProps<{
    actions?: QuickAction[]
    loading?: boolean
  }>(),
  {
    actions: () => [],
    loading: false,
  }
)

const emit = defineEmits<{
  (e: 'action-clicked', action: QuickAction): void
  (e: 'action-success', action: QuickAction, result?: any): void
  (e: 'action-error', action: QuickAction, error: Error): void
}>()

const $q = useQuasar()
const router = useRouter()

// Loading states for each action
const loadingStates = reactive<Record<string, boolean>>({})

// Default quick actions
const defaultQuickActions: QuickAction[] = [
  {
    name: 'new-risk',
    label: 'New Risk',
    icon: 'crisis_alert',
    color: 'primary',
    outline: true,
    disabled: false,
    tooltip: 'Create a new risk assessment',
    requiresConfirmation: false,
    action: async () => {
      $q.dialog({
        title: 'Create New Risk',
        message: 'Risk creation dialog would open here',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        router.push('/risks/create')
      })
    },
  },
  {
    name: 'new-bcp',
    label: 'BCP Plan',
    icon: 'assignment_add',
    color: 'primary',
    outline: true,
    disabled: false,
    tooltip: 'Create a new Business Continuity Plan',
    requiresConfirmation: false,
    action: async () => {
      $q.dialog({
        title: 'Create BCP Plan',
        message: 'BCP plan creation dialog would open here',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        router.push('/bcp/create')
      })
    },
  },
  {
    name: 'report-incident',
    label: 'Report Incident',
    icon: 'warning',
    color: 'orange',
    outline: true,
    disabled: false,
    tooltip: 'Report a new incident',
    requiresConfirmation: false,
    confirmationMessage: 'Are you sure you want to report an incident?',
    action: async () => {
      $q.dialog({
        title: 'Report Incident',
        message: 'Incident reporting dialog would open here',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        router.push('/incidents/report')
      })
    },
  },
  {
    name: 'generate-report',
    label: 'Generate Report',
    icon: 'picture_as_pdf',
    color: 'primary',
    outline: true,
    disabled: false,
    tooltip: 'Generate a compliance or risk report',
    requiresConfirmation: false,
    action: async () => {
      $q.dialog({
        title: 'Generate Report',
        message: 'Select report type:',
        options: {
          type: 'radio',
          model: 'risk',
          items: [
            { label: 'Risk Assessment Report', value: 'risk' },
            { label: 'Compliance Report', value: 'compliance' },
            { label: 'Incident Summary', value: 'incident' },
            { label: 'BCM Maturity Report', value: 'maturity' },
          ],
        },
        cancel: true,
        persistent: true,
      }).onOk(async (data: any) => {
        $q.notify({
          message: `Generating ${data} report...`,
          type: 'info',
          position: 'top',
        })
        router.push(`/reports/generate?type=${data}`)
      })
    },
  },
]

// Additional optional actions that can be included
const additionalQuickActions: QuickAction[] = [
  {
    name: 'new-document',
    label: 'Upload Document',
    icon: 'upload_file',
    color: 'primary',
    outline: true,
    disabled: false,
    tooltip: 'Upload a new document',
    action: async () => {
      router.push('/documents/upload')
    },
  },
  {
    name: 'new-compliance',
    label: 'Add Compliance',
    icon: 'verified_user',
    color: 'green',
    outline: true,
    disabled: false,
    tooltip: 'Add a new compliance record',
    action: async () => {
      router.push('/compliance/new')
    },
  },
  {
    name: 'run-exercise',
    label: 'Run Exercise',
    icon: 'play_circle',
    color: 'purple',
    outline: true,
    disabled: true,
    tooltip: 'Run a BCP exercise/test',
    action: async () => {
      router.push('/exercises/new')
    },
  },
  {
    name: 'export-data',
    label: 'Export Data',
    icon: 'download',
    color: 'primary',
    outline: true,
    disabled: true,
    tooltip: 'Export data to CSV/Excel',
    action: async () => {
      router.push('/export')
    },
  },
]

// Merge default actions with custom actions from props
const quickActions = computed(() => {
  if (props.actions && props.actions.length > 0) {
    return props.actions
  }
  return [...props.actions, ...defaultQuickActions, ...additionalQuickActions]
})

/**
 * Handle action click
 */
async function handleAction(action: QuickAction): Promise<void> {
  // Emit click event
  emit('action-clicked', action)

  // Check if action requires online connection
  if (action.requiresOnline && !navigator.onLine) {
    $q.notify({
      type: 'negative',
      message: 'This action requires an internet connection',
      position: 'top',
      timeout: 3000,
    })
    return
  }

  // Check if action is disabled
  if (action.disabled) {
    $q.notify({
      type: 'warning',
      message: 'This action is currently disabled',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  // Show confirmation dialog if required
  if (action.requiresConfirmation) {
    const confirmed = await showConfirmationDialog(action)
    if (!confirmed) return
  }

  // Set loading state
  loadingStates[action.name] = true

  try {
    // Execute the action
    const result = await action.action()

    // Show success message
    if (action.successMessage) {
      $q.notify({
        type: 'positive',
        message: action.successMessage,
        position: 'top',
        timeout: 3000,
      })
    }

    // Emit success event
    emit('action-success', action, result)
  } catch (error: any) {
    console.error(`Error executing action ${action.name}:`, error)

    // Show error message
    const errorMsg = action.errorMessage || error.message || 'Action failed'
    $q.notify({
      type: 'negative',
      message: errorMsg,
      position: 'top',
      timeout: 5000,
    })

    // Emit error event
    emit('action-error', action, error)
  } finally {
    // Clear loading state
    loadingStates[action.name] = false
  }
}

/**
 * Show confirmation dialog
 */
function showConfirmationDialog(action: QuickAction): Promise<boolean> {
  return new Promise((resolve) => {
    $q.dialog({
      title: 'Confirm Action',
      message:
        action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()}?`,
      persistent: true,
      ok: {
        label: 'Confirm',
        color: 'primary',
      },
      cancel: {
        label: 'Cancel',
        color: 'negative',
      },
    })
      .onOk(() => {
        resolve(true)
      })
      .onCancel(() => {
        resolve(false)
      })
  })
}
</script>

<style lang="scss" scoped>
.quick-actions-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.quick-actions-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.action-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-btn {
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 42px;
  min-height: 42px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.text-capitalize {
  text-transform: capitalize;
}

// Mobile adjustments
@media (max-width: 600px) {
  .quick-actions-wrapper {
    gap: 8px;
  }

  .q-btn {
    font-size: 12px;
    min-width: 36px;
    min-height: 36px;

    .q-icon {
      font-size: 18px;
    }
  }
}

// Tablet adjustments
@media (min-width: 601px) and (max-width: 1024px) {
  .quick-actions-wrapper {
    gap: 10px;
  }

  .q-btn {
    min-width: 40px;
    min-height: 40px;
  }
}
</style>