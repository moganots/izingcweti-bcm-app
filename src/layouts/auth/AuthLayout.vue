<template>
  <div class="auth-layout">
    <div class="auth-container row items-center justify-center">
      <div class="auth-card col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <div class="text-center q-mb-md">
          <div class="logo-container q-mb-sm">
            <img
              v-if="logoLoaded"
              :src="logoSrc"
              alt="Logo"
              class="logo-img"
              width="50"
              height="50"
              @error="handleLogoError"
            />
            <div v-else class="logo-placeholder">
              <q-icon name="business" size="48px" color="white" />
            </div>
          </div>

          <div class="text-h5 text-primary q-mb-xs">
            {{ companyName }}
          </div>
          <div class="text-caption text-grey-6">
            {{ appName }}
          </div>
        </div>

        <q-card flat bordered class="auth-card-content">
          <q-card-section class="q-pa-md q-pa-sm-sm">
            <router-view />
          </q-card-section>
        </q-card>

        <div class="text-center q-mt-md text-caption text-grey-6">
          &copy; {{ currentYear }} {{ companyName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const companyName = import.meta.env.VITE_COMPANY_NAME || 'Izingcweti'
const appName = import.meta.env.VITE_APP_NAME || 'Business Continuity Management System'
const currentYear = computed(() => new Date().getFullYear())
const logoLoaded = ref(true)
const logoSrc = ref('/izingcweti-logo-icon-no-bg.png')

function handleLogoError(): void {
  logoLoaded.value = false
  console.warn('Logo failed to load, using fallback')
}

// Preload logo
const img = new Image()
img.src = logoSrc.value
img.onload = () => {
  logoLoaded.value = true
}
img.onerror = () => {
  logoLoaded.value = false
}
</script>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  width: 100%;
}

.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 400px) {
    padding: 8px;
  }
}

.auth-card {
  backdrop-filter: blur(10px);
  overflow: hidden;
  width: 100%;

  @supports not (backdrop-filter: blur(10px)) {
    background: rgba(0, 0, 0, 0.3);
  }
}

.auth-card-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 400px) {
    border-radius: 8px;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70px;

  @media (max-width: 400px) {
    min-height: 60px;
  }
}

.logo-img {
  width: 60px;
  height: 60px;
  object-fit: contain;

  @media (max-width: 400px) {
    width: 48px;
    height: 48px;
  }
}

.logo-placeholder {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 400px) {
    width: 48px;
    height: 48px;
  }
}

.text-h5 {
  font-size: 1.25rem;

  @media (max-width: 400px) {
    font-size: 1.125rem;
  }
}

.auth-card-content {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>