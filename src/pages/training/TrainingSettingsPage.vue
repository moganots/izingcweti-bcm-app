<template>
    <q-page padding>
        <PageHeader title="Training Settings" subtitle="Configure training and certification settings" />

        <div class="settings-container q-gutter-md">
            <!-- General Settings -->
            <SettingsSection title="General" icon="settings" description="General training settings">
                <q-list>
                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="auto_awesome" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Auto-enroll New Users</q-item-label>
                            <q-item-label caption>Automatically enroll new users in mandatory courses</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.autoEnroll" color="primary" />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="notifications" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Course Reminders</q-item-label>
                            <q-item-label caption>Send reminders for incomplete courses</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.courseReminders" color="primary" />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="certificate" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Certification Validity</q-item-label>
                            <q-item-label caption>Default validity period for certifications</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-select v-model="settings.certValidityDays" :options="validityOptions" outlined dense
                                style="width: 120px" emit-value map-options />
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>

            <!-- Attestation Settings -->
            <SettingsSection title="Attestations" icon="assignment" description="Configure attestation settings">
                <q-list>
                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="calendar_today" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Default Due Days</q-item-label>
                            <q-item-label caption>Default number of days for attestation completion</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-select v-model="settings.attestationDueDays" :options="dueDaysOptions" outlined dense
                                style="width: 120px" emit-value map-options />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="notifications_active" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Attestation Reminders</q-item-label>
                            <q-item-label caption>Send reminders for pending attestations</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.attestationReminders" color="primary" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>

            <!-- Data Management -->
            <SettingsSection title="Data Management" icon="storage" description="Manage training data">
                <q-list>
                    <q-item clickable @click="exportData">
                        <q-item-section avatar>
                            <q-icon name="download" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Export Training Data</q-item-label>
                            <q-item-label caption>Download all training data as JSON</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable @click="clearCache">
                        <q-item-section avatar>
                            <q-icon name="clear_all" color="orange" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Clear Cache</q-item-label>
                            <q-item-label caption>Clear cached training data</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable @click="resetSettings">
                        <q-item-section avatar>
                            <q-icon name="restart_alt" color="red" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-negative">Reset Settings</q-item-label>
                            <q-item-label caption>Reset all training settings to defaults</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>
        </div>

        <!-- Confirmation Dialog -->
        <q-dialog v-model="showConfirmDialog" persistent>
            <ConfirmDialog v-model="showConfirmDialog" :title="confirmTitle" :message="confirmMessage"
                :type="confirmType" :confirm-label="confirmLabel" @confirm="handleConfirm"
                @cancel="showConfirmDialog = false" />
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { PageHeader } from 'src/components/.common'
import { SettingsSection } from 'src/components/settings'
import { ConfirmDialog } from 'src/components/.common'

// ============================================
// Composables
// ============================================
const $q = useQuasar()

// ============================================
// Settings
// ============================================
const settings = reactive({
    autoEnroll: true,
    courseReminders: true,
    certValidityDays: 365,
    attestationDueDays: 30,
    attestationReminders: true,
})

// ============================================
// Options
// ============================================
const validityOptions = [
    { label: '90 days', value: 90 },
    { label: '180 days', value: 180 },
    { label: '365 days', value: 365 },
    { label: '730 days', value: 730 },
    { label: 'Never expires', value: -1 },
]

const dueDaysOptions = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
    { label: '60 days', value: 60 },
    { label: '90 days', value: 90 },
]

// ============================================
// State
// ============================================
const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

// ============================================
// Methods
// ============================================
function exportData(): void {
    const data = {
        settings: { ...settings },
        exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `training-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({
        type: 'positive',
        message: 'Settings exported successfully',
        position: 'top',
    })
}

function clearCache(): void {
    confirmTitle.value = 'Clear Cache'
    confirmMessage.value = 'Are you sure you want to clear all cached training data?'
    confirmType.value = 'warning'
    confirmLabel.value = 'Clear'
    pendingAction = async () => {
        $q.notify({
            type: 'positive',
            message: 'Cache cleared successfully',
            position: 'top',
        })
        showConfirmDialog.value = false
        pendingAction = null
    }
    showConfirmDialog.value = true
}

function resetSettings(): void {
    confirmTitle.value = 'Reset Settings'
    confirmMessage.value = 'Are you sure you want to reset all training settings to defaults?'
    confirmType.value = 'delete'
    confirmLabel.value = 'Reset'
    pendingAction = async () => {
        settings.autoEnroll = true
        settings.courseReminders = true
        settings.certValidityDays = 365
        settings.attestationDueDays = 30
        settings.attestationReminders = true

        $q.notify({
            type: 'positive',
            message: 'Settings reset successfully',
            position: 'top',
        })
        showConfirmDialog.value = false
        pendingAction = null
    }
    showConfirmDialog.value = true
}

async function handleConfirm(): Promise<void> {
    if (pendingAction) {
        await pendingAction()
    }
}
</script>

<style lang="scss" scoped>
.settings-container {
    max-width: 800px;
    margin: 0 auto;

    @media (max-width: 600px) {
        padding: 0 4px;
    }
}
</style>