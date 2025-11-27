<template>
  <v-dialog v-model="internalOpen" max-width="900">
    <v-card rounded="xl">
      <v-card-title class="text-h6 py-4 px-6">
        {{ props.editing ? "Editar Registro" : "Nuevo Registro" }}
      </v-card-title>

      <v-divider />

      <v-card-text class="px-6 pb-0">

        <v-row>
          <!-- FORM -->
          <v-col cols="12" md="7">

            <v-form @submit.prevent="submit">

              <v-text-field
                v-model="form.numeroDoc"
                label="Número de Documento"
                variant="outlined"
                :error="!!errors.numeroDoc"
                :error-messages="errors.numeroDoc"
                class="mb-3"
              />

              <v-text-field
                v-model="form.supplierId"
                label="Proveedor ID"
                variant="outlined"
                :error="!!errors.supplierId"
                :error-messages="errors.supplierId"
                class="mb-3"
              />

              <v-text-field
                v-model="form.nameSupplier"
                label="Nombre del Proveedor"
                variant="outlined"
                :error="!!errors.nameSupplier"
                :error-messages="errors.nameSupplier"
                class="mb-3"
              />

              <v-text-field
                v-model="form.description"
                label="Descripción"
                variant="outlined"
                :error="!!errors.description"
                :error-messages="errors.description"
                class="mb-3"
              />

              <v-row>
                <v-col>
                  <v-text-field
                    type="date"
                    v-model="form.docDate"
                    label="Fecha"
                    variant="outlined"
                  />
                </v-col>

                <v-col>
                  <v-text-field
                    v-model="form.docTime"
                    label="Hora"
                    placeholder="HH:mm"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.externalUrl"
                label="URL (opcional)"
                variant="outlined"
                prepend-inner-icon="mdi-link"
                class="mb-3"
                @input="updatePreview"
              />

              <v-file-input
                v-model="file"
                label="Subir Archivo (opcional)"
                variant="outlined"
                prepend-icon="mdi-paperclip"
                accept=".jpg,.jpeg,.png,.pdf"
                @change="updatePreview"
              />

            </v-form>

          </v-col>

          <!-- PREVIEW -->
          <v-col cols="12" md="5" class="d-flex justify-center align-center">

            <v-sheet rounded="lg" border class="pa-2 text-center" style="width:100%; max-width:300px;">
              <div class="text-subtitle-2 mb-2">Vista previa</div>

              <template v-if="previewType === 'image'">
                <v-img :src="previewUrl || undefined" max-height="260" contain rounded />
              </template>

              <template v-else-if="previewType === 'pdf'">
                <v-icon size="80" color="red">mdi-file-pdf-box</v-icon>
                <div>{{ previewFileName }}</div>
              </template>

              <template v-else-if="previewType === 'url'">
                <v-icon size="80" color="green">mdi-link-variant</v-icon>
                <div class="text-truncate">{{ form.externalUrl }}</div>
              </template>

              <template v-else>
                <v-icon size="60">mdi-eye-off-outline</v-icon>
                <div>Sin vista previa</div>
              </template>

            </v-sheet>

          </v-col>
        </v-row>

      </v-card-text>

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="submit">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  isOpen: Boolean,
  editing: { type: Object, default: null }
});

const emit = defineEmits(["update:isOpen", "create"]);

const internalOpen = ref(false);

watch(() => props.isOpen, val => internalOpen.value = val);
watch(internalOpen, val => emit("update:isOpen", val));

/* --- FORM DATA --- */

const now = new Date();

const form = ref({
  numeroDoc: "",
  supplierId: "",
  nameSupplier: "",
  description: "",
  docDate: now.toISOString().slice(0,10),
  docTime: now.toTimeString().slice(0,5),
  externalUrl: ""
});

const file = ref<File | null>(null);

const errors = ref({
  numeroDoc: "",
  supplierId: "",
  nameSupplier: "",
  description: "",
});

/* --- RESET FORM --- */
const resetForm = () => {
  form.value = {
    numeroDoc: "",
    supplierId: "",
    nameSupplier: "",
    description: "",
    docDate: now.toISOString().slice(0,10),
    docTime: now.toTimeString().slice(0,5),
    externalUrl: ""
  };

  file.value = null;
  previewUrl.value = null;
  previewType.value = null;
  previewFileName.value = "";
};

watch(() => props.editing, val => {
  if (!val) return resetForm();

  form.value = {
    numeroDoc: val.numeroDoc,
    supplierId: val.supplierId,
    nameSupplier: val.nameSupplier,
    description: val.description,
    docDate: val.docDate,
    docTime: val.docTime,
    externalUrl: val.externalUrl || ""
  };

  file.value = null;
  previewUrl.value = null;
  previewType.value = null;
});

/* --- PREVIEW --- */

const previewUrl = ref<string | null>(null);
const previewType = ref<"image" | "pdf" | "url" | null>(null);
const previewFileName = ref("");

const updatePreview = () => {
  previewUrl.value = null;
  previewType.value = null;

  // URL
  if (form.value.externalUrl) {
    const url = form.value.externalUrl.toLowerCase();

    if (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png")) {
      previewUrl.value = form.value.externalUrl;
      previewType.value = "image";
      return;
    }

    if (url.endsWith(".pdf")) {
      previewType.value = "pdf";
      previewFileName.value = url.split("/").pop() || "PDF";
      return;
    }

    previewType.value = "url";
    return;
  }

  // ARCHIVO
  if (file.value) {
    previewFileName.value = file.value.name;

    if (file.value.type.includes("pdf")) {
      previewType.value = "pdf";
      return;
    }

    if (file.value.type.includes("image")) {
      previewUrl.value = URL.createObjectURL(file.value);
      previewType.value = "image";
      return;
    }
  }
};

/* --- SUBMIT --- */

const submit = () => {
  errors.value = {
    numeroDoc: "",
    supplierId: "",
    nameSupplier: "",
    description: "",
  };

  let bad = false;

  if (!form.value.numeroDoc || isNaN(Number(form.value.numeroDoc)))
    errors.value.numeroDoc = "Ingrese un número válido", bad = true;

  if (!form.value.supplierId || isNaN(Number(form.value.supplierId)))
    errors.value.supplierId = "Ingrese un ID válido", bad = true;

  if (!form.value.nameSupplier)
    errors.value.nameSupplier = "Ingrese nombre del proveedor", bad = true;

  if (!form.value.description)
    errors.value.description = "Ingrese una descripción", bad = true;

  if (bad) return;

  emit("create", {
    mode: props.editing ? "edit" : "new",
    id: props.editing?.id || null,
    data: {
      ...form.value,
      numeroDoc: Number(form.value.numeroDoc),
      supplierId: Number(form.value.supplierId)
    },
    file: file.value
  });

  internalOpen.value = false;
};

/* --- CLOSE --- */
const close = () => internalOpen.value = false;
</script>
