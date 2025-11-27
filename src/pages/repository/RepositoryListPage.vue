<template>
    <v-container class="mx-auto" style="max-width: 1400px;">

        <div class="d-flex align-center justify-space-between mb-6">
            <div class="d-flex align-center gap-3">
                <v-icon size="28" class="me-2">mdi-folder-open</v-icon>
                <div>
                    <h1 class="text-h5 font-weight-bold mb-1">Repositorio Manual</h1>
                    <div class="text-caption text-medium-emphasis">Carga manual de documentos</div>
                </div>
            </div>

            <div class="d-flex align-center" style="max-width:500px; width:100%;">
                <v-text-field v-model="search" variant="solo" density="compact" rounded="xl" hide-details clearable
                    prepend-inner-icon="mdi-magnify" placeholder="Buscar por proveedor, usuario o descripción…"
                    class="flex-grow-1 me-2" />

                <v-btn color="primary" rounded="xl" prepend-icon="mdi-file-plus" @click="openNew">
                    Nuevo Registro
                </v-btn>
            </div>
        </div>

        <v-card rounded="xl" elevation="1">
            <v-data-table :headers="headers" :items="filteredItems" :loading="loading" class="doc-table"
                density="comfortable" items-per-page="10">

                <!-- ===== HEADERS PERSONALIZADOS ===== -->

                <template #header.id>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-pound</v-icon>
                        <strong>ID</strong>
                    </div>
                </template>

                <template #header.numeroDoc>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-numeric</v-icon>
                        <strong>Número Doc</strong>
                    </div>
                </template>

                <template #header.supplierId>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-truck</v-icon>
                        <strong>Proveedor ID</strong>
                    </div>
                </template>

                <template #header.nameSupplier>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-store</v-icon>
                        <strong>Nombre Proveedor</strong>
                    </div>
                </template>

                <template #header.description>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-file-document</v-icon>
                        <strong>Tipo</strong>
                    </div>
                </template>

                <template #header.docDate>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-calendar</v-icon>
                        <strong>Fecha</strong>
                    </div>
                </template>

                <template #header.docTime>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-clock-time-four</v-icon>
                        <strong>Hora</strong>
                    </div>
                </template>

                <template #header.uploadedByUser>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-account</v-icon>
                        <strong>Usuario</strong>
                    </div>
                </template>

                <template #header.filePath>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-file-link</v-icon>
                        <strong>Archivo / URL</strong>
                    </div>
                </template>

                <template #header.actions>
                    <div class="th-center">
                        <v-icon size="18" class="me-1">mdi-cog</v-icon>
                        <strong>Acciones</strong>
                    </div>
                </template>

                <!-- ===== LOADING ===== -->
                <template #loading>
                    <v-skeleton-loader type="table-row@5" />
                </template>

                <!-- ===== USERNAME ===== -->
                <template #item.uploadedByUser="{ item }">
                    {{ item._raw.uploadedByUser?.username ?? "—" }}
                </template>

                <!-- ===== FILE / URL ===== -->
                <template #item.filePath="{ item }">
                    <div class="d-flex align-center justify-center gap-2">

                        <!-- Si hay archivo físico -->
                        <template v-if="item._raw.filePath">
                            <v-btn icon variant="tonal" color="blue-darken-2" density="comfortable" size="34"
                                rounded="xl" @click="openFile({ filePath: item._raw.filePath })">
                                <v-icon size="20">mdi-eye</v-icon>
                            </v-btn>
                        </template>

                        <!-- Si hay URL externa -->
                        <template v-if="item._raw.externalUrl">
                            <v-btn icon variant="tonal" color="green-darken-2" density="comfortable" size="34"
                                rounded="xl" @click="openFile({ externalUrl: item._raw.externalUrl })">
                                <v-icon size="20">mdi-link-variant</v-icon>
                            </v-btn>
                        </template>

                        <!-- Si no hay nada -->
                        <template v-if="!item._raw.filePath && !item._raw.externalUrl">
                            —
                        </template>

                    </div>
                </template>

                <!-- ===== ACCIONES ===== -->
                <template #item.actions="{ item }">
                    <div class="d-flex align-center justify-center gap-2">

                        <v-tooltip text="Editar" location="top">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon variant="tonal" color="amber-darken-3" density="comfortable"
                                    size="34" rounded="xl" @click="editItem(item._raw)">
                                    <v-icon size="20">mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>

                        <v-tooltip text="Eliminar" location="top">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon variant="tonal" color="red-darken-3" density="comfortable"
                                    size="34" rounded="xl" @click="deleteItem(item._raw)">
                                    <v-icon size="20">mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>

                    </div>
                </template>

            </v-data-table>
        </v-card>

        <RepositoryFormDialog v-model:isOpen="dialog" :editing="editingItem" @create="handleSave" />

    </v-container>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/api/http";
