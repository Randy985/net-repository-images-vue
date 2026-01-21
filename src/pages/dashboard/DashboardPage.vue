<template>
  <v-container fluid class="dashboard-root">
    <div class="welcome">
      <div class="icon-circle">
        <v-icon size="48" color="white">mdi-file-cabinet</v-icon>
      </div>

      <h1 class="title">
        Bienvenido al <span class="accent">Repositorio de Documentos</span>
      </h1>

      <p class="subtitle">
        Administra, consulta y gestiona todos los documentos de tu organización
        de manera fácil, segura y centralizada.
      </p>

      <div class="features">
        <div class="feature-item">
          <v-icon color="primary" size="28">mdi-cloud-upload</v-icon>
          <span>Carga rápida</span>
        </div>
        <div class="feature-item">
          <v-icon color="primary" size="28">mdi-magnify</v-icon>
          <span>Búsqueda avanzada</span>
        </div>
        <div class="feature-item">
          <v-icon color="primary" size="28">mdi-shield-check</v-icon>
          <span>Control de accesos</span>
        </div>
      </div>

      <div class="divider" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useTheme } from "vuetify"

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
</script>

<style scoped>
.dashboard-root {
  min-height: 100%;
  padding: 80px 64px;
  transition: background-color 0.2s ease;
}

:deep(.bg-grey-lighten-3) .dashboard-root {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.03), rgba(156, 39, 176, 0.03));
}

:deep(.bg-grey-darken-3) .dashboard-root {
  background: #1e1e1e;
}

.welcome {
  max-width: 720px;
}

.icon-circle {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, rgb(25, 118, 210), rgb(21, 101, 192));
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.25);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -1px;
  margin-bottom: 16px;
  line-height: 1.2;
}

.accent {
  background: linear-gradient(135deg, rgb(25, 118, 210), rgb(156, 39, 176));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1rem;
  line-height: 1.7;
  opacity: 0.75;
  margin-bottom: 40px;
}

.features {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.8;
}

.divider {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgb(25, 118, 210), rgb(156, 39, 176));
}
</style>