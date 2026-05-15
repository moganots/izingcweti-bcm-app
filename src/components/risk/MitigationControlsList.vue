<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Mitigation Controls</div>
        <q-btn color="primary" icon="add" label="Add Control" unelevated @click="$emit('add')" />
      </div>

      <div v-if="controls!?.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="shield" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No mitigation controls defined</div>
      </div>

      <q-list v-else separator>
        <q-item v-for="control in controls" :key="control.id">
          <q-item-section avatar>
            <q-icon name="shield" color="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ control.name }}</q-item-label>
            <q-item-label caption>{{ control.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="control.status === 'active' ? 'green' : 'grey'"
              :label="control.status"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn flat round size="sm" icon="more_vert">
              <q-menu>
                <q-list dense>
                  <q-item clickable v-close-popup @click="$emit('edit', control)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="$emit('remove', control)">
                    <q-item-section avatar
                      ><q-icon name="delete" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative">Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  controls?: Array<{ id: string; name: string; description?: string; status: string }>
}>()
defineEmits<{ add: []; edit: [control: any]; remove: [control: any] }>()
</script>
