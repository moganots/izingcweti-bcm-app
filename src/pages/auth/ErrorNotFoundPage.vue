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
          label="Go to Dashboard"
          icon="dashboard"
          size="lg"
          @click="goToDashboard"
        />
        <q-btn
          outline
          color="white"
          text-color="white"
          label="Go Home"
          icon="home"
          size="lg"
          class="q-ml-sm"
          @click="goHome"
        />
      </div>
      <div class="q-mt-xl">
        <p class="text-grey-5">
          If you believe this is an error, contact
          <a href="mailto:support@izingcweti-bcm.com" class="text-white"
            >support@izingcweti-bcm.com</a
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(10)
let timer: ReturnType<typeof setInterval> | null = null

const goToDashboard = () => {
  router.push('/dashboard')
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (timer) clearInterval(timer)
      router.push('/dashboard')
    }
  }, 1000)
})

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