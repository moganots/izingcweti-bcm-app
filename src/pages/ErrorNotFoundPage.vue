<!-- src/pages/ErrorNotFoundPage.vue -->
<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="error-code">404</div>

      <h1 class="text-h4 q-mt-md q-mb-sm">Page Not Found</h1>

      <p class="text-subtitle1 text-grey-4 q-mb-xl">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div class="q-gutter-md">
        <q-btn
          color="white"
          text-color="primary"
          unelevated
          to="/dashboard"
          label="Go to Dashboard"
          icon="dashboard"
          size="lg"
        />

        <q-btn
          outline
          color="white"
          text-color="white"
          to="/"
          label="Go Home"
          icon="home"
          size="lg"
          class="q-ml-sm"
        />
      </div>

      <div class="q-mt-xl">
        <p class="text-grey-5">
          If you believe this is an error, please contact
          <a href="mailto:support@bcm-system.com" class="text-white">support@bcm-system.com</a>
        </p>
      </div>

      <!-- Decorative elements -->
      <div class="error-decoration">
        <q-icon name="error_outline" size="200px" class="text-white-10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(10)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Auto-redirect after countdown
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      router.push('/dashboard')
    }
  }, 1000)
})

// Cleanup timer
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.error-code {
  font-size: 150px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 4px 4px 0 rgba(255, 255, 255, 0.1);
  animation: pulse 2s ease-in-out infinite alternate;
}

.error-decoration {
  position: fixed;
  bottom: -50px;
  right: -50px;
  opacity: 0.1;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
}

@media (max-width: 600px) {
  .error-code {
    font-size: 100px;
  }
}
</style>
