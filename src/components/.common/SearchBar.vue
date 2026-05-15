<!-- src/components/ui/SearchBar.vue -->
<template>
  <q-input
    v-model="searchValue"
    outlined
    dense
    :placeholder="placeholder"
    clearable
    :debounce="debounce"
    @update:model-value="handleSearch"
    @clear="handleClear"
  >
    <template v-slot:prepend><q-icon name="search" /></template>
    <template v-slot:append v-if="showFilter"
      ><q-icon name="filter_list" class="cursor-pointer" @click="$emit('toggle-filter')"
    /></template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    debounce?: number
    showFilter?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Search...',
    debounce: 300,
    showFilter: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
}>()
const searchValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    searchValue.value = val
  }
)
function handleSearch(value: string | number | null): void {
  const val = String(value || '')
  emit('update:modelValue', val)
  emit('search', val)
}
function handleClear(): void {
  emit('update:modelValue', '')
  emit('clear')
}
</script>
