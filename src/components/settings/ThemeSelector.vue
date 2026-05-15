<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Appearance</div>
      <div class="row q-col-gutter-md">
        <div v-for="option in themeOptions" :key="option.value" class="col-4">
          <q-card
            flat
            bordered
            class="theme-card cursor-pointer text-center"
            :class="{ 'theme-selected': modelValue === option.value }"
            @click="$emit('update:modelValue', option.value)"
          >
            <q-card-section>
              <div class="theme-preview" :class="'theme-preview-' + option.value">
                <div class="theme-preview-header"></div>
                <div class="theme-preview-body">
                  <div class="theme-preview-line"></div>
                  <div class="theme-preview-line short"></div>
                </div>
              </div>
              <q-icon
                :name="option.icon"
                size="24px"
                :color="modelValue === option.value ? 'primary' : 'grey'"
                class="q-mt-sm"
              />
              <div
                class="text-body2 q-mt-xs"
                :class="modelValue === option.value ? 'text-primary text-weight-bold' : ''"
              >
                {{ option.label }}
              </div>
            </q-card-section>
            <q-card-section v-if="modelValue === option.value" class="q-pt-none">
              <q-badge color="primary" label="Active" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const themeOptions = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'settings_brightness' },
]
</script>

<style lang="scss" scoped>
.theme-card {
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
  &:hover {
    border-color: var(--q-primary);
  }
}
.theme-selected {
  border-color: var(--q-primary);
  background: rgba(26, 115, 232, 0.05);
}
.theme-preview {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}
.theme-preview-light {
  background: #ffffff;
}
.theme-preview-dark {
  background: #1e1e1e;
}
.theme-preview-system {
  background: linear-gradient(135deg, #ffffff 50%, #1e1e1e 50%);
}
.theme-preview-header {
  height: 12px;
  background: #e0e0e0;
}
.theme-preview-body {
  padding: 8px;
}
.theme-preview-line {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 6px;
}
.theme-preview-line.short {
  width: 60%;
}
</style>
