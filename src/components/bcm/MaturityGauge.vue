<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">BCM Maturity Level</div>
      <div class="text-center">
        <q-circular-progress
          :value="maturityPercentage"
          size="150px"
          :color="maturityColor"
          track-color="grey-3"
          show-value
          font-size="28px"
          :thickness="0.15"
        >
          <div class="text-center">
            <div class="text-h4 text-weight-bold" :class="'text-' + maturityColor">
              {{ maturityLevel }}
            </div>
            <div class="text-caption text-grey-7">Maturity Level</div>
          </div>
        </q-circular-progress>

        <div class="q-mt-md">
          <div class="row justify-center q-col-gutter-sm">
            <div v-for="level in maturityLevels" :key="level.level" class="col-auto">
              <q-badge
                :color="level.level <= maturityLevel ? 'primary' : 'grey-4'"
                :label="level.label"
                class="q-px-md q-py-sm"
              />
            </div>
          </div>
        </div>

        <div class="q-mt-md">
          <q-linear-progress
            :value="maturityPercentage / 100"
            :color="maturityColor"
            size="12px"
            rounded
          />
        </div>

        <div class="q-mt-md">
          <div class="text-caption text-grey-7">{{ maturityDescription }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    maturity?: number
  }>(),
  {
    maturity: 0,
  }
)

const maturityLevels = [
  { level: 1, label: 'Initial' },
  { level: 2, label: 'Repeatable' },
  { level: 3, label: 'Defined' },
  { level: 4, label: 'Managed' },
  { level: 5, label: 'Optimized' },
]

const maturityLevel = computed(() => {
  const level = Math.min(Math.max(Math.round(props.maturity / 20), 0), 5)
  return level === 0 ? 1 : level
})

const maturityPercentage = computed(() => {
  return ((maturityLevel.value - 1) / 4) * 100
})

const maturityColor = computed(() => {
  const level = maturityLevel.value
  if (level <= 2) return 'red'
  if (level <= 3) return 'orange'
  if (level <= 4) return 'yellow'
  return 'green'
})

const maturityDescription = computed(() => {
  const descriptions: Record<number, string> = {
    1: 'Basic processes established, often ad-hoc and reactive',
    2: 'Project management processes established, but inconsistent',
    3: 'Standardized processes across the organization',
    4: 'Processes measured and controlled with quantitative data',
    5: 'Continuous improvement and optimization focused',
  }
  return descriptions[maturityLevel.value] || 'No maturity assessment available'
})
</script>