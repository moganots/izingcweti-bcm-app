<template>
  <q-item class="setting-item" :clickable="clickable" @click="clickable ? $emit('click') : null">
    <q-item-section avatar v-if="icon">
      <q-icon :name="icon" :color="iconColor || 'primary'" size="22px" />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-medium">{{ title }}</q-item-label>
      <q-item-label v-if="subtitle" caption>{{ subtitle }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <slot name="action">
        <q-icon v-if="clickable" name="chevron_right" color="grey" />
        <span v-if="value" class="text-grey-7">{{ value }}</span>
        <q-badge v-if="badge" :color="badgeColor" :label="badge" />
      </slot>
    </q-item-section>
  </q-item>
  <q-separator v-if="!last" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: string
    iconColor?: string
    value?: string
    badge?: string
    badgeColor?: string
    clickable?: boolean
    last?: boolean
  }>(),
  {
    clickable: false,
    last: false,
  }
)

defineEmits<{ click: [] }>()
</script>
