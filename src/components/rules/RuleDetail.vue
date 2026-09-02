<template>
    <q-card flat bordered class="rule-detail">
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                    Rule Details
                    <q-badge v-if="rule" :color="getStatusColor(rule.status)" class="q-ml-sm">
                        {{ formatStatus(rule.status) }}
                    </q-badge>
                </div>
                <div class="q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit', rule)" />
                    <q-btn flat round size="sm" icon="close" @click="$emit('close')" />
                </div>
            </div>

            <div v-if="!rule" class="text-center q-py-md text-grey-7">
                Select a rule to view details
            </div>

            <div v-else>
                <!-- Basic Info -->
                <div class="q-mb-md">
                    <div class="text-subtitle1 text-weight-medium">{{ rule.name }}</div>
                    <p v-if="rule.description" class="text-body2 q-mt-sm text-grey-7">
                        {{ rule.description }}
                    </p>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Meta Info -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Type</div>
                        <q-badge :color="getTypeColor(rule.ruleType || rule.rule_type)">
                            {{ formatType(rule.ruleType || rule.rule_type) }}
                        </q-badge>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Trigger</div>
                        <div class="text-body2">{{ formatTrigger(rule.triggerEvent || rule.rule_trigger) }}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Priority</div>
                        <q-badge :color="getPriorityColor(rule.priority)" :label="'P' + rule.priority" />
                    </div>
                </div>

                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Entity Type</div>
                        <div class="text-body2">{{ rule.entityType || rule.entity_type || 'N/A' }}</div>
                    </div>
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Organisation</div>
                        <div class="text-body2">{{ rule.organisationName || rule.organisation?.name || 'N/A' }}</div>
                    </div>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Conditions -->
                <div class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Conditions</div>
                    <q-list bordered dense>
                        <q-item v-for="(condition, index) in getConditions(rule)" :key="index">
                            <q-item-section avatar>
                                <q-icon name="rule" color="blue" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>
                                    <code>{{ condition.field }}</code>
                                    {{ condition.operator }}
                                    <code>{{ formatValue(condition.value) }}</code>
                                </q-item-label>
                                <q-item-label caption v-if="condition.logicalOperator">
                                    Logical: {{ condition.logicalOperator }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge color="blue" label="Condition" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Actions -->
                <div class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Actions</div>
                    <q-list bordered dense>
                        <q-item v-for="(action, index) in getActions(rule)" :key="index">
                            <q-item-section avatar>
                                <q-icon name="play_arrow" color="green" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ formatActionType(action.type) }}</q-item-label>
                                <q-item-label caption>
                                    Params: {{ formatJSON(action.parameters || action.params) }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge color="green" label="Action" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Schedule -->
                <div v-if="rule.schedule" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Schedule</div>
                    <q-list bordered dense>
                        <q-item>
                            <q-item-section avatar>
                                <q-icon name="schedule" color="primary" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>Cron: <code>{{ rule.schedule.cron }}</code></q-item-label>
                                <q-item-label caption>Timezone: {{ rule.schedule.timezone }}</q-item-label>
                                <q-item-label caption v-if="rule.schedule.startDate">
                                    Start: {{ formatDate(rule.schedule.startDate) }}
                                </q-item-label>
                                <q-item-label caption v-if="rule.schedule.endDate">
                                    End: {{ formatDate(rule.schedule.endDate) }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Execution Stats -->
                <q-separator class="q-mb-md" />
                <div class="row q-col-gutter-sm text-caption text-grey-7">
                    <div class="col-3">
                        <div>Executions: {{ rule.executionCount || rule.execution_count || 0 }}</div>
                    </div>
                    <div class="col-3">
                        <div>Success: {{ rule.successCount || rule.success_count || 0 }}</div>
                    </div>
                    <div class="col-3" v-if="rule.failureCount || rule.failure_count">
                        <div class="text-negative">Failures: {{ rule.failureCount || rule.failure_count }}</div>
                    </div>
                    <div class="col-3" v-if="rule.lastExecutedAt || rule.last_executed_at">
                        <div>Last: {{ formatTimeAgo(rule.lastExecutedAt || rule.last_executed_at) }}</div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-4">
                        <q-btn color="primary" icon="play_arrow" label="Test" class="full-width" outline
                            @click="$emit('test', rule)" />
                    </div>
                    <div class="col-4">
                        <q-btn v-if="rule.status === 'ACTIVE' || rule.isActive" color="orange" icon="pause"
                            label="Deactivate" class="full-width" outline @click="$emit('deactivate', rule)" />
                        <q-btn v-else-if="rule.status !== 'ARCHIVED' && rule.status !== 'DEPRECATED'" color="green"
                            icon="play_arrow" label="Activate" class="full-width" outline
                            @click="$emit('activate', rule)" />
                    </div>
                    <div class="col-4">
                        <q-btn color="negative" icon="delete" label="Delete" class="full-width" outline
                            @click="$emit('delete', rule)" />
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { formatDate, formatTimeAgo } from '../../utils/date.utils'
import { formatJSON } from '../../utils/formatters'
import {
    getRuleTypeLabel,
    getRuleStatusLabel,
    getRuleTriggerLabel,
    getRuleTypeColor,
    getRuleStatusColor,
    getRulePriorityColor,
    getRuleActionTypeLabel,
} from '../../models/entities/rules/rule.entity'

const props = defineProps<{
    rule?: any
}>()

defineEmits<{
    close: []
    edit: [rule: any]
    test: [rule: any]
    activate: [rule: any]
    deactivate: [rule: any]
    delete: [rule: any]
}>()

function formatType(type: string): string {
    return getRuleTypeLabel(type)
}

function getTypeColor(type: string): string {
    return getRuleTypeColor(type)
}

function formatStatus(status: string): string {
    return getRuleStatusLabel(status)
}

function getStatusColor(status: string): string {
    return getRuleStatusColor(status)
}

function formatTrigger(trigger: string): string {
    return getRuleTriggerLabel(trigger)
}

function getPriorityColor(priority: number): string {
    return getRulePriorityColor(priority)
}

function formatActionType(type: string): string {
    return getRuleActionTypeLabel(type)
}

function getConditions(rule: any): any[] {
    return rule.conditions || []
}

function getActions(rule: any): any[] {
    return rule.actions || []
}

function formatValue(value: any): string {
    if (Array.isArray(value)) return `[${value.join(', ')}]`
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}
</script>