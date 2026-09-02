<template>
    <q-card flat bordered class="feature-toggle-detail">
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                    {{ toggle?.name || 'Feature Toggle Details' }}
                </div>
                <div class="q-gutter-sm">
                    <q-btn flat round size="sm" icon="edit" @click="$emit('edit', toggle)">
                        <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn flat round size="sm" icon="close" @click="$emit('close')">
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </div>
            </div>

            <div v-if="!toggle" class="text-center q-py-md text-grey-7">
                Select a feature toggle to view details
            </div>

            <div v-else>
                <!-- Status & Environment -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-4">
                        <FeatureToggleStatusBadge :status="toggle.status" size="lg" />
                    </div>
                    <div class="col-4">
                        <q-badge :color="getEnvironmentColor(toggle.environment)"
                            :label="formatEnvironment(toggle.environment)" class="q-px-md q-py-sm" />
                    </div>
                    <div class="col-4">
                        <q-badge :color="getTypeColor(toggle.toggleType || toggle.toggle_type)"
                            :label="formatType(toggle.toggleType || toggle.toggle_type)" class="q-px-md q-py-sm" />
                    </div>
                </div>

                <!-- Description -->
                <p v-if="toggle.description" class="text-body2 q-mb-md">
                    {{ toggle.description }}
                </p>

                <q-separator class="q-mb-md" />

                <!-- Key Metrics -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Default Value</div>
                        <div class="text-h6">
                            <q-icon :name="toggle.defaultValue || toggle.default_value ? 'check_circle' : 'cancel'"
                                :color="toggle.defaultValue || toggle.default_value ? 'green' : 'grey'" />
                            {{ toggle.defaultValue || toggle.default_value ? 'ON' : 'OFF' }}
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Evaluations</div>
                        <div class="text-h6">{{ toggle.evaluation_count || 0 }}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">True Rate</div>
                        <div class="text-h6">{{ getTrueRate(toggle) }}%</div>
                    </div>
                </div>

                <!-- Targeting Rules -->
                <div v-if="toggle.targetingRules || toggle.targeting_rules" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Targeting Rules</div>
                    <q-list bordered dense>
                        <q-item v-for="(rule, index) in getRules(toggle)" :key="index">
                            <q-item-section avatar>
                                <q-icon :name="getRuleIcon(rule.type)" color="primary" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ formatTargetingType(rule.type) }}</q-item-label>
                                <q-item-label caption>
                                    {{ rule.condition.operator }} {{ getRuleValues(rule.condition.values) }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge :color="rule.value ? 'green' : 'grey'" :label="rule.value ? 'ON' : 'OFF'" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Schedule -->
                <div v-if="toggle.scheduledFor || toggle.scheduled_for" class="q-mb-md">
                    <div class="text-caption text-grey-6">Scheduled Activation</div>
                    <div class="text-body2">
                        {{ formatDate(toggle.scheduledFor || toggle.scheduled_for) }}
                    </div>
                </div>

                <!-- Metadata -->
                <div v-if="toggle.metadata && Object.keys(toggle.metadata).length > 0" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Metadata</div>
                    <pre class="metadata-preview">{{ formatJSON(toggle.metadata) }}</pre>
                </div>

                <!-- Dates -->
                <q-separator class="q-mb-md" />
                <div class="row q-col-gutter-sm text-caption text-grey-7">
                    <div class="col-4">
                        <div>Created: {{ formatDate(toggle.created_at || toggle.createdAt) }}</div>
                    </div>
                    <div class="col-4" v-if="toggle.activated_at">
                        <div>Activated: {{ formatDate(toggle.activated_at) }}</div>
                    </div>
                    <div class="col-4" v-if="toggle.deactivated_at">
                        <div>Deactivated: {{ formatDate(toggle.deactivated_at) }}</div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-6">
                        <q-btn color="primary" icon="science" label="Evaluate" class="full-width" outline
                            @click="$emit('evaluate', toggle)" />
                    </div>
                    <div class="col-6">
                        <q-btn color="primary" icon="rule" label="Overrides" class="full-width" outline
                            @click="$emit('overrides', toggle)" />
                    </div>
                </div>

                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-6">
                        <q-btn :color="isToggleActive(toggle) ? 'orange' : 'green'"
                            :icon="isToggleActive(toggle) ? 'pause' : 'play_arrow'"
                            :label="isToggleActive(toggle) ? 'Deactivate' : 'Activate'" class="full-width" unelevated
                            @click="$emit('toggle-status', toggle)" />
                    </div>
                    <div class="col-6">
                        <q-btn color="negative" icon="delete" label="Delete" class="full-width" outline
                            @click="$emit('delete', toggle)" />
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'
import { formatJSON } from '../../utils/formatters'
import FeatureToggleStatusBadge from './FeatureToggleStatusBadge.vue'
import { FeatureToggleStatus, getFeatureToggleTypeLabel, getTargetingTypeLabel } from './../../models/entities/feature-toggle/feature-toggle.entity'

const props = defineProps<{
    toggle?: any
}>()

defineEmits<{
    close: []
    edit: [toggle: any]
    evaluate: [toggle: any]
    overrides: [toggle: any]
    'toggle-status': [toggle: any]
    delete: [toggle: any]
}>()

function formatEnvironment(environment: string): string {
    const labels: Record<string, string> = {
        DEVELOPMENT: 'Development',
        STAGING: 'Staging',
        PRODUCTION: 'Production',
        TESTING: 'Testing',
        INTEGRATION: 'Integration',
    }
    return labels[environment] || environment
}

function getEnvironmentColor(environment: string): string {
    const colors: Record<string, string> = {
        DEVELOPMENT: 'blue',
        STAGING: 'orange',
        PRODUCTION: 'positive',
        TESTING: 'purple',
        INTEGRATION: 'teal',
    }
    return colors[environment] || 'grey'
}

function formatType(type: string): string {
    return getFeatureToggleTypeLabel(type)
}

function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
        RELEASE: 'green',
        EXPERIMENT: 'purple',
        OPERATIONAL: 'blue',
        PERMISSION: 'orange',
        KILL_SWITCH: 'red',
    }
    return colors[type] || 'grey'
}

function getRules(toggle: any): any[] {
    return toggle.targetingRules || toggle.targeting_rules || []
}

function formatTargetingType(type: string): string {
    return getTargetingTypeLabel(type)
}

function getRuleIcon(type: string): string {
    const icons: Record<string, string> = {
        USER_ID: 'person',
        ORGANISATION_ID: 'business',
        ROLE: 'badge',
        PERCENTAGE: 'percent',
        CUSTOM: 'code',
        ALL_USERS: 'people',
        CUSTOM_RULE: 'rule',
    }
    return icons[type] || 'circle'
}

function getRuleValues(values: any[]): string {
    if (!values) return ''
    if (Array.isArray(values)) {
        return values.length > 3
            ? `${values.slice(0, 3).join(', ')}... (${values.length})`
            : values.join(', ')
    }
    return String(values)
}

function isToggleActive(toggle: any): boolean {
    return toggle.status === FeatureToggleStatus.ACTIVE
}

function getTrueRate(toggle: any): number {
    const total = toggle.evaluation_count || 0
    const trueCount = toggle.true_evaluation_count || 0
    if (total === 0) return 0
    return Math.round((trueCount / total) * 100)
}
</script>

<style lang="scss" scoped>
.metadata-preview {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    margin: 0;
    max-height: 150px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>