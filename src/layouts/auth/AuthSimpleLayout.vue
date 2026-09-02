<template>
  <q-layout view="hHh LpR fFf">
    <q-page-container>
      <div class="simple-auth-container row items-center justify-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <router-view />
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Simple centered layout without branding
</script>

<style scoped lang="scss">
.simple-auth-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}
</style>