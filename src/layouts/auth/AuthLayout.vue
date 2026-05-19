<!-- src/layouts/auth/AuthLayout.vue - Simplified version -->
<template>
  <div class="auth-layout">
    <div class="auth-container row items-center justify-center">
      <div class="auth-card col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <div class="text-center q-mb-lg">
          <div class="logo-container q-mb-md">
            <img
              v-if="logoLoaded"
              :src="logoSrc"
              alt="Logo"
              class="logo-img"
              width="80"
              height="80"
              @error="handleLogoError"
            />
            <div v-else class="logo-placeholder">
              <q-icon name="business" size="60px" color="white" />
            </div>
          </div>

          <div class="text-h4 text-primary q-mb-xs">
            {{ companyName }}
          </div>
          <div class="text-subtitle2 text-grey-6">
            {{ appName }}
          </div>
        </div>

        <q-card flat bordered class="auth-card-content">
          <q-card-section>
            <router-view />
          </q-card-section>
        </q-card>

        <div class="text-center q-mt-lg text-caption text-grey-6">
          &copy; {{ currentYear }} {{ companyName }} | {{ appShortName }} App. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { capitalizeFirstLettersAdvanced } from './../../utils/formatters'

const companyName = import.meta.env.VITE_COMPANY_NAME || 'Izingcweti'
const appName = import.meta.env.VITE_APP_NAME || 'Business Continuity Management System'
const appShortName = capitalizeFirstLettersAdvanced(import.meta.env.VITE_APP_NAME || appName)
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
  padding: 20px;
  box-sizing: border-box;
  background-color: #0d47a1;
}

.auth-card {
  backdrop-filter: blur(10px);
  overflow: hidden;

  @supports not (backdrop-filter: blur(10px)) {
    background: rgba(0, 0, 0, 0.3);
  }
}

.auth-card-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .auth-container {
    padding: 16px;
  }

  .auth-card {
    margin: 0 8px;
  }

  .text-h4 {
    font-size: 1.75rem;
  }

  .logo-img {
    width: 60px;
    height: 60px;
  }

  .logo-placeholder {
    width: 60px;
    height: 60px;
  }
}

.auth-card-content {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
