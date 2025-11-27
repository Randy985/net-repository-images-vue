<template>
  <v-container class="mx-auto" style="max-width: 1200px;">
    <!-- Header / Actions -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <v-icon size="28" class="me-2">mdi-file-document</v-icon>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Gestión de Documentos</h1>
          <div class="text-caption text-medium-emphasis">Administra y sube documentos al repositorio</div>
        </div>
      </div>

      <div class="d-flex align-center gap-3" style="max-width:500px; width:100%;">
        <!-- Buscador pill -->
        <v-text-field v-model="search" variant="solo" density="compact" rounded="xl" class="flex-grow-1 me-2"
          hide-details clearable prepend-inner-icon="mdi-magnify"
          placeholder="Buscar por descripción, nombre o proveedor…" />

        <v-btn color="primary" variant="elevated" class="px-4" rounded="xl" prepend-icon="mdi-file-upload"
          @click="openDialog()">
          Nuevo Documento
        </v-btn>
      </div>
    </div>

    <!-- Tabla -->
    <v-card rounded="xl" elevation="1">
      <v-data-table :headers="headers" :items="filteredItems" :loading="loading" class="doc-table" density="comfortable"
        items-per-page="10">
        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <!-- Empty -->
        <template #no-data>
          <div class="py-10 text-center">
            <v-icon size="36" class="mb-2">mdi-database-off</v-icon>
            <div class="text-body-2 text-medium-emphasis">No hay documentos para mostrar</div>
          </div>
        </template>

        <!-- ===== Headers con íconos ===== -->
        <template #header.n>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-pound</v-icon>
            <strong>ID</strong>
          </div>
        </template>

        <template #header.originalFileName>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-file-outline</v-icon>
            <strong>Archivo</strong>
          </div>
        </template>

        <template #header.description>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-text</v-icon>
            <strong>Descripción</strong>
          </div>
        </template>

        <template #header.supplierName>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-truck</v-icon>
            <strong>Proveedor</strong>
          </div>
        </template>

        <template #header.uploadedBy>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-account</v-icon>
            <strong>Usuario</strong>
          </div>
        </template>

        <template #header.docDateFmt>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-calendar</v-icon>
            <strong>Fecha</strong>
          </div>
        </template>

        <template #header.actions>
          <div class="th-center">
            <v-icon size="18" class="me-1">mdi-cog</v-icon>
            <strong>Acciones</strong>
          </div>
        </template>

        <!-- Columna Archivo -->
        <template #item.originalFileName="{ item }">
          <div class="d-flex align-center justify-center">
            <div v-if="isImage(item._raw.fileType)">
              <v-img :src="getFileUrl(item._raw.filePath)" width="40" height="40" cover class="rounded cursor-pointer"
                @click="openPreview(item._raw)" />
            </div>
            <div v-else class="cursor-pointer" @click="downloadDocument(item._raw)">
              <v-icon size="32" color="red">mdi-file-pdf-box</v-icon>
            </div>
          </div>
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center gap-2">
            <!-- Editar -->
            <v-tooltip text="Editar" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon density="comfortable" variant="tonal" color="amber-darken-3" size="34"
                  @click="editDocument(item._raw)">
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Eliminar -->
            <v-tooltip text="Eliminar" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon density="comfortable" variant="tonal" color="red-darken-3" size="34"
                  @click="deleteDocument(item._raw)">
                  <v-icon size="20">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Descargar -->
            <v-tooltip text="Descargar" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon density="comfortable" variant="tonal" color="blue-darken-3" size="34"
                  @click="downloadDocument(item._raw)">
                  <v-icon size="20">mdi-download</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal -->
    <DocumentFormDialog v-model:isOpen="dialog" :suppliers="suppliers" :doc="editingDoc" @upload="uploadDocument"
      @updateDoc="updateDocument" />
  </v-container>

  <v-dialog v-model="previewDialog" max-width="600">
    <v-card rounded="xl">
      <v-card-title class="text-h6">Vista previa</v-card-title>
      <v-card-text>
        <v-img v-if="previewDoc && isImage(previewDoc.fileType)" :src="getFileUrl(previewDoc.filePath)" max-height="400"
          contain class="rounded" />
        <div v-else class="text-center py-6">
          <v-icon size="64" color="red">mdi-file-pdf-box</v-icon>
          <p class="mt-2">{{ previewDoc?.originalFileName }}</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="previewDialog = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import api from "@/api/http"
