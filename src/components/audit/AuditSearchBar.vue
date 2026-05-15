<template>
  <q-input
    v-model="searchValue"
    outlined
    dense
    placeholder="Search audit logs..."
    clearable
    :debounce="300"
    @update:model-value="$emit('search', $event)"
    @clear="$emit('clear')"
  >
    <template v-slot:prepend>
      <q-icon name="search" />
    </template>
    <template v-slot:append>
      <q-icon name="filter_list" class="cursor-pointer" @click="$emit('toggle-filters')">
        <q-tooltip>Toggle Filters</q-tooltip>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
  'toggle-filters': []
}>()

const searchValue = ref(props.modelValue || '')
watch(
  () => props.modelValue,
  (val) => {
    searchValue.value = val || ''
  }
)
</script>
