<template>
  <v-container class="mx-auto py-10" style="max-width: 1200px;">
    <v-card class="pa-10 d-flex flex-column align-center text-center welcome-card" rounded="xl" elevation="3">
      <v-avatar size="65" color="primary" class="mb-4">
        <v-icon size="40" class="text-white">mdi-file-cabinet</v-icon>
      </v-avatar>

      <h1 class="text-h5 font-weight-bold mb-3">
        Bienvenido al <span class="text-primary">Repositorio de Documentos</span>
      </h1>

      <p class="text-body-1 text-medium-emphasis mb-6" style="max-width: 700px;">
        Aquí podrás administrar, consultar y gestionar todos los documentos de tu organización
        de manera <strong>fácil, segura y centralizada</strong>.
      </p>

    </v-card>
  </v-container>
</template>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.02));
}
</style>
