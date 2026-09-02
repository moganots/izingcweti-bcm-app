<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 600px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">
                    {{ isEditing ? 'Edit' : 'Report' }} Incident
                </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <q-input v-model="form.incidentTitle" label="Incident Title *" outlined dense
                        :rules="[requiredRule]" autofocus />

                    <q-select v-model="form.incidentSeverity" :options="severityOptions" label="Severity *" outlined
                        dense :rules="[requiredRule]" emit-value map-options>
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                    <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>

                    <q-input v-model="form.rootCause" label="Root Cause *" outlined dense type="textarea" rows="2"
                        :rules="[requiredRule]" placeholder="Describe the root cause of the incident" />

                    <q-select v-model="form.businessContinuityPlanIdActivated" :options="bcpOptions"
                        label="Activated BCP (Optional)" outlined dense emit-value map-options clearable />

                    <q-input v-model="form.recoveryActualTime" label="Recovery Actual Time" outlined dense
                        placeholder="e.g., 3 hours 30 minutes" hint="Estimated or actual time to recover" />

                    <q-select v-model="form.assignedTo" :options="userOptions" label="Assign To (Optional)" outlined
                        dense emit-value map-options clearable />

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>

                    <div class="row q-gutter-md">
                        <div class="col">
                            <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup
                                @click="$emit('cancel')" />
                        </div>
                        <div class="col">
                            <q-btn type="submit" color="negative" :label="isEditing ? 'Update' : 'Report Incident'"
                                :loading="submitting" class="full-width" unelevated />
                        </div>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import {
    IncidentSeverity,
    getIncidentSeverityLabel,
    getIncidentSeverityIcon,
    getIncidentSeverityColor,
} from './../../models/entities/incident/incident.entity'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        editing?: boolean
        incidentData?: any
        bcps?: any[]
        users?: any[]
        submitting?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        editing: false,
        incidentData: null,
        bcps: () => [],
        users: () => [],
        submitting: false,
        errorMessage: '',
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

const isEditing = computed(() => props.editing || !!props.incidentData?.id)

const form = reactive({
    incidentTitle: '',
    incidentSeverity: null as string | null,
    rootCause: '',
    businessContinuityPlanIdActivated: null as string | null,
    recoveryActualTime: '',
    assignedTo: null as string | null,
})

const severityOptions = Object.values(IncidentSeverity).map((value) => ({
    label: getIncidentSeverityLabel(value),
    value,
    icon: getIncidentSeverityIcon(value),
    color: getIncidentSeverityColor(value),
}))

const bcpOptions = computed(() =>
    props.bcps.map((b: any) => ({
        label: b.criticalFunction?.name || b.critical_function?.name || 'Unknown BCP',
        value: b.id || b.uuid,
    }))
)

const userOptions = computed(() =>
    props.users.map((u: any) => ({
        label: u.email || u.name || 'Unknown User',
        value: u.id || u.uuid,
    }))
)

const requiredRule = (val: any) => !!val || 'This field is required'

watch(
    () => props.incidentData,
    (data) => {
        if (data) {
            form.incidentTitle = data.incidentTitle || data.incident_title || ''
            form.incidentSeverity = data.incidentSeverity || data.incident_severity || null
            form.rootCause = data.rootCause || data.root_cause || ''
            form.businessContinuityPlanIdActivated =
                data.businessContinuityPlanIdActivated ||
                data.business_continuity_plan_id_activated ||
                null
            form.recoveryActualTime = data.recoveryActualTime || data.recovery_actual_time || ''
            form.assignedTo = data.assignedTo || data.assigned_to || null
        }
    },
    { immediate: true }
)

function handleSubmit(): void {
    if (!form.incidentTitle || !form.incidentSeverity || !form.rootCause) return

    const submitData = {
        incidentTitle: form.incidentTitle,
        incidentSeverity: form.incidentSeverity,
        rootCause: form.rootCause,
        businessContinuityPlanIdActivated: form.businessContinuityPlanIdActivated,
        recoveryActualTime: form.recoveryActualTime,
        assignedTo: form.assignedTo,
    }

    emit('submit', submitData)
}
</script>