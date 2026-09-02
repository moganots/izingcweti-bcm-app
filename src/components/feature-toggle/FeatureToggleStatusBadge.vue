<template>
    <q-badge :color="color" :label="label" class="q-px-sm q-py-xs" :style="badgeStyle">
        <q-icon v-if="showIcon" :name="icon" size="14px" class="q-mr-xs" />
        {{ label }}
    </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
    getFeatureToggleStatusLabel,
    getFeatureToggleStatusColor,
    getFeatureToggleStatusIcon,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

const props = withDefaults(
    defineProps<{
        status: string
        showIcon?: boolean
        size?: 'sm' | 'md' | 'lg'
    }>(),
    {
        showIcon: true,
        size: 'md',
    }
)

const config = computed(() => ({
    label: getFeatureToggleStatusLabel(props.status),
    color: getFeatureToggleStatusColor(props.status),
    icon: getFeatureToggleStatusIcon(props.status),
}))

const color = computed(() => config.value.color)
const icon = computed(() => config.value.icon)
const label = computed(() => config.value.label)

const badgeStyle = computed(() => {
    const sizes: Record<string, { fontSize: string; padding: string }> = {
        sm: { fontSize: '10px', padding: '4px 8px' },
        md: { fontSize: '12px', padding: '6px 12px' },
        lg: { fontSize: '14px', padding: '8px 16px' },
    }
    const size = sizes[props.size] || sizes.md
    return {
        fontSize: size?.fontSize || '12px',
        padding: size?.padding || '6px 12px',
    }
})
</script>