import Swal from "sweetalert2";

import RepositoryFormDialog from "@/components/repository/RepositoryFormDialog.vue";

const loading = ref(false);
const dialog = ref(false);
const items = ref<any[]>([]);
const search = ref("");
const editingItem = ref<any | null>(null);

const headers = [
    { title: "ID", key: "id" },
    { title: "Número Doc", key: "numeroDoc" },
    { title: "Proveedor ID", key: "supplierId" },
    { title: "Nombre Proveedor", key: "nameSupplier" },
    { title: "Tipo", key: "description" },
    { title: "Fecha", key: "docDate" },
    { title: "Hora", key: "docTime" },
    { title: "Usuario", key: "uploadedByUser" },
    { title: "Archivo / URL", key: "filePath" },
    { title: "Acciones", key: "actions", sortable: false }
];

const norm = (v: unknown) =>
    String(v ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const filteredItems = computed(() => {
    const q = norm(search.value);
    if (!q) return items.value.map(i => ({ _raw: i, ...i }));

    return items.value
        .filter(r =>
            norm(r.numeroDoc).includes(q) ||
            norm(r.nameSupplier).includes(q) ||
            norm(r.usuario).includes(q) ||
            norm(r.description).includes(q)
        )
        .map(i => ({ _raw: i, ...i }));
});

const loadData = async () => {
    loading.value = true;
    try {
        const res = await api.get("/repository-documents");
        items.value = res.data;
    } finally {
        loading.value = false;
    }
};

const openNew = () => {
    editingItem.value = null;
    dialog.value = true;
};

const editItem = (item: any) => {
    editingItem.value = item;
    dialog.value = true;
};

import { nextTick } from "vue";

const handleSave = async ({ mode, data, id, file }: any) => {
    let repoId = id;

    if (mode === "new") {
        const res = await api.post("/repository-documents", data);
        repoId = res.data.id;
    }

    if (mode === "edit") {
        await api.put(`/repository-documents/${repoId}`, data);
    }

    if (file) {
        const fd = new FormData();
        fd.append("file", file);
        await api.post(`/repository-documents/${repoId}/upload`, fd);
    }

    // 1. Cerrar el modal primero
    dialog.value = false;

    // 2. Dejar a Vuetify terminar la animación del modal
    await nextTick();

    // 3. Ahora sí limpiar los datos del formulario
    editingItem.value = null;

    // 4. Recargar la tabla
    await loadData();

    Swal.fire({
        toast: true,
        position: "top-end",
        icon: mode === "new" ? "success" : "warning",
        title: mode === "new" ? "Registro creado correctamente" : "Registro actualizado",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });
};


const deleteItem = async (item: any) => {
    const result = await Swal.fire({
        title: "¿Eliminar registro?",
        text: `Se eliminará el documento ${item.numeroDoc}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        customClass: {
            confirmButton: "bg-red text-white",
            cancelButton: "bg-blue text-white",
        },
    });

    if (!result.isConfirmed) return;

    await api.delete(`/repository-documents/${item.id}`);
    await loadData();

    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Registro eliminado correctamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });
};


const openFile = (item: any) => {
    if (item.filePath)
        window.open(`${import.meta.env.VITE_API_URL}/uploads/${item.filePath}`, "_blank");

    if (item.externalUrl)
        window.open(item.externalUrl, "_blank");
};

onMounted(loadData);
</script>

<style scoped>
.doc-table :deep(th) {
    font-weight: 700;
}

.doc-table :deep(.v-data-table__tr:hover) {
    background: rgba(0, 0, 0, 0.04);
}

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
</style>
