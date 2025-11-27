<template>
  <v-dialog v-model="internalOpen" max-width="500">
    <v-card rounded="xl">
      <v-card-title class="text-h6 py-4">Subir Archivo</v-card-title>
      <v-divider />

      <v-card-text>
        <v-file-input
          label="Archivo"
          v-model="file"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="submit">Subir</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ isOpen: boolean; id: number | null }>();
const emit = defineEmits(["update:isOpen", "upload"]);

const internalOpen = ref(props.isOpen);
const file = ref<any>(null);

watch(() => props.isOpen, v => internalOpen.value = v);
watch(internalOpen, v => emit("update:isOpen", v));

const close = () => internalOpen.value = false;

const submit = () => {
  if (!file.value) return;
  emit("upload", { id: props.id, file: file.value });
  close();
};
</script>
