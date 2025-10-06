<template>
  <v-dialog v-model="internalOpen" max-width="600">
    <v-card rounded="xl" elevation="2">
      <v-card-title class="text-h6 font-weight-bold py-4 px-6">Subir Documento</v-card-title>
      <v-divider />

      <v-card-text class="px-8 pt-6 pb-0">
        <v-form ref="formRef" autocomplete="off" @submit.prevent="onSubmit">
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

          <v-file-input
            v-model="file"
            :multiple="false"
            label="Seleccionar archivo"
            accept=".pdf,.jpg,.jpeg,.png"
            prepend-icon="mdi-paperclip"
            :disabled="submitting"
            show-size
            clearable
          />

          <div v-if="previewUrl" class="my-4 text-center">
            <v-img :src="previewUrl" max-height="200" max-width="100%" contain rounded />
          </div>

          <v-text-field
            v-model="description"
            label="Descripción"
            variant="underlined"
            density="comfortable"
            prepend-inner-icon="mdi-text"
            :disabled="submitting"
          />

          <v-select
            v-model="supplierId"
            :items="supplierItems"
            item-title="name"
            item-value="id"
            label="Proveedor"
            variant="underlined"
            density="comfortable"
            prepend-inner-icon="mdi-truck"
            :disabled="submitting"
            clearable
          />

          <v-text-field
            v-model="docDate"
            type="date"
            label="Fecha del documento"
            variant="underlined"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
            :disabled="submitting"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="submitting">Cancelar</v-btn>
        <v-btn color="primary" :loading="submitting" @click="onSubmit">Subir</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import imageCompression from "browser-image-compression";

type Supplier = { id: number; name: string };

const props = defineProps<{
  isOpen: boolean;
  suppliers: Supplier[];
}>();

const emit = defineEmits<{
  (e: "update:isOpen", v: boolean): void;
  (e: "upload", payload: FormData): void;
}>();

const internalOpen = ref(props.isOpen);
watch(() => props.isOpen, (v) => (internalOpen.value = v));
watch(internalOpen, async (v) => {
  emit("update:isOpen", v);
  if (v) resetForm();
});

const file = ref<File | File[] | null>(null);
const description = ref("");
const supplierId = ref<number | null>(null);
const docDate = ref<string>("");
const submitting = ref(false);
const error = ref("");
const previewUrl = ref<string | null>(null);

const supplierItems = computed(() => props.suppliers || []);
const formRef = ref();

function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function resetForm() {
  error.value = "";
  file.value = null;
  description.value = "";
  supplierId.value = null;
  docDate.value = todayLocalISO();
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  nextTick(() => formRef.value?.resetValidation?.());
}

function close() {
  internalOpen.value = false;
}

function isAllowedType(f: File) {
  const type = (f.type || "").toLowerCase();
  const byMime = ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(type);
  if (byMime) return true;
  const ext = f.name.split(".").pop()?.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png"].includes(ext || "");
}

function validateFile(single: File | null) {
  error.value = "";
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = null; }
  if (!single) return;

  if (!isAllowedType(single)) {
    error.value = "Formato no permitido. Solo PDF, JPG o PNG.";
    file.value = null;
    return;
  }

  if (single.type.startsWith("image/")) {
    previewUrl.value = URL.createObjectURL(single);
  }
}

// Observa cambios del v-model y normaliza a un único File
watch(file, (val) => {
  const single = Array.isArray(val) ? (val[0] ?? null) : val;
  validateFile(single);
});

async function onSubmit() {
  error.value = "";

  const single = Array.isArray(file.value) ? (file.value[0] ?? null) : file.value;
  if (!single) { error.value = "Selecciona un archivo válido."; return; }
  if (!supplierId.value) { error.value = "Selecciona un proveedor."; return; }
  if (!docDate.value) { error.value = "Selecciona una fecha."; return; }

  if (!isAllowedType(single)) { error.value = "Formato no permitido. Solo PDF, JPG o PNG."; return; }

  submitting.value = true;
  try {
    let toSend = single;

    if (single.type === "application/pdf") {
      if (single.size > 2 * 1024 * 1024) {
        error.value = "El PDF no debe superar 2 MB.";
        submitting.value = false;
        return;
      }
    } else if (single.type.startsWith("image/")) {
      const compressed = await imageCompression(single, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      if (compressed.size > 2 * 1024 * 1024) {
        error.value = "La imagen, incluso comprimida, supera 2 MB.";
        submitting.value = false;
        return;
      }
      toSend = compressed;
    }

    const formData = new FormData();
    formData.append("file", toSend, toSend.name);
    formData.append("description", description.value);
    formData.append("supplierId", String(supplierId.value));
    formData.append("docDate", docDate.value);

    emit("upload", formData);
    close();
  } catch (e: any) {
    error.value = e?.message || "Error al procesar el archivo.";
  } finally {
    submitting.value = false;
  }
}
</script>
