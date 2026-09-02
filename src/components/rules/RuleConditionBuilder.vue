<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">Condition Builder</div>

            <div v-for="(group, groupIndex) in groups" :key="groupIndex" class="condition-group q-mb-md">
                <div class="row items-center q-gutter-sm q-mb-sm">
                    <span class="text-weight-medium">Group {{ groupIndex + 1 }}</span>
                    <q-btn flat round dense size="sm" icon="delete" color="negative" @click="removeGroup(groupIndex)"
                        :disable="groups.length === 1" />
                </div>

                <div v-for="(condition, condIndex) in group.conditions" :key="condIndex"
                    class="condition-row row items-center q-gutter-sm q-mb-sm">
                    <div class="col-3">
                        <q-input v-model="condition.field" label="Field" outlined dense size="sm" />
                    </div>
                    <div class="col-3">
                        <q-select v-model="condition.operator" :options="operatorOptions" label="Operator" outlined
                            dense size="sm" emit-value map-options />
                    </div>
                    <div class="col-4">
                        <q-input v-model="condition.value" label="Value" outlined dense size="sm" />
                    </div>
                    <div class="col-1">
                        <q-btn flat round dense size="sm" icon="delete" color="negative"
                            @click="removeCondition(groupIndex, condIndex)" />
                    </div>
                    <div class="col-1">
                        <q-btn flat round dense size="sm" icon="add" color="primary"
                            @click="addCondition(groupIndex)" />
                    </div>
                </div>

                <div v-if="groupIndex < groups.length - 1" class="q-mt-sm">
                    <q-select v-model="group.logicalOperator" :options="logicalOptions" label="AND/OR" outlined dense
                        size="sm" emit-value map-options style="width: 120px" />
                </div>
            </div>

            <div class="row q-gutter-sm q-mt-md">
                <q-btn flat color="primary" icon="add" label="Add Condition" @click="addCondition(groups.length - 1)" />
                <q-btn flat color="primary" icon="add" label="Add Group" @click="addGroup" />
            </div>

            <div class="q-mt-md">
                <div class="text-caption text-grey-6">Preview</div>
                <pre class="preview-text">{{ formatPreview }}</pre>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ComparisonOperator, LogicalOperator } from '../../models/entities/rules/rule.entity'

const props = withDefaults(
    defineProps<{
        modelValue?: any[]
    }>(),
    {
        modelValue: () => [],
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: any[]]
}>()

const groups = ref<Array<{
    logicalOperator: string
    conditions: Array<{
        field: string
        operator: string
        value: any
    }>
}>>([
    {
        logicalOperator: 'AND',
        conditions: [
            { field: '', operator: 'EQUALS', value: '' },
        ],
    },
])

const operatorOptions = Object.values(ComparisonOperator).map((value) => ({
    label: formatOperator(value),
    value,
}))

const logicalOptions = Object.values(LogicalOperator).map((value) => ({
    label: value,
    value,
}))

function formatOperator(op: string): string {
    const labels: Record<string, string> = {
        EQUALS: '=',
        NOT_EQUALS: '!=',
        GREATER_THAN: '>',
        LESS_THAN: '<',
        GREATER_THAN_OR_EQUAL: '>=',
        LESS_THAN_OR_EQUAL: '<=',
        CONTAINS: 'contains',
        NOT_CONTAINS: 'not contains',
        IN: 'in',
        NOT_IN: 'not in',
        BETWEEN: 'between',
        EXISTS: 'exists',
        MATCHES_REGEX: 'matches regex',
    }
    return labels[op] || op
}

const formatPreview = computed(() => {
    const parts: string[] = []
    groups.value.forEach((group, _gi) => {
        const groupParts: string[] = []
        group.conditions.forEach((cond) => {
            if (cond.field && cond.operator && cond.value) {
                groupParts.push(`${cond.field} ${formatOperator(cond.operator)} ${cond.value}`)
            }
        })
        if (groupParts.length > 0) {
            let groupStr = groupParts.join(` ${group.logicalOperator} `)
            if (groups.value.length > 1) {
                groupStr = `(${groupStr})`
            }
            parts.push(groupStr)
        }
    })
    return parts.join(' AND ') || 'No conditions defined'
})

function addGroup(): void {
    groups.value.push({
        logicalOperator: 'AND',
        conditions: [
            { field: '', operator: 'EQUALS', value: '' },
        ],
    })
}

function removeGroup(index: number): void {
    if (groups.value.length > 1) {
        groups.value.splice(index, 1)
    }
}

function addCondition(groupIndex: number): void {
    groups.value[groupIndex]!.conditions.push({
        field: '',
        operator: 'EQUALS',
        value: '',
    })
}

function removeCondition(groupIndex: number, condIndex: number): void {
    if (groups.value[groupIndex]!.conditions.length > 1) {
        groups.value[groupIndex]!.conditions.splice(condIndex, 1)
    }
}
</script>

<style lang="scss" scoped>
.condition-group {
    border-left: 3px solid var(--q-primary);
    padding-left: 12px;
}

.condition-row {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 4px;
}

.preview-text {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    font-size: 13px;
    margin: 4px 0 0;
}
</style>