<template>
  <q-input
    v-model="searchValue"
    outlined
    dense
    placeholder="Search audit logs..."
    clearable
    :debounce="300"
    @clear="handleClear"
  >
    <template v-slot:prepend>
      <q-icon name="search" />
    </template>
    <template v-slot:append>
      <q-icon name="filter_list" class="cursor-pointer" @click="emit('toggle-filters')">
        <q-tooltip>Toggle Filters</q-tooltip>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  {
    modelValue: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
  'toggle-filters': []
}>()

const searchValue = ref<string>(props.modelValue)

// Watch internal value and emit both events
watch(searchValue, (newValue) => {
  const stringValue = newValue || ''
  emit('update:modelValue', stringValue)
  emit('search', stringValue)
})

// Sync external changes
watch(
  () => props.modelValue,
  (newValue) => {
    // Only update if different to avoid infinite loop
    if (searchValue.value !== (newValue || '')) {
      searchValue.value = newValue || ''
    }
  }
)

function handleClear(): void {
  searchValue.value = ''
  emit('clear')
}
</script>
