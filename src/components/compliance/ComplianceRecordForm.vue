<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 600px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">
                    {{ isEditing ? 'Edit' : 'Add' }} Compliance Record
                </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <!-- Organisation -->
                    <q-select v-model="form.organisationId" :options="organisationOptions" label="Organisation *"
                        outlined dense :rules="[requiredRule]" emit-value map-options :disable="isEditing" />

                    <!-- Standard -->
                    <q-select v-model="form.complianceStandard" :options="standardOptions" label="Compliance Standard *"
                        outlined dense :rules="[requiredRule]" emit-value map-options :disable="isEditing" />

                    <!-- Status -->
                    <q-select v-model="form.complianceStatus" :options="statusOptions" label="Compliance Status *"
                        outlined dense :rules="[requiredRule]" emit-value map-options />

                    <!-- Dates -->
                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-input v-model="form.lastAuditDate" label="Last Audit Date *" type="date" outlined dense
                                :rules="[requiredRule]" />
                        </div>
                        <div class="col-6">
                            <q-input v-model="form.nextAuditDate" label="Next Audit Due *" type="date" outlined dense
                                :rules="[requiredRule, futureDateRule]" />
                        </div>
                    </div>

                    <!-- Evidence Links -->
                    <q-input v-model="evidenceInput" label="Evidence Links" outlined dense type="textarea" rows="2"
                        placeholder="Enter URLs or file paths, one per line"
                        hint="Optional: Links to compliance evidence documents" />

                    <!-- Notes -->
                    <q-input v-model="form.notes" label="Notes" outlined dense type="textarea" rows="2"
                        placeholder="Additional notes about this compliance record" />

                    <!-- Gap Description -->
                    <q-input v-model="form.gapDescription" label="Gap Description" outlined dense type="textarea"
                        rows="2" placeholder="Describe any compliance gaps if applicable" />

                    <!-- Recommendation -->
                    <q-input v-model="form.recommendation" label="Recommendation" outlined dense type="textarea"
                        rows="2" placeholder="Recommendations for improving compliance" />

                    <!-- Error Message -->
                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>

                    <!-- Actions -->
                    <div class="row q-gutter-md">
                        <div class="col">
                            <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup
                                @click="$emit('cancel')" />
                        </div>
                        <div class="col">
                            <q-btn type="submit" color="primary" :label="isEditing ? 'Update' : 'Create'"
                                :loading="submitting" class="full-width" unelevated />
                        </div>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ComplianceStandard, ComplianceStatus } from './../../models/entities/compliance/compliance.entity'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        editing?: boolean
        initialData?: any
        submitting?: boolean
        errorMessage?: string
        organisationOptions?: Array<{ label: string; value: string }>
    }>(),
    {
        modelValue: false,
        editing: false,
        initialData: null,
        submitting: false,
        errorMessage: '',
        organisationOptions: () => [],
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [data: any]
    cancel: []
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const isEditing = computed(() => props.editing || !!props.initialData?.id)

const form = reactive({
    organisationId: '',
    complianceStandard: '',
    complianceStatus: 'PARTIALLY_COMPLIANT',
    lastAuditDate: '',
    nextAuditDate: '',
    notes: '',
    gapDescription: '',
    recommendation: '',
})

const evidenceInput = ref('')

const standardOptions = Object.values(ComplianceStandard).map((value) => ({
    label: formatStandardLabel(value),
    value,
}))

const statusOptions = Object.values(ComplianceStatus).map((value) => ({
    label: formatStatusLabel(value),
    value,
}))

const requiredRule = (val: any) => !!val || 'This field is required'

const futureDateRule = (val: string) => {
    if (!val || !form.lastAuditDate) return true
    const next = new Date(val)
    const last = new Date(form.lastAuditDate)
    return next > last || 'Must be after last audit date'
}

watch(
    () => props.initialData,
    (data) => {
        if (data) {
            form.organisationId = data.organisationId || data.organisation_id || ''
            form.complianceStandard = data.complianceStandard || data.compliance_standard || ''
            form.complianceStatus = data.complianceStatus || data.compliance_status || 'PARTIALLY_COMPLIANT'
            form.lastAuditDate = data.lastAuditDate || data.last_audit_date || ''
            form.nextAuditDate = data.nextAuditDate || data.next_audit_due || ''
            form.notes = data.notes || ''
            form.gapDescription = data.gapDescription || data.gap_description || ''
            form.recommendation = data.recommendation || ''

            const evidence = data.evidenceLinks || data.evidence_links || []
            evidenceInput.value = Array.isArray(evidence) ? evidence.join('\n') : ''
        }
    },
    { immediate: true }
)

function formatStandardLabel(standard: string): string {
    const labels: Record<string, string> = {
        ISO22301: 'ISO 22301',
        NIST800_34: 'NIST 800-34',
        FFIEC: 'FFIEC',
        COBIT2019: 'COBIT 2019',
        SOC2: 'SOC 2',
        GDPR: 'GDPR',
        HIPAA: 'HIPAA',
        PCI_DSS: 'PCI DSS',
    }
    return labels[standard] || standard
}

function formatStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        COMPLIANT: 'Compliant',
        PARTIALLY_COMPLIANT: 'Partially Compliant',
        NON_COMPLIANT: 'Non-Compliant',
        NOT_ASSESSED: 'Not Assessed',
    }
    return labels[status] || status
}

function handleSubmit(): void {
    const evidenceLinks = evidenceInput.value
        .split('\n')
        .map((link) => link.trim())
        .filter(Boolean)

    const submitData = {
        organisationId: form.organisationId,
        complianceStandard: form.complianceStandard,
        complianceStatus: form.complianceStatus,
        lastAuditDate: form.lastAuditDate,
        nextAuditDate: form.nextAuditDate,
        evidenceLinks,
        notes: form.notes,
        gapDescription: form.gapDescription,
        recommendation: form.recommendation,
    }

    emit('submit', submitData)
}
</script>