<template>
  <div class="document-tag-manager">
    <div class="row items-center q-gutter-sm">
      <!-- Existing Tags -->
      <q-badge
        v-for="tag in tags"
        :key="tag"
        outline
        color="primary"
        class="q-px-sm q-py-xs"
      >
        {{ tag }}
        <q-icon
          v-if="editable"
          name="close"
          size="12px"
          class="q-ml-xs cursor-pointer"
          @click="$emit('remove-tag', tag)"
        />
      </q-badge>

      <!-- Add Tag Input -->
      <q-input
        v-if="editable"
        v-model="newTag"
        outlined
        dense
        placeholder="Add tag..."
        style="max-width: 150px"
        @keyup.enter="addTag"
        @blur="addTag"
      >
        <template v-slot:append>
          <q-icon
            v-if="newTag"
            name="add"
            class="cursor-pointer"
            @click="addTag"
          />
        </template>
      </q-input>
    </div>

    <!-- Tag Suggestions -->
    <q-slide-transition>
      <div v-if="showSuggestions && filteredSuggestions.length > 0" class="q-mt-sm">
        <div class="text-caption text-grey-6 q-mb-xs">Suggested Tags</div>
        <div class="row q-gutter-xs">
          <q-badge
            v-for="suggestion in filteredSuggestions"
            :key="suggestion"
            outline
            color="grey"
            class="cursor-pointer q-px-sm q-py-xs"
            @click="addSuggestion(suggestion)"
          >
            {{ suggestion }}
          </q-badge>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    tags?: string[]
    editable?: boolean
    suggestions?: string[]
    maxTags?: number
  }>(),
  {
    tags: () => [],
    editable: true,
    suggestions: () => [
      'BCM', 'Policy', 'BIA', 'BCP', 'Risk', 'Compliance',
      'Training', 'Audit', 'Incident', 'Recovery', 'Test',
      'Procedure', 'Workflow', 'Emergency', 'Critical',
    ],
    maxTags: 10,
  }
)

const emit = defineEmits<{
  'add-tag': [tag: string]
  'remove-tag': [tag: string]
}>()

const newTag = ref('')
const showSuggestions = ref(false)

const filteredSuggestions = computed(() => {
  if (!newTag.value) return props.suggestions
  const query = newTag.value.toLowerCase()
  return props.suggestions
    .filter((tag) => tag.toLowerCase().includes(query))
    .filter((tag) => !props.tags.includes(tag))
    .slice(0, 5)
})

watch(newTag, (val) => {
  showSuggestions.value = val.length > 0
})

function addTag(): void {
  const tag = newTag.value.trim()
  if (!tag) return
  if (props.tags.includes(tag)) {
    newTag.value = ''
    return
  }
  if (props.tags.length >= props.maxTags) {
    newTag.value = ''
    return
  }
  emit('add-tag', tag)
  newTag.value = ''
  showSuggestions.value = false
}

function addSuggestion(tag: string): void {
  if (props.tags.includes(tag)) return
  if (props.tags.length >= props.maxTags) return
  emit('add-tag', tag)
  newTag.value = ''
  showSuggestions.value = false
}
</script>