<template>
  <q-card flat bordered class="settings-section q-mb-md">
    <q-card-section>
      <div class="section-header row items-center q-mb-md">
        <q-icon v-if="icon" :name="icon" size="20px" color="primary" class="q-mr-sm" />
        <div class="text-h6">{{ title }}</div>
      </div>
      <p v-if="description" class="text-caption text-grey-7 q-mb-md">{{ description }}</p>
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<style lang="scss" scoped>
.settings-section {
  border-radius: 12px;
}
.section-header {
  display: flex;
  align-items: center;
}
</style>
