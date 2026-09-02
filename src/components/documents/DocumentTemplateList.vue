<template>
    <div class="document-template-list">
        <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Document Templates</div>
            <q-btn color="primary" icon="add" label="Create Template" unelevated @click="$emit('create')" />
        </div>

        <div v-if="loading" class="text-center q-pa-md">
            <q-spinner-dots size="40px" color="primary" />
        </div>

        <div v-else-if="templates && templates.length === 0" class="text-center q-py-xl">
            <q-icon name="description" size="60px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No Templates</div>
            <p class="text-grey-6">Create a template to standardize document creation</p>
            <q-btn color="primary" icon="add" label="Create Template" @click="$emit('create')" />
        </div>

        <div v-else class="row q-col-gutter-md">
            <div v-for="template in templates" :key="template.id" class="col-12 col-md-6 col-lg-4">
                <q-card flat bordered class="template-card">
                    <q-card-section>
                        <div class="row items-center justify-between">
                            <q-icon name="description" color="primary" size="32px" />
                            <q-badge :color="template.isActive || template.is_active ? 'green' : 'grey'"
                                :label="template.isActive || template.is_active ? 'Active' : 'Inactive'" />
                        </div>

                        <div class="text-h6 q-mt-sm">{{ template.name }}</div>
                        <div class="text-caption text-grey-6">{{ formatDocumentType(template.documentType ||
                            template.document_type) }}</div>

                        <p class="text-body2 q-mt-sm text-grey-7">
                            {{ truncateText(template.description, 100) }}
                        </p>

                        <div class="row q-gutter-sm q-mt-sm">
                            <q-badge outline color="primary">
                                {{ template.variables?.length || 0 }} variables
                            </q-badge>
                            <q-badge outline color="info">
                                v{{ template.version }}
                            </q-badge>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat color="primary" label="Preview" @click="$emit('preview', template)" />
                        <q-btn color="primary" label="Use" unelevated @click="$emit('use', template)" />
                        <q-btn flat round icon="more_vert" size="sm">
                            <q-menu>
                                <q-list dense>
                                    <q-item clickable v-close-popup @click="$emit('edit', template)">
                                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                        <q-item-section>Edit</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="$emit('duplicate', template)">
                                        <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
                                        <q-item-section>Duplicate</q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click="$emit('delete', template)">
                                        <q-item-section avatar><q-icon name="delete"
                                                color="negative" /></q-item-section>
                                        <q-item-section class="text-negative">Delete</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-card-actions>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

defineProps<{
    templates?: any[]
    loading?: boolean
}>()

defineEmits<{
    create: []
    preview: [template: any]
    use: [template: any]
    edit: [template: any]
    duplicate: [template: any]
    delete: [template: any]
}>()

function formatDocumentType(type: string): string {
    const labels: Record<string, string> = {
        BCM_POLICY: 'BCM Policy',
        RISK_ASSESSMENT: 'Risk Assessment',
        BIA_REPORT: 'BIA Report',
        BCP_DOCUMENT: 'BCP Document',
        RECOVERY_STRATEGY: 'Recovery Strategy',
        TEST_RESULTS: 'Test Results',
        INCIDENT_REPORT: 'Incident Report',
        COMPLIANCE_EVIDENCE: 'Compliance Evidence',
        TRAINING_MATERIAL: 'Training Material',
        AUDIT_REPORT: 'Audit Report',
        EXERCISE_REPORT: 'Exercise Report',
        MEETING_MINUTES: 'Meeting Minutes',
        PROCEDURE: 'Procedure',
        WORK_INSTRUCTION: 'Work Instruction',
        CONTACT_LIST: 'Contact List',
        VENDOR_CONTRACT: 'Vendor Contract',
        SLA_DOCUMENT: 'SLA Document',
        REGULATORY_DOCUMENT: 'Regulatory Document',
        CERTIFICATE: 'Certificate',
        GAP_ANALYSIS: 'Gap Analysis',
        IMPROVEMENT_PLAN: 'Improvement Plan',
        OTHER: 'Other',
    }
    return labels[type] || type
}

function truncateText(text: string, max: number): string {
    return text?.length > max ? text.substring(0, max) + '...' : text || ''
}
</script>

<style lang="scss" scoped>
.template-card {
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
}
</style>