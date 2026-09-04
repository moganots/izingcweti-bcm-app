<template>
    <q-page padding>
        <PageHeader title="Governance Settings" subtitle="Configure governance and compliance settings" />

        <div class="settings-container q-gutter-md">
            <!-- General Settings -->
            <SettingsSection title="General" icon="settings" description="General governance settings">
                <q-list>
                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="auto_awesome" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Auto-review Policies</q-item-label>
                            <q-item-label caption>Automatically notify policy owners when review is due</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.autoReview" color="primary" />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="calendar_today" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Review Period (days)</q-item-label>
                            <q-item-label caption>Default number of days before review is due</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-select v-model="settings.reviewPeriod" :options="reviewPeriodOptions" outlined dense
                                style="width: 120px" emit-value map-options />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="notifications" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Review Reminders</q-item-label>
                            <q-item-label caption>Send reminders before policy review due date</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.reviewReminders" color="primary" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>

            <!-- Maturity Settings -->
            <SettingsSection title="Maturity Assessment" icon="trending_up"
                description="Configure maturity assessment settings">
                <q-list>
                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="repeat" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Assessment Frequency</q-item-label>
                            <q-item-label caption>How often to perform maturity assessments</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-select v-model="settings.assessmentFrequency" :options="frequencyOptions" outlined dense
                                style="width: 150px" emit-value map-options />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="domain" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Assessment Scope</q-item-label>
                            <q-item-label caption>Level at which assessments are performed</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-select v-model="settings.assessmentScope" :options="scopeOptions" outlined dense
                                style="width: 150px" emit-value map-options />
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>

            <!-- Compliance Settings -->
            <SettingsSection title="Compliance" icon="gavel" description="Compliance and regulatory settings">
                <q-list>
                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="checklist" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Compliance Standards</q-item-label>
                            <q-item-label caption>Manage compliance standards to track</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn flat color="primary" icon="add" label="Manage" @click="showStandardsDialog = true" />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="alarm" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Audit Reminders</q-item-label>
                            <q-item-label caption>Send reminders for upcoming audits</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.auditReminders" color="primary" />
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item tag="label">
                        <q-item-section avatar>
                            <q-icon name="download" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Auto-export Reports</q-item-label>
                            <q-item-label caption>Automatically export compliance reports</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-toggle v-model="settings.autoExport" color="primary" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>

            <!-- Data Management -->
            <SettingsSection title="Data Management" icon="storage" description="Manage governance data">
                <q-list>
                    <q-item clickable @click="exportData">
                        <q-item-section avatar>
                            <q-icon name="download" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Export Governance Data</q-item-label>
                            <q-item-label caption>Download all governance data as JSON</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable @click="clearCache">
                        <q-item-section avatar>
                            <q-icon name="clear_all" color="orange" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Clear Cache</q-item-label>
                            <q-item-label caption>Clear cached governance data</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable @click="resetSettings">
                        <q-item-section avatar>
                            <q-icon name="restart_alt" color="red" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-negative">Reset Settings</q-item-label>
                            <q-item-label caption>Reset all governance settings to defaults</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </SettingsSection>
        </div>

        <!-- Compliance Standards Dialog -->
        <q-dialog v-model="showStandardsDialog" persistent>
            <q-card style="width: 500px; max-width: 90vw">
                <q-card-section>
                    <div class="text-h6">Compliance Standards</div>
                </q-card-section>
                <q-card-section>
                    <q-list separator>
                        <q-item v-for="standard in complianceStandards" :key="standard">
                            <q-item-section>
                                <q-item-label>{{ standard }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn flat round dense icon="close" color="negative"
                                    @click="removeStandard(standard)" />
                            </q-item-section>
                        </q-item>
                    </q-list>

                    <div class="row q-mt-md q-gutter-sm">
                        <q-input v-model="newStandard" placeholder="Add standard..." outlined dense class="col"
                            @keyup.enter="addStandard" />
                        <q-btn color="primary" icon="add" label="Add" unelevated @click="addStandard" />
                    </div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Close" color="grey" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Confirmation Dialog -->
        <q-dialog v-model="showConfirmDialog" persistent>
            <ConfirmDialog v-model="showConfirmDialog" :title="confirmTitle" :message="confirmMessage" :type="confirmType"
                :confirm-label="confirmLabel" @confirm="handleConfirm" @cancel="showConfirmDialog = false" />
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { PageHeader } from 'src/components/.common'
import { SettingsSection } from 'src/components/settings'
import { ConfirmDialog } from 'src/components/.common'
import { formatISO } from 'src/utils/date.utils'

// ============================================
// Composables
// ============================================
const $q = useQuasar()

// ============================================
// Settings
// ============================================
const settings = reactive({
    autoReview: true,
    reviewPeriod: 365,
    reviewReminders: true,
    assessmentFrequency: 'quarterly',
    assessmentScope: 'organisation',
    auditReminders: true,
    autoExport: false,
})

// ============================================
// Options
// ============================================
const reviewPeriodOptions = [
    { label: '90 days', value: 90 },
    { label: '180 days', value: 180 },
    { label: '365 days', value: 365 },
    { label: '730 days', value: 730 },
]

const frequencyOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Bi-annually', value: 'bi-annually' },
    { label: 'Annually', value: 'annually' },
]

const scopeOptions = [
    { label: 'Organisation', value: 'organisation' },
    { label: 'Department', value: 'department' },
    { label: 'Both', value: 'both' },
]

// ============================================
// State
// ============================================
const showStandardsDialog = ref(false)
const showConfirmDialog = ref(false)
const newStandard = ref('')
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

const complianceStandards = ref<string[]>([
    'ISO 22301',
    'NIST 800-34',
    'FFIEC',
    'COBIT 2019',
    'SOC 2',
    'GDPR',
])

// ============================================
// Methods
// ============================================
function addStandard(): void {
    if (newStandard.value && !complianceStandards.value.includes(newStandard.value)) {
        complianceStandards.value.push(newStandard.value)
        newStandard.value = ''
    }
}

function removeStandard(standard: string): void {
    complianceStandards.value = complianceStandards.value.filter(s => s !== standard)
}

function exportData(): void {
    const data = {
        settings: { ...settings },
        standards: complianceStandards.value,
        exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `governance-data-${formatISO(new Date())}.json`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({
        type: 'positive',
        message: 'Governance data exported successfully',
        position: 'top',
    })
}

function clearCache(): void {
    confirmTitle.value = 'Clear Cache'
    confirmMessage.value = 'Are you sure you want to clear all cached governance data?'
    confirmType.value = 'warning'
    confirmLabel.value = 'Clear'
    pendingAction = async () => {
        // Clear cache implementation
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
    confirmMessage.value = 'Are you sure you want to reset all governance settings to defaults?'
    confirmType.value = 'delete'
    confirmLabel.value = 'Reset'
    pendingAction = async () => {
        settings.autoReview = true
        settings.reviewPeriod = 365
        settings.reviewReminders = true
        settings.assessmentFrequency = 'quarterly'
        settings.assessmentScope = 'organisation'
        settings.auditReminders = true
        settings.autoExport = false

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