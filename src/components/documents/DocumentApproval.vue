<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 500px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">{{ isApproving ? 'Approve' : 'Reject' }} Document</div>
                <div class="text-subtitle2 text-grey-7">{{ document?.title }}</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <!-- Rejection Reason -->
                    <q-input v-if="!isApproving" v-model="form.reason" label="Rejection Reason *" outlined dense
                        type="textarea" rows="3" :rules="[requiredRule]"
                        placeholder="Explain why this document is being rejected..." />

                    <!-- Comments -->
                    <q-input v-model="form.comments"
                        :label="isApproving ? 'Approval Comments (optional)' : 'Additional Comments (optional)'"
                        outlined dense type="textarea" rows="2"
                        :placeholder="isApproving ? 'Add any approval notes...' : 'Add any additional comments...'" />

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>
                </q-form>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" color="grey" v-close-popup @click="$emit('cancel')" />
                <q-btn :color="isApproving ? 'green' : 'red'" :label="isApproving ? 'Approve' : 'Reject'"
                    :loading="submitting" @click="handleSubmit" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        document?: any
        isApproving?: boolean
        submitting?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        document: null,
        isApproving: true,
        submitting: false,
        errorMessage: '',
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [data: { reason?: string; comments?: string }]
    cancel: []
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const form = reactive({
    reason: '',
    comments: '',
})

const requiredRule = (val: string) => !!val || 'This field is required'

function handleSubmit(): void {
    if (!props.isApproving && !form.reason) return

    const data: { reason?: string; comments?: string } = {}
    if (form.reason) data.reason = form.reason
    if (form.comments) data.comments = form.comments

    emit('submit', data)
}
</script>