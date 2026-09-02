<template>
  <div class="bcp-template-list">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <div v-else-if="templates && templates.length === 0" class="text-center q-py-xl">
      <q-icon name="description" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Templates Available</div>
      <p class="text-grey-6">Create a template to standardize BCP creation</p>
      <q-btn color="primary" icon="add" label="Create Template" @click="$emit('create')" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="template in templates" :key="template.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat bordered class="template-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <q-icon :name="template.icon || 'description'" color="primary" size="32px" />
              <q-badge :color="template.is_active ? 'green' : 'grey'" :label="template.is_active ? 'Active' : 'Inactive'" />
            </div>

            <div class="text-h6 q-mt-sm">{{ template.name }}</div>
            <div class="text-caption text-grey-6">{{ template.category || 'General' }}</div>

            <p class="text-body2 q-mt-sm text-grey-7">
              {{ truncateText(template.description, 100) }}
            </p>

            <div class="row q-gutter-sm q-mt-sm">
              <q-badge v-if="template.sections?.length" outline color="primary">
                {{ template.sections.length }} sections
              </q-badge>
              <q-badge v-if="template.version" outline color="info">
                v{{ template.version }}
              </q-badge>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="Preview"
              icon="visibility"
              @click="$emit('preview', template)"
            />
            <q-btn
              color="primary"
              label="Use Template"
              icon="play_arrow"
              unelevated
              @click="$emit('use', template)"
            />
            <q-btn
              flat
              round
              icon="more_vert"
              size="sm"
            >
              <q-menu>
                <q-list dense>
                  <q-item clickable v-close-popup @click="$emit('edit', template)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="$emit('duplicate', template)">
                    <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
                    <q-item-section>Duplicate</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="$emit('delete', template)">
                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                    <q-item-section class="text-negative">Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  templates?: any[]
  loading?: boolean
}>()

defineEmits<{
  create: []
  preview: [template: any]
  use: [template: any]
  edit: [template: any]
  duplicate: [template: any]
  delete: [template: any]
}>()

function truncateText(text: string, max: number): string {
  return text?.length > max ? text.substring(0, max) + '...' : text || ''
}
</script>

<style lang="scss" scoped>
.template-card {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>