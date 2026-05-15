<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header with stepper -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn v-if="currentStep > 1" flat dense round icon="arrow_back" @click="previousStep" />
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn v-if="canSkip" flat dense label="Skip" @click="skipStep" />
      </q-toolbar>

      <!-- Stepper -->
      <q-linear-progress :value="progress" color="white" class="q-mt-xs" size="3px" />
    </q-header>

    <!-- Content -->
    <q-page-container>
      <q-page :style-fn="pageStyle">
        <div class="wizard-container q-pa-md">
          <!-- Step Content -->
          <transition name="slide" mode="out-in" :duration="200">
            <div :key="currentStep">
              <slot :name="`step-${currentStep}`" :step="currentStep" :data="wizardData" />
            </div>
          </transition>
        </div>
      </q-page>
    </q-page-container>

    <!-- Footer with navigation -->
    <q-footer class="bg-white text-primary" bordered>
      <q-toolbar>
        <q-btn v-if="currentStep > 1" flat color="primary" label="Back" @click="previousStep" />
        <q-space />
        <q-btn
          v-if="currentStep < totalSteps"
          color="primary"
          :label="nextLabel"
          :disable="!canProceed"
          unelevated
          @click="nextStep"
        />
        <q-btn
          v-else
          color="green"
          label="Finish"
          :disable="!canProceed"
          unelevated
          @click="finish"
        />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    totalSteps?: number
    canSkip?: boolean
    canProceed?: boolean
    nextLabel?: string
  }>(),
  {
    title: 'Wizard',
    totalSteps: 3,
    canSkip: false,
    canProceed: true,
    nextLabel: 'Next',
  }
)

const emit = defineEmits<{
  'step-change': [step: number]
  finish: []
  skip: []
}>()

const currentStep = ref(1)
const wizardData = ref<Record<string, any>>({})

const progress = computed(() => currentStep.value / props.totalSteps)

function pageStyle(offset: number): Record<string, string> {
  return {
    paddingBottom: `${offset + 50}px`,
  }
}

function nextStep(): void {
  if (currentStep.value < props.totalSteps) {
    currentStep.value++
    emit('step-change', currentStep.value)
  }
}

function previousStep(): void {
  if (currentStep.value > 1) {
    currentStep.value--
    emit('step-change', currentStep.value)
  }
}

function skipStep(): void {
  emit('skip')
}

function finish(): void {
  emit('finish')
}

function updateData(data: Record<string, any>): void {
  wizardData.value = { ...wizardData.value, ...data }
}

defineExpose({ updateData, currentStep, wizardData })
</script>

<style lang="scss" scoped>
.wizard-container {
  max-width: 600px;
  margin: 0 auto;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
