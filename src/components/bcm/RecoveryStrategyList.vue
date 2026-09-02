<template>
  <div class="recovery-strategy-list">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <div v-else-if="strategies && strategies.length === 0" class="text-center q-py-xl">
      <q-icon name="restore" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Recovery Strategies</div>
      <p class="text-grey-6">Define recovery strategies for your BCP</p>
      <q-btn color="primary" icon="add" label="Add Strategy" @click="$emit('create')" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="strategy in strategies" :key="strategy.id" class="col-12 col-md-6">
        <RecoveryStrategyCard
          :strategy="strategy"
          @edit="$emit('edit', strategy)"
          @delete="$emit('delete', strategy)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecoveryStrategyCard from './RecoveryStrategyCard.vue'

defineProps<{
  strategies?: any[]
  loading?: boolean
}>()

defineEmits<{
  create: []
  edit: [strategy: any]
  delete: [strategy: any]
}>()
</script>