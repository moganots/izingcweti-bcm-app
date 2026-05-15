<template>
  <div
    class="loading-spinner flex flex-center q-pa-xl"
    :class="{ 'fullscreen-spinner': fullscreen }"
  >
    <div class="text-center">
      <q-spinner-dots :size="size" :color="color" />
      <p v-if="message" class="text-grey-7 q-mt-md text-body1">{{ message }}</p>
      <q-linear-progress
        v-if="showProgress"
        :value="progress"
        :color="color"
        class="q-mt-md"
        style="width: 200px"
      />
      <p v-if="showProgress" class="text-caption text-grey-6 q-mt-xs">
        {{ Math.round(progress * 100) }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    size?: string
    color?: string
    fullscreen?: boolean
    showProgress?: boolean
    progress?: number
  }>(),
  {
    message: 'Loading...',
    size: '50px',
    color: 'primary',
    fullscreen: false,
    showProgress: false,
    progress: 0,
  }
)
</script>

<style lang="scss" scoped>
.fullscreen-spinner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}
</style>
