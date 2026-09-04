<!-- components/governance/MaturityAssessmentDetails.vue -->
<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div>
                    <div class="text-h5">Maturity Assessment Details</div>
                    <div class="text-subtitle2 text-grey-7">
                        Assessed {{ formatDate(assessment?.assessedDate) }}
                    </div>
                </div>
                <div class="row q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit')" />
                    <q-btn flat color="negative" icon="delete" label="Delete" @click="$emit('delete')" />
                    <q-btn flat color="grey" icon="close" label="Close" @click="$emit('close')" />
                </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Score Display -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6 col-md-4">
                    <div class="score-display">
                        <div class="score-value">{{ assessment?.score || 0 }}</div>
                        <div class="score-label">Overall Score</div>
                        <q-linear-progress :value="(assessment?.score || 0) / 100" color="primary" size="8px"
                            class="q-mt-sm" />
                    </div>
                </div>
                <div class="col-6 col-md-4">
                    <div class="score-display">
                        <q-badge :color="getLevelColor(assessment?.level || MaturityLevel.INITIAL)"
                            :label="getLevelLabel(assessment?.level || MaturityLevel.INITIAL)" size="lg" class="q-px-lg q-py-md"
                            style="font-size: 1.1rem;" />
                        <div class="score-label q-mt-sm">Maturity Level</div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="score-display">
                        <div class="text-caption text-grey-7">Level Range</div>
                        <div class="text-body2">
                            {{ getLevelRange(assessment?.level || MaturityLevel.INITIAL).min }}% - {{
                                getLevelRange(assessment?.level || MaturityLevel.INITIAL).max }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Domain Scores -->
            <div v-if="assessment?.domainScores && Object.keys(assessment.domainScores).length > 0" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Domain Scores</div>
                <div class="row q-col-gutter-sm">
                    <div v-for="(score, domain) in assessment.domainScores" :key="domain" class="col-6 col-md-3">
                        <div class="domain-score">
                            <div class="domain-label">{{ formatDomainLabel(domain) }}</div>
                            <div class="domain-value">{{ score }}%</div>
                            <q-linear-progress :value="score / 100" :color="getScoreColor(score)" size="4px"
                                class="q-mt-xs" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Findings -->
            <div v-if="assessment?.findings" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Findings</div>
                <div class="text-body2 bg-grey-1 q-pa-md rounded-borders">
                    {{ assessment.findings }}
                </div>
            </div>

            <!-- Recommendations -->
            <div v-if="assessment?.recommendations" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Recommendations</div>
                <div class="text-body2 bg-grey-1 q-pa-md rounded-borders">
                    {{ assessment.recommendations }}
                </div>
            </div>

            <!-- Metadata -->
            <div class="row q-col-gutter-md q-mt-md">
                <div class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Assessed By</div>
                    <div class="text-body2">{{ assessment?.assessor?.email || assessment?.assessedBy || 'Unknown' }}
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Assessment Date</div>
                    <div class="text-body2">{{ formatDate(assessment?.assessedDate) }}</div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Department</div>
                    <div class="text-body2">{{ assessment?.department?.name || 'All' }}</div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Created</div>
                    <div class="text-body2">{{ formatTimeAgo(assessment?.createdAt) }}</div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import type { MaturityAssessment } from 'src/models/entities/governance/governance.entity'
import {
    getMaturityLevelLabel,
    getMaturityLevelColor,
    getMaturityLevelRange,
    MaturityLevel,
} from 'src/models/entities/governance/governance.entity'
import { formatDate, formatTimeAgo } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
defineProps<{
    assessment: MaturityAssessment | null
}>()

// ============================================
// Emits
// ============================================
defineEmits<{
    edit: []
    delete: []
    close: []
}>()

// ============================================
// Methods
// ============================================
function getLevelLabel(level: MaturityLevel): string {
    return getMaturityLevelLabel(level)
}

function getLevelColor(level: MaturityLevel): string {
    return getMaturityLevelColor(level)
}

function getLevelRange(level: MaturityLevel): { min: number; max: number } {
    return getMaturityLevelRange(level)
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'positive'
    if (score >= 60) return 'info'
    if (score >= 40) return 'warning'
    return 'negative'
}

function formatDomainLabel(key: string): string {
    const labels: Record<string, string> = {
        governance: 'Governance',
        strategy: 'Strategy',
        people: 'People',
        process: 'Process',
        technology: 'Technology',
        culture: 'Culture',
    }
    return labels[key] || key
}
</script>

<style lang="scss" scoped>
.score-display {
    text-align: center;
    padding: 16px;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-color);

    .score-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary);
    }

    .score-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 4px;
    }
}

.domain-score {
    padding: 8px 12px;
    background: var(--bg-card);
    border-radius: 6px;
    border: 1px solid var(--border-color);

    .domain-label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .domain-value {
        font-size: 1.1rem;
        font-weight: 600;
    }
}
</style>