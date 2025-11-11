<template>
  <v-dialog v-model="internalOpen" max-width="420">
    <v-card rounded="xl" elevation="2">
      <v-card-title class="text-h6 font-weight-bold px-6 pt-4">
        Gestionar API Key
      </v-card-title>
      <v-divider />
      <v-card-text class="px-6 py-6">
        <div class="text-body-2 mb-4">
          ⚠️ Por seguridad, la API Key solo se muestra una vez al generarse.
          <br />
          Si la pierdes, puedes regenerarla.
        </div>

        <v-alert
          v-if="hasKey"
          type="success"
          variant="tonal"
          class="mb-4"
          title="API Key activa"
        >
          Esta cuenta tiene una API Key activa.
        </v-alert>

        <v-alert
          v-else
          type="warning"
          variant="tonal"
          class="mb-4"
          title="Sin API Key"
        >
          Esta cuenta no tiene una API Key.
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn text @click="close">Cerrar</v-btn>
        <v-btn color="primary" @click="regenerateKey">
          {{ hasKey ? "Regenerar" : "Generar" }} API Key
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  isOpen: boolean
  user: any
}>()

const emit = defineEmits(["update:isOpen", "regenerate"])

const internalOpen = ref(props.isOpen)
const hasKey = ref(false)

watch(() => props.isOpen, (v) => (internalOpen.value = v))
watch(internalOpen, (v) => emit("update:isOpen", v))

const close = () => (internalOpen.value = false)

const regenerateKey = () => {
  emit("regenerate", props.user.id)
  close()
}
</script>
