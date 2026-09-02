<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">
                    <q-icon name="rule" size="sm" class="q-mr-sm" />Overrides
                    <q-badge v-if="overrides && overrides?.length > 0" color="primary" class="q-ml-sm">{{
                        overrides?.length }}</q-badge>
                </div>
                <q-btn color="primary" icon="add" label="Add Override" unelevated @click="$emit('add')" />
            </div>

            <div v-if="loading" class="text-center q-pa-md">
                <q-spinner-dots size="30px" color="primary" />
            </div>

            <div v-else-if="overrides?.length === 0" class="text-center q-py-md text-grey-7">
                <q-icon name="rule" size="40px" color="grey-4" class="q-mb-sm" />
                <div>No overrides configured</div>
                <div class="text-caption">Override the default behavior for specific users or organizations</div>
            </div>

            <q-list v-else separator>
                <q-item v-for="override in overrides" :key="override.id">
                    <q-item-section avatar>
                        <q-icon :name="override.value ? 'check_circle' : 'cancel'"
                            :color="override.value ? 'green' : 'grey'" size="24px" />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>
                            {{ getOverrideTarget(override) }}
                            <q-badge :color="override.value ? 'green' : 'grey'" :label="override.value ? 'ON' : 'OFF'"
                                class="q-ml-sm" />
                        </q-item-label>
                        <q-item-label caption>
                            {{ override.reason || 'No reason provided' }}
                        </q-item-label>
                        <q-item-label caption v-if="override.expires_at">
                            Expires: {{ formatDate(override.expires_at) }}
                        </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        <div class="q-gutter-xs">
                            <q-btn flat round size="sm" icon="edit" @click="$emit('edit', override)">
                                <q-tooltip>Edit</q-tooltip>
                            </q-btn>
                            <q-btn flat round size="sm" icon="delete" color="negative"
                                @click="$emit('delete', override)">
                                <q-tooltip>Remove</q-tooltip>
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

defineProps<{
    overrides?: any[]
    loading?: boolean
}>()

defineEmits<{
    add: []
    edit: [override: any]
    delete: [override: any]
}>()

function getOverrideTarget(override: any): string {
    if (override.userId) return `User: ${override.userId}`
    if (override.organisationId) return `Organisation: ${override.organisationId}`
    if (override.role) return `Role: ${override.role}`
    return 'Global Override'
}
</script>