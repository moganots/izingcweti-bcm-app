<template>
    <q-card flat bordered class="workflow-detail">
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                    Workflow Details
                    <q-badge v-if="workflow" :color="getStateColor(workflow.workflowState || workflow.workflow_state)"
                        class="q-ml-sm">
                        {{ formatState(workflow.workflowState || workflow.workflow_state) }}
                    </q-badge>
                </div>
                <div class="q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit', workflow)" />
                    <q-btn flat round size="sm" icon="close" @click="$emit('close')" />
                </div>
            </div>

            <div v-if="!workflow" class="text-center q-py-md text-grey-7">
                Select a workflow to view details
            </div>

            <div v-else>
                <!-- Basic Info -->
                <div class="q-mb-md">
                    <div class="text-subtitle1 text-weight-medium">{{ workflow.title }}</div>
                    <p v-if="workflow.description" class="text-body2 q-mt-sm text-grey-7">
                        {{ workflow.description }}
                    </p>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Meta Info -->
                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Type</div>
                        <div class="text-body2">{{ formatType(workflow.workflowType || workflow.workflow_type) }}</div>
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Priority</div>
                        <q-badge :color="getPriorityColor(workflow.priority)" :label="'P' + workflow.priority" />
                    </div>
                    <div class="col-4">
                        <div class="text-caption text-grey-6">Due Date</div>
                        <div class="text-body2"
                            :class="isOverdue(workflow.dueDate || workflow.due_date) ? 'text-negative' : ''">
                            {{ formatDate(workflow.dueDate || workflow.due_date) || 'N/A' }}
                        </div>
                    </div>
                </div>

                <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Assigned To</div>
                        <div class="text-body2">{{ workflow.assigneeName || workflow.assigned_to || 'Unassigned' }}
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Initiated By</div>
                        <div class="text-body2">{{ workflow.initiatorName || workflow.initiated_by || 'Unknown' }}</div>
                    </div>
                </div>

                <!-- Entity Reference -->
                <div v-if="workflow.entityType || workflow.entity_type" class="q-mb-md">
                    <div class="text-caption text-grey-6">Related Entity</div>
                    <q-badge outline color="primary">
                        {{ workflow.entityType || workflow.entity_type }}: {{ workflow.entityId || workflow.entity_id ||
                        'N/A' }}
                    </q-badge>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Approval Chain -->
                <div class="q-mb-md">
                    <ApprovalChain :steps="workflow.approvalChain || workflow.approval_chain || []" />
                </div>

                <!-- Comments -->
                <div v-if="workflow.comments?.length > 0" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">Comments</div>
                    <q-list bordered dense>
                        <q-item v-for="(comment, index) in workflow.comments" :key="index">
                            <q-item-section avatar>
                                <q-icon name="chat" color="grey" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ comment.comment }}</q-item-label>
                                <q-item-label caption>
                                    {{ formatDateTime(comment.timestamp || comment.created_at) }}
                                    <span v-if="comment.userName || comment.user_name"> by {{ comment.userName ||
                                        comment.user_name }}</span>
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side v-if="comment.action">
                                <q-badge :color="getActionColor(comment.action)" :label="comment.action" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Timeline -->
                <div class="q-mb-md">
                    <WorkflowTimeline :workflow="workflow" />
                </div>

                <!-- Actions -->
                <div class="q-mt-md">
                    <ApprovalActions :workflow="workflow" :submitting="submitting" :user-options="userOptions"
                        @submit="handleSubmit" @approve="handleApprove" @reject="handleReject"
                        @escalate="handleEscalate" @reassign="handleReassign" @request-info="handleRequestInfo"
                        @complete="handleComplete" @cancel="handleCancel" @comment="handleComment"
                        @edit="$emit('edit', workflow)" @archive="$emit('archive', workflow)" />
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { formatDate, formatDateTime } from '../../utils/date.utils'
import ApprovalChain from './ApprovalChain.vue'
import ApprovalActions from './ApprovalActions.vue'
import WorkflowTimeline from './WorkflowTimeline.vue'
import {
    getWorkflowStateLabel,
    getWorkflowTypeLabel,
    getWorkflowStateColor,
    getWorkflowPriorityColor,
} from '../../types/workflow.types'

const props = withDefaults(
    defineProps<{
        workflow?: any
        submitting?: boolean
        userOptions?: Array<{ label: string; value: string }>
    }>(),
    {
        workflow: null,
        submitting: false,
        userOptions: () => [],
    }
)

const emit = defineEmits<{
    close: []
    edit: [workflow: any]
    archive: [workflow: any]
    submit: [data: { comments: string }]
    approve: [data: { comments: string }]
    reject: [data: { rejection_reason: string; comments?: string }]
    escalate: [data: { escalation_level: number; reason: string }]
    reassign: [data: { assigned_to: string; reason?: string }]
    'request-info': [data: { message: string }]
    complete: [data: { comments?: string }]
    cancel: [data: { reason?: string }]
    comment: [data: { comment: string }]
}>()

function formatState(state: string): string {
    return getWorkflowStateLabel(state)
}

function getStateColor(state: string): string {
    return getWorkflowStateColor(state)
}

function formatType(type: string): string {
    return getWorkflowTypeLabel(type)
}

function getPriorityColor(priority: number | string): string {
    return getWorkflowPriorityColor(priority)
}

function isOverdue(date: string): boolean {
    if (!date) return false
    return new Date(date) < new Date()
}

function getActionColor(action: string): string {
    const colors: Record<string, string> = {
        SUBMIT: 'blue',
        APPROVE: 'green',
        REJECT: 'red',
        ESCALATE: 'orange',
        REASSIGN: 'purple',
        COMMENT: 'grey',
        COMPLETE: 'green',
        CANCEL: 'grey',
        'REQUEST-INFO': 'yellow',
    }
    return colors[action] || 'grey'
}

// Event handlers that forward to parent
function handleSubmit(data: { comments: string }): void {
    emit('submit', data)
}

function handleApprove(data: { comments: string }): void {
    emit('approve', data)
}

function handleReject(data: { rejection_reason: string; comments?: string }): void {
    emit('reject', data)
}

function handleEscalate(data: { escalation_level: number; reason: string }): void {
    emit('escalate', data)
}

function handleReassign(data: { assigned_to: string; reason?: string }): void {
    emit('reassign', data)
}

function handleRequestInfo(data: { message: string }): void {
    emit('request-info', data)
}

function handleComplete(data: { comments?: string }): void {
    emit('complete', data)
}

function handleCancel(data: { reason?: string }): void {
    emit('cancel', data)
}

function handleComment(data: { comment: string }): void {
    emit('comment', data)
}
</script>