<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <q-icon :name="icon" size="24px" color="primary" class="q-mr-sm" />
        <div>
          <div class="text-h6">{{ title }}</div>
          <div class="text-caption text-grey-7">{{ description }}</div>
        </div>
      </div>
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  description?: string
}>()
</script>
