<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">
                <q-icon name="science" size="sm" class="q-mr-sm" />Evaluate Feature Toggle
            </div>

            <q-form @submit.prevent="handleEvaluate" class="q-gutter-md">
                <!-- Feature Selection -->
                <q-select v-model="form.featureName" :options="featureOptions" label="Feature Toggle *" outlined dense
                    :rules="[requiredRule]" emit-value map-options :loading="loadingFeatures" @filter="filterFeatures"
                    use-input />

                <!-- Context -->
                <div class="row q-col-gutter-md">
                    <div class="col-6">
                        <q-input v-model="form.userId" label="User ID (Optional)" outlined dense clearable />
                    </div>
                    <div class="col-6">
                        <q-input v-model="form.organisationId" label="Organisation ID (Optional)" outlined dense
                            clearable />
                    </div>
                </div>

                <div class="row q-col-gutter-md">
                    <div class="col-6">
                        <q-input v-model="form.userRole" label="User Role (Optional)" outlined dense clearable />
                    </div>
                    <div class="col-6">
                        <q-select v-model="form.environment" :options="environmentOptions" label="Environment" outlined
                            dense emit-value map-options />
                    </div>
                </div>

                <!-- Custom Context -->
                <q-input v-model="contextInput" label="Custom Context (JSON)" outlined dense type="textarea" rows="2"
                    placeholder='{"key": "value"}' />

                <!-- Results -->
                <div v-if="result" class="q-mt-md">
                    <q-separator class="q-mb-md" />
                    <div class="text-subtitle1 q-mb-sm">Evaluation Result</div>

                    <q-card flat bordered :class="result.enabled ? 'bg-green-1' : 'bg-grey-1'">
                        <q-card-section>
                            <div class="row items-center">
                                <q-icon :name="result.enabled ? 'check_circle' : 'cancel'"
                                    :color="result.enabled ? 'green' : 'grey'" size="40px" class="q-mr-md" />
                                <div>
                                    <div class="text-h5" :class="result.enabled ? 'text-green' : 'text-grey'">
                                        {{ result.enabled ? 'ENABLED' : 'DISABLED' }}
                                    </div>
                                    <div class="text-caption text-grey-7">{{ result.reason }}</div>
                                    <div v-if="result.matchedRule" class="text-caption text-grey-7">
                                        Matched Rule: {{ result.matchedRule }}
                                    </div>
                                    <div class="text-caption text-grey-7">
                                        Evaluation Time: {{ result.evaluationTimeMs }}ms
                                    </div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>

                <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                    {{ errorMessage }}
                </q-banner>

                <div class="row q-gutter-md">
                    <div class="col">
                        <q-btn type="submit" color="primary" icon="science" label="Evaluate" :loading="evaluating"
                            class="full-width" unelevated />
                    </div>
                    <div class="col" v-if="result">
                        <q-btn color="grey" icon="clear" label="Clear" class="full-width" outline
                            @click="clearResult" />
                    </div>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ToggleEnvironment, getToggleEnvironmentLabel } from './../../models/entities/feature-toggle/feature-toggle.entity'

const props = withDefaults(
    defineProps<{
        features?: any[]
        loadingFeatures?: boolean
        evaluating?: boolean
        errorMessage?: string
    }>(),
    {
        features: () => [],
        loadingFeatures: false,
        evaluating: false,
        errorMessage: '',
    }
)

const emit = defineEmits<{
    evaluate: [data: any]
}>()

const contextInput = ref('')
const result = ref<any>(null)

const form = reactive({
    featureName: null as string | null,
    userId: '',
    organisationId: '',
    userRole: '',
    environment: 'PRODUCTION',
    context: {} as Record<string, any>,
})

const environmentOptions = Object.values(ToggleEnvironment).map((value) => ({
    label: getToggleEnvironmentLabel(value),
    value,
}))

const featureOptions = computed(() => {
    return props.features.map((f) => ({
        label: f.name,
        value: f.name,
    }))
})

const requiredRule = (val: any) => !!val || 'This field is required'

function filterFeatures(_val: string, update: (fn: () => void) => void): void {
    // Filter logic would be handled by parent component
    update(() => { })
}

function handleEvaluate(): void {
    if (!form.featureName) return

    let context = {}
    if (contextInput.value) {
        try {
            context = JSON.parse(contextInput.value)
        } catch {
            // Invalid JSON, ignore
        }
    }

    const data = {
        featureName: form.featureName,
        userId: form.userId || undefined,
        organisationId: form.organisationId || undefined,
        userRole: form.userRole || undefined,
        environment: form.environment,
        context,
    }

    emit('evaluate', data)
}

function clearResult(): void {
    result.value = null
}
</script>