<template>
  <q-dialog v-model="dialogVisible" :persistent="persistent">
    <q-card :style="{ width: width, maxWidth: '90vw' }">
      <q-card-section class="row items-center q-pb-none" v-if="title">
        <div class="text-h6" :class="`text-${dialogColor}`">
          <q-icon
            v-if="dialogIcon"
            :name="dialogIcon"
            :color="dialogColor"
            size="sm"
            class="q-mr-sm"
          />
          {{ title }}
        </div>
        <q-space />
        <q-btn v-if="!persistent" flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="showIcon" class="text-center q-mb-md">
          <q-icon :name="dialogIcon" :color="dialogColor" size="60px" />
        </div>
        <p class="text-body1" :class="{ 'text-center': showIcon }">{{ message }}</p>
        <slot name="content" />
      </q-card-section>

      <q-card-actions align="right" class="q-gutter-sm q-pa-md">
        <q-btn
          v-if="showCancel"
          flat
          :label="cancelLabel"
          color="grey"
          v-close-popup
          @click="$emit('cancel')"
        />
        <q-btn
          :color="confirmColor"
          :label="confirmLabel"
          :loading="loading"
          unelevated
          @click="$emit('confirm')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error' | 'delete'
    confirmLabel?: string
    cancelLabel?: string
    showCancel?: boolean
    persistent?: boolean
    loading?: boolean
    width?: string
    showIcon?: boolean
    icon?: string
  }>(),
  {
    title: '',
    type: 'info',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    showCancel: true,
    persistent: true,
    loading: false,
    width: '450px',
    showIcon: true,
    icon: '',
  }
)

defineEmits<{ 'update:modelValue': [value: boolean]; confirm: []; cancel: [] }>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => $emit('update:modelValue', val),
})

const dialogIcons: Record<string, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  delete: 'delete_outline',
}
const dialogColors: Record<string, string> = {
  info: 'primary',
  success: 'green',
  warning: 'orange',
  error: 'red',
  delete: 'negative',
}

const dialogIcon = computed(() => props.icon || dialogIcons[props.type] || 'help')
const dialogColor = computed(() => dialogColors[props.type] || 'primary')
const confirmColor = computed(() => (props.type === 'delete' ? 'negative' : 'primary'))
</script>
