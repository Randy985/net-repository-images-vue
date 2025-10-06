<template>
  <AuthLayout>
    <div class="login-page">
      <!-- Fondo con gradiente -->
      <div class="noise-overlay"></div>

      <!-- Formulario con animación -->
      <v-fade-transition mode="out-in">
        <div
          key="login-form"
          class="login-card pa-6 animate-scale"
        >
          <!-- Logo + título -->
          <v-avatar size="56" class="mb-3" color="deep-purple-accent-4">
            <v-icon size="32" color="white">mdi-shield-account</v-icon>
          </v-avatar>

          <h1 class="text-h5 font-weight-bold mb-1">Bienvenido</h1>
          <p class="text-body-2 mb-6 text-center">
            Ingresa tus credenciales para continuar
          </p>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4 w-100"
            closable
          >
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="onSubmit" v-model="valid" class="w-100">
            <v-text-field
              v-model="email"
              label="Correo electrónico"
              type="email"
              variant="underlined"
              prepend-inner-icon="mdi-email-outline"
              color="deep-purple-accent-4"
              class="mb-4"
              required
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              variant="underlined"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              color="deep-purple-accent-4"
              class="mb-3"
              required
            />

            <div class="d-flex align-center justify-space-between mb-4">
              <v-checkbox
                v-model="remember"
                label="Recuérdame"
                density="compact"
                hide-details
                color="deep-purple-accent-4"
              />
              <RouterLink to="/forgot-password" class="text-deep-purple-accent-4 text-caption">
                ¿Olvidaste tu contraseña?
              </RouterLink>
            </div>

            <v-btn
              type="submit"
              color="deep-purple-accent-4"
              size="large"
              block
              rounded="pill"
              elevation="2"
              :loading="loading"
              class="mb-3"
            >
              Iniciar sesión
            </v-btn>
          </v-form>

          <div class="text-center mt-2">
            <span class="text-body-2">¿No tienes cuenta?</span>
            <RouterLink
              to="/register"
              class="text-deep-purple-accent-4 text-body-2 font-weight-medium ms-1"
            >
              Regístrate
            </RouterLink>
          </div>
        </div>
      </v-fade-transition>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/layouts/AuthLayout.vue";

const auth = useAuthStore();
const email = ref("");
const password = ref("");
const valid = ref(true);
const showPassword = ref(false);
const remember = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const onSubmit = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";
    await auth.login(email.value, password.value);
  } catch (e: any) {
    errorMessage.value = e?.message || "Error al iniciar sesión.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Pantalla completa con gradiente */
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8ecf6, #dbe5f2);
  position: relative;
  overflow: hidden;
  padding: 16px;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABAwEA3q1J2QAAAABJRU5ErkJggg==");
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.login-card {
  max-width: 360px;
  width: 100%;
  backdrop-filter: blur(16px);
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.animate-scale {
  animation: scale-in 0.4s ease-out forwards;
}

@keyframes scale-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.v-btn {
  font-weight: 600;
  text-transform: none;
}

.v-text-field {
  font-size: 0.95rem;
}

</style>
<style>
/* 🔥 GLOBAL: quita autofill en todos lados */
.v-field__input,
.v-field__overlay {
  background: transparent !important;
}

.v-field__input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 9999s ease-out 0s !important;
}

.v-field__input:-moz-autofill {
  box-shadow: 0 0 0 1000px transparent inset !important;
  background-color: transparent !important;
  -moz-text-fill-color: inherit !important;
}
</style>
