<template>
    <q-card>
        <q-card-section>
            <div class="text-h6">{{ isEditing ? 'Edit Maturity Assessment' : 'New Maturity Assessment' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                <!-- Assessment Date -->
                <q-input v-model="form.assessedDate" label="Assessment Date *" type="date" outlined dense
                    :rules="[requiredRule]" :disable="loading" />

                <!-- Score -->
                <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input v-model.number="form.score" label="Score *" type="number" outlined dense min="0"
                            max="100" :rules="[requiredRule, scoreRule]" :disable="loading">
                            <template v-slot:append>
                                <span class="text-grey-7">/ 100</span>
                            </template>
                        </q-input>
                    </div>

                    <!-- Level -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.level" :options="levelOptions" label="Maturity Level *" outlined dense
                            emit-value map-options :rules="[requiredRule]" :disable="loading" />
                    </div>
                </div>

                <!-- Domain Scores -->
                <div class="q-mt-md">
                    <div class="text-subtitle2 q-mb-sm">Domain Scores (Optional)</div>
                    <div class="row q-col-gutter-md">
                        <div v-for="domain in domainOptions" :key="domain.key" class="col-6 col-md-4">
                            <q-input v-model.number="form.domainScores[domain.key]" :label="domain.label" type="number"
                                outlined dense min="0" max="100" :disable="loading">
                                <template v-slot:append>
                                    <span class="text-grey-7">/ 100</span>
                                </template>
                            </q-input>
                        </div>
                    </div>
                </div>

                <!-- Findings -->
                <q-input v-model="form.findings" label="Findings" outlined dense type="textarea" rows="3"
                    :disable="loading" placeholder="Key observations and findings from the assessment..." />

                <!-- Recommendations -->
                <q-input v-model="form.recommendations" label="Recommendations" outlined dense type="textarea" rows="3"
                    :disable="loading" placeholder="Recommended actions to improve maturity..." />

                <!-- Assessed By -->
                <q-select v-model="form.assessedBy" :options="assessorOptions" label="Assessed By" outlined dense
                    emit-value map-options clearable :disable="loading" />

                <!-- Error Display -->
                <q-banner v-if="error" class="bg-red-1 text-red-8 rounded-borders" rounded>
                    <template v-slot:avatar>
                        <q-icon name="error" color="red-8" />
                    </template>
                    {{ error }}
                </q-banner>

                <!-- Actions -->
                <div class="row q-col-gutter-md">
                    <div class="col-6">
                        <q-btn flat color="grey" :label="$t('common.cancel')" class="full-width" :disable="loading"
                            @click="$emit('cancel')" />
                    </div>
                    <div class="col-6">
                        <q-btn type="submit" color="primary"
                            :label="isEditing ? $t('common.update') : $t('common.create')" :loading="loading"
                            class="full-width" unelevated />
                    </div>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type {
    MaturityAssessment,
    CreateMaturityAssessmentRequest,
    UpdateMaturityAssessmentRequest,
} from 'src/models/entities/governance/governance.entity'
import {
    getMaturityLevelLabel,
    getMaturityLevelRange,
    MaturityLevel,
} from 'src/models/entities/governance/governance.entity'
import { formatISO } from 'src/utils/date.utils';

// ============================================
// Props
// ============================================
const props = defineProps<{
    assessment?: MaturityAssessment
    loading?: boolean
    error?: string | null
    assessorOptions?: Array<{ label: string; value: string }>
}>()

// ============================================
// Emits
// ============================================
const emit = defineEmits<{
    submit: [data: CreateMaturityAssessmentRequest | UpdateMaturityAssessmentRequest]
    cancel: []
}>()

// ============================================
// State
// ============================================
const form = reactive({
    assessedDate: '',
    score: 0,
    level: null as MaturityLevel | null,
    findings: '',
    recommendations: '',
    assessedBy: null as string | null,
    domainScores: {} as Record<string, number>,
})

// ============================================
// Computed
// ============================================
const isEditing = computed(() => !!props.assessment?.uuid)

const levelOptions = [
    { label: 'Initial', value: 'INITIAL' },
    { label: 'Managed', value: 'MANAGED' },
    { label: 'Defined', value: 'DEFINED' },
    { label: 'Quantitatively Managed', value: 'QUANTITATIVELY_MANAGED' },
    { label: 'Optimised', value: 'OPTIMISED' },
    { label: 'Developing', value: 'DEVELOPING' },
    { label: 'Repeatable', value: 'REPEATABLE' },
    { label: 'Established', value: 'ESTABLISHED' },
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Optimising', value: 'OPTIMISING' },
].map(opt => ({
    ...opt,
    label: getMaturityLevelLabel(opt.value as MaturityLevel),
}))

const domainOptions = [
    { key: 'governance', label: 'Governance' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'people', label: 'People' },
    { key: 'process', label: 'Process' },
    { key: 'technology', label: 'Technology' },
    { key: 'culture', label: 'Culture' },
]

// ============================================
// Rules
// ============================================
const requiredRule = (val: any) => !!val || 'This field is required'

const scoreRule = (val: number) => {
    if (val === undefined || val === null) return 'Score is required'
    if (val < 0 || val > 100) return 'Score must be between 0 and 100'
    return true
}

// ============================================
// Methods
// ============================================
function handleSubmit(): void {
    if (!form.assessedDate || form.score === undefined || !form.level) {
        return
    }

    // Filter out empty domain scores
    const domainScores = Object.fromEntries(
        Object.entries(form.domainScores).filter(([_, value]) => value !== undefined && value !== null && value >= 0)
    )

    const submitData = {
        assessedDate: form.assessedDate,
        score: form.score,
        level: form.level,
        ...(form.findings ? { findings: form.findings } : {}),
        ...(form.recommendations ? { recommendations: form.recommendations } : {}),
        ...(form.assessedBy ? { assessedBy: form.assessedBy } : {}),
        ...(Object.keys(domainScores).length > 0 ? { domainScores } : {}),
    }

    emit('submit', submitData)
}

// Auto-populate level based on score
watch(
    () => form.score,
    (newScore) => {
        if (newScore !== undefined && newScore !== null) {
            // Find the matching level based on score range
            for (const option of levelOptions) {
                const range = getMaturityLevelRange(option.value as MaturityLevel)
                if (newScore >= range.min && newScore <= range.max) {
                    form.level = option.value as MaturityLevel
                    break
                }
            }
        }
    }
)

// ============================================
// Watch for assessment changes
// ============================================
watch(
    () => props.assessment,
    (assessment) => {
        if (assessment) {
            form.assessedDate = formatISO(assessment.assessedDate)
            form.score = assessment.score || 0
            form.level = assessment.level || null
            form.findings = assessment.findings || ''
            form.recommendations = assessment.recommendations || ''
            form.assessedBy = assessment.assessedBy || null
            form.domainScores = assessment.domainScores || {}
        }
    },
    { immediate: true }
)
</script>