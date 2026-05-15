<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Add Comment</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="comment"
          label="Comment *"
          outlined
          dense
          type="textarea"
          rows="3"
          :rules="[requiredRule]"
          autofocus
        />
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="primary"
              label="Add Comment"
              :loading="submitting"
              class="full-width"
              unelevated
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ submitting?: boolean }>()
const emit = defineEmits<{ submit: [comment: string]; cancel: [] }>()

const comment = ref('')
const requiredRule = (val: string) => !!val || 'Required'

function handleSubmit(): void {
  if (!comment.value) return
  emit('submit', comment.value)
  comment.value = ''
}
</script>
