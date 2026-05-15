<template>
  <div class="empty-state q-pa-xl text-center">
    <q-icon :name="icon" :size="iconSize" :color="iconColor" class="q-mb-md" />
    <h5 class="text-h5 q-mb-sm text-grey-8">{{ title }}</h5>
    <p class="text-body1 text-grey-6 q-mb-lg" v-if="description">{{ description }}</p>
    <q-btn
      v-if="action"
      :color="actionColor"
      :icon="actionIcon"
      :label="actionLabel"
      :to="actionTo"
      unelevated
      @click="handleAction"
    />
    <q-btn
      v-if="secondaryAction"
      flat
      :color="secondaryColor"
      :label="secondaryLabel"
      class="q-ml-sm"
      @click="handleSecondaryAction"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = withDefaults(
  defineProps<{
    icon?: string
    iconSize?: string
    iconColor?: string
    title?: string
    description?: string
    action?: {
      label?: string
      icon?: string
      color?: string
      to?: string
      handler?: () => void
    } | null
    secondaryAction?: { label?: string; color?: string; handler?: () => void } | null
  }>(),
  {
    icon: 'inbox',
    iconSize: '80px',
    iconColor: 'grey-5',
    title: 'No Data Found',
    description: '',
    action: null,
    secondaryAction: null,
  }
)

const emit = defineEmits<{ action: []; 'secondary-action': [] }>()

const actionLabel = computed(() => props.action?.label || 'Action')
const actionIcon = computed(() => props.action?.icon || 'add')
const actionColor = computed(() => props.action?.color || 'primary')
const actionTo = computed(() => props.action?.to)
const secondaryLabel = computed(() => props.secondaryAction?.label || 'Back')
const secondaryColor = computed(() => props.secondaryAction?.color || 'grey')

function handleAction(): void {
  if (props.action?.handler) props.action.handler()
  else if (props.action?.to) router.push(props.action.to)
  emit('action')
}

function handleSecondaryAction(): void {
  if (props.secondaryAction?.handler) props.secondaryAction.handler()
  emit('secondary-action')
}
</script>

<style lang="scss" scoped>
.empty-state {
  max-width: 500px;
  margin: 0 auto;
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
