<template>
    <div class="compliance-standard-selector">
        <q-select v-model="selectedStandard" :options="standardOptions" label="Compliance Standard" outlined dense
            clearable emit-value map-options @update:model-value="$emit('update:modelValue', selectedStandard)">
            <template v-slot:prepend>
                <q-icon name="verified_user" color="primary" />
            </template>
            <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                        <q-icon :name="getStandardIcon(scope.opt.value)" :color="getStandardColor(scope.opt.value)" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ getStandardDescription(scope.opt.value) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="getStandardCount(scope.opt.value) > 0">
                        <q-badge color="primary" :label="getStandardCount(scope.opt.value)" />
                    </q-item-section>
                </q-item>
            </template>
        </q-select>

        <!-- Quick Select Buttons -->
        <div class="row q-gutter-xs q-mt-sm">
            <q-btn v-for="standard in quickSelectOptions" :key="standard.value" :label="standard.label"
                :color="selectedStandard === standard.value ? 'primary' : 'grey-4'"
                :text-color="selectedStandard === standard.value ? 'white' : 'dark'" size="sm" flat rounded
                @click="selectStandard(standard.value)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ComplianceStandard } from './../../models/entities/compliance/compliance.entity'

const props = withDefaults(
    defineProps<{
        modelValue?: string
        counts?: Record<string, number>
    }>(),
    {
        modelValue: '',
        counts: () => ({}),
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const selectedStandard = ref(props.modelValue)

const standardOptions = Object.values(ComplianceStandard).map((value) => ({
    label: formatStandardLabel(value),
    value,
    description: getStandardDescription(value),
    icon: getStandardIcon(value),
    color: getStandardColor(value),
}))

const quickSelectOptions = standardOptions.slice(0, 4)

function formatStandardLabel(standard: string): string {
    const labels: Record<string, string> = {
        ISO22301: 'ISO 22301',
        NIST800_34: 'NIST 800-34',
        FFIEC: 'FFIEC',
        COBIT2019: 'COBIT 2019',
        SOC2: 'SOC 2',
        GDPR: 'GDPR',
        HIPAA: 'HIPAA',
        PCI_DSS: 'PCI DSS',
    }
    return labels[standard] || standard
}

function getStandardDescription(standard: string): string {
    const descriptions: Record<string, string> = {
        ISO22301: 'Business Continuity Management',
        NIST800_34: 'Continuity Planning Guide',
        FFIEC: 'Financial Institution Compliance',
        COBIT2019: 'IT Governance Framework',
        SOC2: 'Service Organization Control',
        GDPR: 'Data Protection Regulation',
        HIPAA: 'Healthcare Data Privacy',
        PCI_DSS: 'Payment Card Security',
    }
    return descriptions[standard] || ''
}

function getStandardIcon(standard: string): string {
    const icons: Record<string, string> = {
        ISO22301: 'verified_user',
        NIST800_34: 'security',
        FFIEC: 'account_balance',
        COBIT2019: 'settings_ethernet',
        SOC2: 'shield',
        GDPR: 'privacy_tip',
        HIPAA: 'health_and_safety',
        PCI_DSS: 'credit_card',
    }
    return icons[standard] || 'circle'
}

function getStandardColor(standard: string): string {
    const colors: Record<string, string> = {
        ISO22301: 'blue',
        NIST800_34: 'green',
        FFIEC: 'orange',
        COBIT2019: 'purple',
        SOC2: 'teal',
        GDPR: 'indigo',
        HIPAA: 'red',
        PCI_DSS: 'yellow',
    }
    return colors[standard] || 'grey'
}

function getStandardCount(standard: string): number {
    return props.counts?.[standard] || 0
}

function selectStandard(standard: string): void {
    selectedStandard.value = selectedStandard.value === standard ? '' : standard
    emit('update:modelValue', selectedStandard.value)
}
</script>