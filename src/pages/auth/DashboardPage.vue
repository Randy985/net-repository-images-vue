<template>
  <v-container>
    <h1>Bienvenido {{ auth.user?.username }}</h1>
    <p>Email: {{ auth.user?.email }}</p>
    <p>Rol ID: {{ auth.user?.roleId }}</p>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>
