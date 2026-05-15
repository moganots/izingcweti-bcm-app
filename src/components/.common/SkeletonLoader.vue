<template>
  <div class="skeleton-loader">
    <div v-for="i in count" :key="i" class="skeleton-item q-pa-md">
      <div class="row items-center">
        <div
          class="skeleton skeleton-circle"
          :style="{ width: avatarSize, height: avatarSize }"
        ></div>
        <div class="q-ml-md col">
          <div
            class="skeleton skeleton-line"
            style="width: 60%; height: 14px; margin-bottom: 8px"
          ></div>
          <div class="skeleton skeleton-line" style="width: 40%; height: 10px"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number; avatarSize?: string }>(), {
  count: 5,
  avatarSize: '40px',
})
</script>

<style lang="scss" scoped>
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}
.skeleton-circle {
  border-radius: 50%;
}
.skeleton-line {
  border-radius: 4px;
}
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
