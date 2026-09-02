<template>
  <div class="exercise-test-list">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <div v-else-if="tests && tests.length === 0" class="text-center q-py-xl">
      <q-icon name="playlist_add_check" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Exercise Tests</div>
      <p class="text-grey-6">Schedule your first exercise test</p>
      <q-btn color="primary" icon="add" label="Schedule Test" @click="$emit('create')" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="test in tests" :key="test.id" class="col-12 col-md-6 col-lg-4">
        <ExerciseTestCard
          :test="test"
          @record-result="$emit('record-result', test)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExerciseTestCard from './ExerciseTestCard.vue'

defineProps<{
  tests?: any[]
  loading?: boolean
}>()

defineEmits<{
  create: []
  'record-result': [test: any]
}>()
</script>