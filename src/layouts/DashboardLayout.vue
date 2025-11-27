<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer app v-model="drawer" permanent :color="isDark ? 'grey-darken-4' : 'grey-lighten-4'"
      :width="220">


      <!-- Logo / Header -->
      <div class="px-4 py-4 d-flex align-center">
        <!-- <v-img src="/images/logo-empresa.png" max-width="120" class="me-2" cover /> -->
        <span class="text-h6 font-weight-bold">
          Repositorio
        </span>
      </div>
      <v-divider class="mb-2" />
      <!-- Navigation -->
      <v-list density="comfortable" nav>
        <v-list-item v-for="item in navItems" :key="item.to" :to="item.to" link rounded exact>

          <template #prepend>
            <font-awesome-icon :icon="item.icon" class="me-3" />
          </template>
          
          <v-list-item-title class="text-subtitle-2">{{ item.label }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template #append>
        <v-divider />
        <v-list>

          <v-list-item v-if="user?.roleId === 1 || user?.roleId === 2" :to="'/dashboard/settings'" link>
            <template #prepend>
              <font-awesome-icon icon="gear" class="me-3" />
            </template>
            <v-list-item-title class="text-body-2">Configuración</v-list-item-title>
          </v-list-item>

          <v-list-item link @click="logout">
            <template #prepend>
              <font-awesome-icon icon="right-from-bracket" class="me-3 text-red" />
            </template>
            <v-list-item-title class="text-body-2 text-red">Cerrar Sesión</v-list-item-title>
          </v-list-item>

        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Header -->
    <v-app-bar flat :color="isDark ? 'grey-darken-4' : 'grey-lighten-4'" class="px-4">
      <v-toolbar-title class="font-weight-medium d-flex align-center">
        <span class="me-2">Bienvenido,</span>
        <span class="text-primary font-weight-bold">{{ user?.username }}</span>
      </v-toolbar-title>
      <v-spacer />
      <!-- Toggle Dark/Light -->
      <v-btn icon variant="text" @click="toggleDark">
        <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main -->
    <v-main :class="isDark ? 'bg-grey-darken-3' : 'bg-grey-lighten-3'">
      <v-container fluid class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "vuetify";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const user = auth.user;
const logout = () => auth.logout();

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const toggleDark = () => {
  theme.change(isDark.value ? "light" : "dark");
};

const drawer = ref(true);
const route = useRoute();

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "chart-line" },
  { to: "/dashboard/documents", label: "Documentos", icon: "file" },
  { to: "/dashboard/suppliers", label: "Proveedores", icon: "users" },
  { to: "/dashboard/audit", label: "Auditoría", icon: "chart-line" },
  // { to: "/dashboard/tokens", label: "Tokens", icon: "link" }
  { to: "/dashboard/repository", label: "Repo Manual", icon: "folder-open" }
];

</script>

<style scoped>
.bg-grey-darken-3 {
  background-color: #1e1e1e !important;
}

.bg-grey-lighten-3 {
  background-color: #f5f5f5 !important;
}
</style>
