<template>
  <div class="critical-functions-list">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
      <p class="text-grey-7 q-mt-sm">Loading critical functions...</p>
    </div>

    <div v-else-if="functions.length === 0" class="text-center q-py-xl">
      <q-icon name="functions" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Critical Functions</div>
      <p class="text-grey-6">Create your first critical function to get started</p>
      <q-btn color="primary" icon="add" label="Add Function" @click="$emit('create')" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="func in functions" :key="func.id" class="col-12 col-md-6 col-lg-4">
        <CriticalFunctionCard
          :func="func"
          @click="$emit('select', func)"
          @edit="$emit('edit', func)"
          @view-bia="$emit('view-bia', func)"
          @delete="$emit('delete', func)"
        />
      </div>
    </div>

    <div v-if="!loading && functions.length > 0" class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-visible="5"
        @update:model-value="$emit('page-change', currentPage)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CriticalFunctionCard from './CriticalFunctionCard.vue'

const props = withDefaults(
  defineProps<{
    functions?: any[]
    loading?: boolean
    total?: number
    page?: number
    limit?: number
  }>(),
  {
    functions: () => [],
    loading: false,
    total: 0,
    page: 1,
    limit: 10,
  }
)

const emit = defineEmits<{
  create: []
  select: [func: any]
  edit: [func: any]
  'view-bia': [func: any]
  delete: [func: any]
  'page-change': [page: number]
}>()

const currentPage = ref(props.page)
const totalPages = computed(() => Math.ceil(props.total / props.limit))
</script>