import Swal from "sweetalert2"
import DocumentFormDialog from "@/components/documents/DocumentFormDialog.vue"
import dayjs from "dayjs"
import "dayjs/locale/es"

dayjs.locale("es")

type Supplier = { id: number; name: string }

const dialog = ref(false)
const loading = ref(false)
const documents = ref<any[]>([])
const suppliers = ref<Supplier[]>([])
const editingDoc = ref<any | null>(null)

const headers = [
  { title: "Proveedor ID", key: "supplierId" },
  { title: "Archivo", key: "originalFileName" },
  { title: "Descripción", key: "description" },
  { title: "Proveedor", key: "supplierName" },
  { title: "Usuario", key: "uploadedBy" },
  { title: "Fecha", key: "docDateFmt" },
  { title: "Acciones", key: "actions", sortable: false },
] as any[]

const search = ref("")

function norm(val: unknown): string {
  return String(val ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const tableItems = computed(() =>
  documents.value.map((d, i) => ({
    _raw: d,
    supplierId: d.supplierId,
    id: d.id,
    originalFileName: d.originalFileName,
    description: d.description,
    supplierName: suppliers.value.find(s => s.id === d.supplierId)?.name ?? d.supplierId,
    uploadedBy: d.uploadedByName ?? "—",
    docDateFmt: dayjs(d.docDate).format("DD/MM/YYYY"),

    filePath: d.filePath,
    fileType: d.fileType
  })),
)

const filteredItems = computed(() => {
  const q = norm(search.value)
  if (!q) return tableItems.value
  return tableItems.value.filter(row =>
    norm(row.originalFileName).includes(q) ||
    norm(row.description).includes(q) ||
    norm(row.supplierName).includes(q) ||
    norm(row.uploadedBy).includes(q),
  )
})

const openDialog = () => {
  editingDoc.value = null
  dialog.value = true
}

const editDocument = (doc: any) => {
  editingDoc.value = doc
  dialog.value = true
}

const loadSuppliers = async () => {
  const res = await api.get("/suppliers")
  suppliers.value = res.data
}

const loadDocuments = async () => {
  loading.value = true
  try {
    const res = await api.get("/documents")
    documents.value = res.data
  } finally {
    loading.value = false
  }
}

const uploadDocument = async (formData: FormData) => {
  await api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } })
  await loadDocuments()
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Documento subido correctamente",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  })
}

const updateDocument = async (payload: any) => {
  await api.put(`/documents/${payload.id}`, payload)
  await loadDocuments()
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "warning",
    title: "Documento actualizado",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  })
}

const downloadDocument = async (doc: any) => {
  const res = await api.get(`/documents/${doc.id}/download`, { responseType: "blob" })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement("a")
  a.href = url
  a.download = doc.originalFileName || "archivo"
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

const deleteDocument = async (doc: any) => {
  const result = await Swal.fire({
    title: "¿Eliminar documento?",
    text: doc.originalFileName,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "bg-red text-white",
      cancelButton: "bg-blue text-white",
    },
  })

  if (result.isConfirmed) {
    await api.delete(`/documents/${doc.id}`)
    await loadDocuments()
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Documento eliminado",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
  }
}

const previewDialog = ref(false)
const previewDoc = ref<any | null>(null)

const getFileUrl = (filePath: string) => {
  return `${import.meta.env.VITE_API_URL}/uploads/${filePath}`
}

const isImage = (fileType: string) => {
  if (!fileType) return false
  return fileType.toLowerCase() === ".jpg" ||
    fileType.toLowerCase() === ".jpeg" ||
    fileType.toLowerCase() === ".png"
}


const openPreview = (doc: any) => {
  previewDoc.value = doc
  previewDialog.value = true
}

onMounted(() => {
  loadSuppliers()
  loadDocuments()
})
</script>

<style scoped>
.th-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 700;
}

.th-center {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.doc-table :deep(th) {
  letter-spacing: 0.2px;
  font-weight: 700;
}

.doc-table :deep(.v-data-table__tr) {
  transition: background-color 0.15s ease;
}

.doc-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}
</style>
