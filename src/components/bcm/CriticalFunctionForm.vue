<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 600px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">{{ isEditing ? 'Edit' : 'Create' }} Critical Function</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <q-input v-model="form.name" label="Function Name" outlined dense :rules="[requiredRule]" />

                    <q-select v-model="form.department_id" :options="departmentOptions" label="Department" outlined
                        dense emit-value map-options :rules="[requiredRule]" />

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-select v-model="form.mto_hours" :options="mtoOptions"
                                label="Maximum Tolerable Outage (MTO)" outlined dense emit-value map-options
                                :rules="[requiredRule]" />
                        </div>
                        <div class="col-6">
                            <q-select v-model="form.work_recovery_time" :options="wrtOptions"
                                label="Work Recovery Time (WRT)" outlined dense emit-value map-options
                                :rules="[requiredRule]" />
                        </div>
                    </div>

                    <q-input v-model="form.description" label="Description" type="textarea" outlined dense rows="3" />

                    <q-select v-model="form.dependency_ids" :options="functionOptions" label="Dependencies" outlined
                        dense multiple emit-value map-options use-chips />

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-input v-model="form.resource_requirements" label="Resource Requirements" outlined dense
                                hint="e.g. 5 staff, 2 servers, 1 office" />
                        </div>
                        <div class="col-6">
                            <q-input v-model="form.recovery_costs" label="Estimated Recovery Costs" outlined dense
                                type="number" prefix="$" />
                        </div>
                    </div>

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>
                </q-form>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" color="grey" v-close-popup @click="$emit('cancel')" />
                <q-btn color="primary" :label="isEditing ? 'Update' : 'Create'" :loading="loading"
                    @click="handleSubmit" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        functionData?: any
        departments?: any[]
        functions?: any[]
        loading?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        functionData: null,
        departments: () => [],
        functions: () => [],
        loading: false,
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

const isEditing = computed(() => !!props.functionData?.id)

const form = reactive({
    name: '',
    department_id: null as string | null,
    mto_hours: 4,
    work_recovery_time: 2,
    description: '',
    dependency_ids: [] as string[],
    resource_requirements: '',
    recovery_costs: 0,
})

watch(
    () => props.functionData,
    (data) => {
        if (data) {
            Object.assign(form, data)
        }
    },
    { immediate: true }
)

const departmentOptions = computed(() =>
    props.departments.map((d) => ({ label: d.name, value: d.id }))
)

const functionOptions = computed(() =>
    props.functions
        .filter((f) => f.id !== props.functionData?.id)
        .map((f) => ({ label: f.name, value: f.id }))
)

const mtoOptions = [
    { label: '1 hour', value: 1 },
    { label: '2 hours', value: 2 },
    { label: '4 hours', value: 4 },
    { label: '8 hours', value: 8 },
    { label: '24 hours', value: 24 },
    { label: '48 hours', value: 48 },
    { label: '72 hours', value: 72 },
    { label: '1 week', value: 168 },
]

const wrtOptions = [
    { label: '1 hour', value: 1 },
    { label: '2 hours', value: 2 },
    { label: '4 hours', value: 4 },
    { label: '8 hours', value: 8 },
    { label: '24 hours', value: 24 },
    { label: '48 hours', value: 48 },
    { label: '72 hours', value: 72 },
]

const requiredRule = (val: any) => !!val || 'This field is required'

function handleSubmit(): void {
    if (!form.name || !form.department_id || !form.mto_hours || !form.work_recovery_time) return
    emit('submit', { ...form })
}
</script>