<template>
  <v-container class="mx-auto" style="max-width: 1400px;">
    <!-- Header / Actions -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <v-icon size="28" class="me-2">mdi-truck</v-icon>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Gestión de Proveedores</h1>
          <div class="text-caption text-medium-emphasis">
            Administra proveedores del sistema
          </div>
        </div>
      </div>

      <div class="d-flex align-center gap-3" style="max-width:600px; width:100%;">
        <!-- Buscador -->
        <v-text-field v-model="search" variant="solo" density="compact" rounded="xl" class="flex-grow-1 me-3"
          hide-details clearable prepend-inner-icon="mdi-magnify"
          placeholder="Buscar proveedor, correo, teléfono, NIT…" />

        <v-btn color="primary" variant="elevated" class="px-4" rounded="xl" prepend-icon="mdi-truck-plus"
          @click="openDialog(null)">
          Nuevo Proveedor
        </v-btn>
      </div>
    </div>

    <!-- Tabla -->
    <v-card rounded="xl" elevation="1">
      <v-data-table :headers="headers" :items="filteredItems" :loading="loading" class="supplier-table"
        density="comfortable" items-per-page="10">
        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <!-- Empty -->
        <template #no-data>
          <div class="py-10 text-center">
            <v-icon size="36" class="mb-2">mdi-database-off</v-icon>
            <div class="text-body-2 text-medium-emphasis">
              No hay proveedores para mostrar
            </div>
          </div>
        </template>

        <!-- ===== Headers con icono y negrita ===== -->
        <template #header.n>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-pound</v-icon>
            <strong>ID</strong>
          </div>
        </template>

        <template #header.name>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-truck</v-icon>
            <strong>Proveedor</strong>
          </div>
        </template>

        <template #header.taxId>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-card-account-details</v-icon>
            <strong>NIT</strong>
          </div>
        </template>

        <template #header.email>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-email-outline</v-icon>
            <strong>Correo</strong>
          </div>
        </template>

        <template #header.phone>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-phone</v-icon>
            <strong>Teléfono</strong>
          </div>
        </template>

        <template #header.address>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-map-marker</v-icon>
            <strong>Dirección</strong>
          </div>
        </template>

        <template #header.actions>
          <div class="th-center">
            <v-icon size="18" class="me-1">mdi-cog</v-icon>
            <strong>Acciones</strong>
          </div>
        </template>

        <template #header.isActive>
          <div class="th-left">
            <v-icon size="18" class="me-1">mdi-toggle-switch</v-icon>
            <strong>Estado</strong>
          </div>
        </template>

        <template #item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'green' : 'red'" size="small" label variant="tonal">
            <v-icon start size="16">
              {{ item.isActive ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            {{ item.isActive ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>


        <!-- ===== Acciones ===== -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center gap-2">
            <v-btn icon density="comfortable" variant="tonal" color="amber-darken-3" size="34"
              @click="openDialog(item._raw)">
              <v-icon size="20">mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon density="comfortable" variant="tonal" color="red-darken-3" size="34"
              @click="deleteSupplier(item._raw)">
              <v-icon size="20">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de proveedor -->
    <SupplierFormDialog v-model:isOpen="dialog" :supplier="editingSupplier" @save="createSupplier"
      @updateSupplier="updateSupplier" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/api/http";
import SupplierFormDialog from "@/components/suppliers/SupplierFormDialog.vue";
import Swal from "sweetalert2";
import { parsePhoneNumberFromString } from "libphonenumber-js"

const dialog = ref(false);
const loading = ref(false);
const suppliers = ref<any[]>([]);
const editingSupplier = ref<any | null>(null);

const headers = [
  { title: "ID", key: "n" },
  { title: "Proveedor", key: "name" },
  { title: "NIT", key: "taxId" },
  { title: "Correo", key: "email" },
  { title: "Teléfono", key: "phone" },
  { title: "Dirección", key: "address" },
  { title: "Estado", key: "isActive" },
  { title: "Acciones", key: "actions", sortable: false },
] as any;


// === Buscador ===
const search = ref("");

function norm(val: unknown): string {
  return String(val ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const tableItems = computed(() =>
  suppliers.value.map((s, i) => {
    const phoneObj = parsePhoneNumberFromString(s.phone)
    return {
      _raw: s,
      n: i + 1,
      name: s.name,
      taxId: s.taxId,
      email: s.email,
      phone: phoneObj
        ? `${phoneObj.country} ${phoneObj.nationalNumber}`
        : s.phone,
      address: s.address,
      isActive: s.isActive,
    }
  })
)




const filteredItems = computed(() => {
  const q = norm(search.value);
  if (!q) return tableItems.value;
  return tableItems.value.filter((row) => {
    return (
      norm(row.name).includes(q) ||
      norm(row.taxId).includes(q) ||
      norm(row.email).includes(q) ||
      norm(row.phone).includes(q) ||
      norm(row.address).includes(q)
    );
  });
});

// === API Calls ===
const loadSuppliers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/suppliers");
    suppliers.value = res.data;
  } finally {
    loading.value = false;
  }
};

const createSupplier = async (form: any) => {
  await api.post("/suppliers", form);
  await loadSuppliers();

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Proveedor creado correctamente",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

const updateSupplier = async (form: any) => {
  await api.put(`/suppliers/${form.id}`, form);
  await loadSuppliers();

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "warning",
    title: "Proveedor actualizado",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

const deleteSupplier = async (supplier: any) => {
  const result = await Swal.fire({
    title: "¿Eliminar proveedor?",
    text: `Se desactivará ${supplier.name}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "bg-red text-white",
      cancelButton: "bg-blue text-white",
    },
  });

  if (result.isConfirmed) {
    await api.delete(`/suppliers/${supplier.id}`);
    await loadSuppliers();

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Proveedor eliminado",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
};

// === Modal ===
const openDialog = (supplier: any | null) => {
  editingSupplier.value = supplier;
  dialog.value = true;
};

onMounted(() => {
  loadSuppliers();
});
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
</style>
