<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 500px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6 text-orange">Escalate Incident</div>
                <div class="text-subtitle2 text-grey-7">{{ incident?.incidentTitle || incident?.root_cause }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <!-- Current Escalation Level -->
                    <div class="q-mb-md">
                        <div class="text-caption text-grey-6">Current Escalation Level</div>
                        <q-badge :color="getEscalationColor(currentLevel)" size="lg" class="q-py-sm">
                            {{ formatEscalationLevel(currentLevel) }}
                        </q-badge>
                    </div>

                    <!-- Target Escalation Level -->
                    <q-select v-model="form.escalationLevel" :options="escalationOptions" label="Escalate To *" outlined
                        dense :rules="[requiredRule]" emit-value map-options />

                    <q-input v-model="form.escalatedTo" label="Escalate To (Person/Team) *" outlined dense
                        :rules="[requiredRule]" placeholder="Enter name or team" />

                    <q-input v-model="form.reason" label="Escalation Reason *" outlined dense type="textarea" rows="3"
                        :rules="[requiredRule]" placeholder="Why is this incident being escalated?" />

                    <q-input v-model="form.notes" label="Additional Notes" outlined dense type="textarea" rows="2"
                        placeholder="Any additional context..." />

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>

                    <div class="row q-gutter-md">
                        <div class="col">
                            <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup
                                @click="$emit('cancel')" />
                        </div>
                        <div class="col">
                            <q-btn type="submit" color="orange" icon="arrow_upward" label="Escalate"
                                :loading="submitting" class="full-width" unelevated />
                        </div>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import {
    EscalationLevel,
    getEscalationLevelLabel,
    getEscalationLevelColor,
} from './../../models/entities/incident/incident.entity'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        incident?: any
        submitting?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        incident: null,
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

const currentLevel = computed(() => {
    return props.incident?.escalationLevel ||
        props.incident?.escalation_level ||
        'NO_ESCALATION'
})

const form = reactive({
    escalationLevel: null as string | null,
    escalatedTo: '',
    reason: '',
    notes: '',
})

const escalationOptions = Object.values(EscalationLevel).map((value) => ({
    label: getEscalationLevelLabel(value),
    value,
}))

const requiredRule = (val: any) => !!val || 'This field is required'

function formatEscalationLevel(level: string): string {
    return getEscalationLevelLabel(level)
}

function getEscalationColor(level: string): string {
    return getEscalationLevelColor(level)
}

function handleSubmit(): void {
    if (!form.escalationLevel || !form.escalatedTo || !form.reason) return
    emit('submit', { ...form })
}
</script>