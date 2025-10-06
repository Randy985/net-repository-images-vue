<template>
  <AuthLayout>
    <v-card width="400">
      <v-card-title>Register</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSubmit">
          <v-text-field v-model="username" label="Username" required />
          <v-text-field v-model="email" label="Email" type="email" required />
          <v-text-field v-model="password" label="Password" type="password" required />
          <v-btn type="submit" color="primary" block>Register</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/layouts/AuthLayout.vue";

const auth = useAuthStore();
const username = ref("");
const email = ref("");
const password = ref("");

const onSubmit = async () => {
  await auth.register(username.value, email.value, password.value);
};
</script>
