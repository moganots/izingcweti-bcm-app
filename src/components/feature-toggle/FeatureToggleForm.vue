<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 700px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">
                    {{ isEditing ? 'Edit' : 'Create' }} Feature Toggle
                </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <!-- Basic Info -->
                    <q-input v-model="form.name" label="Feature Name *" outlined dense :rules="[requiredRule]"
                        hint="Unique identifier for the feature toggle" />

                    <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2" />

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-select v-model="form.toggleType" :options="typeOptions" label="Toggle Type *" outlined
                                dense :rules="[requiredRule]" emit-value map-options />
                        </div>
                        <div class="col-6">
                            <q-select v-model="form.environment" :options="environmentOptions" label="Environment *"
                                outlined dense :rules="[requiredRule]" emit-value map-options />
                        </div>
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-select v-model="form.status" :options="statusOptions" label="Status" outlined dense
                                emit-value map-options />
                        </div>
                        <div class="col-6">
                            <q-toggle v-model="form.defaultValue"
                                :label="form.defaultValue ? 'Default: ON' : 'Default: OFF'" color="primary" size="lg" />
                        </div>
                    </div>

                    <q-input v-model="form.scheduledFor" label="Schedule Activation" type="datetime-local" outlined
                        dense clearable hint="Optional: Schedule when this toggle should activate" />

                    <!-- Targeting Rules -->
                    <div class="text-subtitle1 q-mt-md q-mb-sm">Targeting Rules</div>
                    <div v-for="(rule, index) in form.targetingRules" :key="index"
                        class="row q-col-gutter-sm q-mb-sm items-center">
                        <div class="col-3">
                            <q-select v-model="rule.type" :options="targetingOptions" label="Type" outlined dense
                                emit-value map-options />
                        </div>
                        <div class="col-3">
                            <q-select v-model="rule.condition.operator" :options="operatorOptions" label="Operator"
                                outlined dense emit-value map-options />
                        </div>
                        <div class="col-4">
                            <q-input v-model="rule.condition.values" label="Values (comma separated)" outlined dense
                                :hint="getRuleHint(rule.type)" />
                        </div>
                        <div class="col-1">
                            <q-toggle v-model="rule.value" color="primary" />
                        </div>
                        <div class="col-1">
                            <q-btn flat round icon="delete" color="negative" size="sm" @click="removeRule(index)" />
                        </div>
                    </div>

                    <q-btn flat color="primary" icon="add" label="Add Targeting Rule" size="sm" @click="addRule" />

                    <!-- Metadata -->
                    <q-input v-model="metadataInput" label="Custom Metadata (JSON)" outlined dense type="textarea"
                        rows="2" placeholder='{"key": "value"}' />

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>

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
import {
    FeatureToggleStatus,
    FeatureToggleType,
    ToggleEnvironment,
    TargetingType,
    getFeatureToggleStatusLabel,
    getToggleEnvironmentLabel,
    getFeatureToggleTypeLabel,
    getTargetingTypeLabel,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        editing?: boolean
        toggleData?: any
        submitting?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        editing: false,
        toggleData: null,
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

const isEditing = computed(() => props.editing || !!props.toggleData?.id)

const metadataInput = ref('')

const form = reactive({
    name: '',
    description: '',
    toggleType: null as string | null,
    environment: null as string | null,
    status: 'DRAFT',
    defaultValue: false,
    targetingRules: [] as any[],
    scheduledFor: null as string | null,
})

const statusOptions = Object.values(FeatureToggleStatus).map((value) => ({
    label: getFeatureToggleStatusLabel(value),
    value,
}))

const typeOptions = Object.values(FeatureToggleType).map((value) => ({
    label: getFeatureToggleTypeLabel(value),
    value,
}))

const environmentOptions = Object.values(ToggleEnvironment).map((value) => ({
    label: getToggleEnvironmentLabel(value),
    value,
}))

const targetingOptions = Object.values(TargetingType).map((value) => ({
    label: getTargetingTypeLabel(value),
    value,
}))

const operatorOptions = [
    { label: 'IN', value: 'IN' },
    { label: 'NOT IN', value: 'NOT_IN' },
    { label: 'EQUALS', value: 'EQUALS' },
    { label: 'NOT EQUALS', value: 'NOT_EQUALS' },
    { label: 'GREATER THAN', value: 'GREATER_THAN' },
    { label: 'LESS THAN', value: 'LESS_THAN' },
    { label: 'CONTAINS', value: 'CONTAINS' },
]

const requiredRule = (val: any) => !!val || 'This field is required'

watch(
    () => props.toggleData,
    (data) => {
        if (data) {
            form.name = data.name || ''
            form.description = data.description || ''
            form.toggleType = data.toggleType || data.toggle_type || null
            form.environment = data.environment || null
            form.status = data.status || 'DRAFT'
            form.defaultValue = data.defaultValue || data.default_value || false
            form.targetingRules = data.targetingRules || data.targeting_rules || []
            form.scheduledFor = data.scheduledFor || data.scheduled_for || null

            if (data.metadata) {
                metadataInput.value = typeof data.metadata === 'string'
                    ? data.metadata
                    : JSON.stringify(data.metadata, null, 2)
            }
        }
    },
    { immediate: true }
)

function getRuleHint(type: string): string {
    const hints: Record<string, string> = {
        USER_ID: 'e.g. user1, user2',
        ORGANISATION_ID: 'e.g. org1, org2',
        ROLE: 'e.g. admin, user',
        PERCENTAGE: 'e.g. 50 (for 50%)',
    }
    return hints[type] || 'Enter comma separated values'
}

function addRule(): void {
    form.targetingRules.push({
        id: Date.now().toString(),
        type: TargetingType.USER_ID,
        condition: {
            operator: 'IN',
            values: [],
        },
        value: true,
        order: form.targetingRules.length,
    })
}

function removeRule(index: number): void {
    form.targetingRules.splice(index, 1)
}

function handleSubmit(): void {
    if (!form.name || !form.toggleType || !form.environment) return

    let metadata = null
    if (metadataInput.value) {
        try {
            metadata = JSON.parse(metadataInput.value)
        } catch {
            metadata = metadataInput.value
        }
    }

    // Parse values from comma-separated strings
    const rules = form.targetingRules.map((rule: any) => {
        const values = typeof rule.condition.values === 'string'
            ? rule.condition.values.split(',').map((v: string) => v.trim()).filter(Boolean)
            : rule.condition.values || []

        return {
            ...rule,
            condition: {
                ...rule.condition,
                values,
            },
        }
    })

    const submitData = {
        name: form.name,
        description: form.description,
        toggleType: form.toggleType,
        environment: form.environment,
        status: form.status,
        defaultValue: form.defaultValue,
        targetingRules: rules,
        metadata,
        scheduledFor: form.scheduledFor,
    }

    emit('submit', submitData)
}
</script>