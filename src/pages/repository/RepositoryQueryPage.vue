<template>
    <v-container class="mx-auto" style="max-width: 1400px;">
        <div class="mb-6">
            <h1 class="text-h5 font-weight-bold">Consulta y Filtros</h1>
            <div class="text-caption text-medium-emphasis">
                Búsqueda avanzada del repositorio
            </div>
        </div>

        <!-- FILTROS -->
        <v-card rounded="xl" elevation="1" class="pa-6 mb-4">
            <v-row dense>
                <!-- FILA 1: INPUTS -->
                <v-col cols="12" md="4">
                    <v-autocomplete v-model="filters.numeroDocs" :items="options.numeroDocs" label="Número de documento"
                        multiple chips closable-chips variant="outlined" density="compact" autocomplete="off"
                        clearable />
                </v-col>

                <v-col cols="12" md="4">
                    <v-autocomplete v-model="filters.supplierIds" :items="options.suppliers" item-title="nameSupplier"
                        item-value="supplierId" label="Proveedor" multiple chips closable-chips variant="outlined"
                        density="compact" autocomplete="off" clearable />
                </v-col>

                <v-col cols="12" md="4">
                    <v-autocomplete v-model="filters.uploadedByUsers" :items="options.users" label="Usuario" multiple
                        chips closable-chips variant="outlined" density="compact" autocomplete="off" clearable />
                </v-col>

                <v-col cols="12" md="4">
                    <v-autocomplete v-model="filters.noProformaFacturas" :items="options.noProformaFacturas"
                        label="No Proforma / Factura" multiple chips closable-chips variant="outlined" density="compact" autocomplete="off"
                        clearable />

                </v-col>

                <!-- FILA 2: FECHAS + BOTONES -->
                <v-col cols="12" md="6">
                    <v-row dense>
                        <v-col cols="6">
                            <v-text-field v-model="filters.dateFrom" type="date" label="Desde" variant="outlined"
                                density="compact" />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="filters.dateTo" type="date" label="Hasta" variant="outlined"
                                density="compact" />
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="12">
                    <v-row dense>
                        <v-col cols="12" md="3">
                            <v-text-field v-model="filters.fechaProformaFrom" type="date" label="Proforma Desde"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-text-field v-model="filters.fechaProformaTo" type="date" label="Proforma Hasta"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-text-field v-model="filters.fechaCorreoFrom" type="date" label="Correo Desde"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-text-field v-model="filters.fechaCorreoTo" type="date" label="Correo Hasta"
                                variant="outlined" density="compact" />
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="12" class="d-flex justify-end align-center gap-3">
                    <v-btn variant="outlined" size="small" class="me-1" @click="refresh">
                        Refresh
                    </v-btn>

                    <v-btn color="primary" size="small" prepend-icon="mdi-filter" class="me-1" @click="search">
                        Filtrar
                    </v-btn>

                    <v-btn color="success" variant="tonal" size="small" prepend-icon="mdi-file-excel" class="me-1"
                        :disabled="rows.length === 0" @click="exportExcel">
                        Excel
                    </v-btn>

                    <v-btn color="red-lighten-1" variant="tonal" size="small" prepend-icon="mdi-file-pdf-box"
                        :disabled="rows.length === 0" @click="exportPdf">
                        PDF
                    </v-btn>
                </v-col>
            </v-row>
        </v-card>

        <!-- TABLA -->
        <v-card rounded="xl" elevation="1">
            <v-data-table-server class="doc-table" :headers="headers" :items="rows" density="comfortable"
                v-model:page="filters.page" v-model:items-per-page="filters.pageSize"
                :items-per-page-options="[10, 25, 50, 100]" :items-length="totalItems" @update:page="fetchData"
                @update:items-per-page="fetchData">

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
                        <strong>Proveedor</strong>
                    </div>
                </template>

                <template #header.documentUser>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-account</v-icon>
                        <strong>Usuario</strong>
                    </div>
                </template>

                <template #header.description>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-file-document</v-icon>
                        <strong>Descripción</strong>
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

                <template #no-data>
                    <div class="pa-6 text-medium-emphasis">
                        Presiona “Filtrar” para mostrar resultados
                    </div>
                </template>
            </v-data-table-server>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api/http";

const filters = ref({
    numeroDocs: [],
    supplierIds: [],
    uploadedByUsers: [],
    noProformaFacturas: [],
    fechaProformaFrom: null,
    fechaProformaTo: null,
    fechaCorreoFrom: null,
    fechaCorreoTo: null,
    dateFrom: null,
    dateTo: null,
    page: 1,
    pageSize: 10
});


const options = ref({
    numeroDocs: [] as string[],
    suppliers: [] as { supplierId: string; nameSupplier: string }[],
    users: [] as string[],
    noProformaFacturas: [] as string[],
});

const rows = ref<any[]>([]);
const totalItems = ref(0);

const headers = [
    { title: "Número Doc", key: "numeroDoc" },
    { title: "Proveedor ID", key: "supplierId" },
    { title: "Proveedor", key: "nameSupplier" },
    { title: "Usuario", key: "documentUser" },
    { title: "Descripción", key: "description" },
    { title: "Fecha", key: "docDate" },
    { title: "Hora", key: "docTime" },
    { title: "No Proforma/Factura", key: "noProformaFactura" },
    { title: "Fecha Proforma", key: "fechaProformaFactura" },
    { title: "Fecha Correo", key: "fechaCorreoOriginal" }
];

const loadOptions = async () => {
    const [docs, suppliers, users, noProformas] = await Promise.all([
        api.get("/repository-documents-query/options/numero-doc"),
        api.get("/repository-documents-query/options/suppliers"),
        api.get("/repository-documents-query/options/users"),
        api.get("/repository-documents-query/options/no-proforma")
    ]);

    options.value.numeroDocs = docs.data;
    options.value.suppliers = suppliers.data;
    options.value.users = users.data;
    options.value.noProformaFacturas = noProformas.data;
};

const search = async () => {
    filters.value.page = 1;
    await fetchData();
};

const fetchData = async () => {
    const res = await api.post("/repository-documents-query/search", filters.value);
    rows.value = res.data.data;
    totalItems.value = res.data.total;
};

const refresh = () => {
    filters.value.numeroDocs = [];
    filters.value.supplierIds = [];
    filters.value.uploadedByUsers = [];
    filters.value.dateFrom = null;
    filters.value.dateTo = null;
    filters.value.noProformaFacturas = [];
    filters.value.fechaProformaFrom = null;
    filters.value.fechaProformaTo = null;
    filters.value.fechaCorreoFrom = null;
    filters.value.fechaCorreoTo = null;

    rows.value = [];
};

const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

const exportExcel = async () => {
    const res = await api.post(
        "/repository-documents-query/export/excel",
        filters.value,
        { responseType: "blob" }
    );
    download(res.data, "Repositorio.xlsx");
};

const exportPdf = async () => {
    const res = await api.post(
        "/repository-documents-query/export/pdf",
        filters.value,
        { responseType: "blob" }
    );
    download(res.data, "Repositorio.pdf");
};

onMounted(loadOptions);
</script>

<style scoped>
.doc-table :deep(th) {
    font-weight: 700;
}

.th-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-weight: 700;
}
</style>
