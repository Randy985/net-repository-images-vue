<template>
    <v-container class="mx-auto" style="max-width: 1200px;">
        <!-- Header / Actions -->
        <div class="d-flex align-center justify-space-between mb-6">
            <div class="d-flex align-center gap-3">
                <v-icon size="28" class="me-2">mdi-account-multiple</v-icon>
                <div>
                    <h1 class="text-h5 font-weight-bold mb-1">Gestión de Usuarios</h1>
                    <div class="text-caption text-medium-emphasis">Administra cuentas, roles y accesos</div>
                </div>
            </div>

            <div class="d-flex align-center gap-3" style="max-width:500px; width:100%;">
                <!-- Buscador redondo pill más bajo -->
                <v-text-field v-model="search" variant="solo" density="compact" rounded="xl" class="flex-grow-1"
                    hide-details clearable prepend-inner-icon="mdi-magnify"
                    placeholder="Buscar usuario, correo, rol o ID…" />

                <v-btn color="primary" variant="elevated" class="px-4" rounded="xl" prepend-icon="mdi-account-plus"
                    @click="openDialog">
                    Nuevo Usuario
                </v-btn>

            </div>
        </div>


        <!-- Tabla -->
        <v-card rounded="xl" elevation="1">
            <v-data-table :headers="headers" :items="filteredItems" :loading="loading" class="user-table"
                density="comfortable" items-per-page="10">
                <!-- Loading -->
                <template #loading>
                    <v-skeleton-loader type="table-row@5" />
                </template>

                <!-- Empty -->
                <template #no-data>
                    <div class="py-10 text-center">
                        <v-icon size="36" class="mb-2">mdi-database-off</v-icon>
                        <div class="text-body-2 text-medium-emphasis">No hay usuarios para mostrar</div>
                    </div>
                </template>

                <!-- ===== Headers con icono, centrados y en negrita ===== -->
                <template #header.n>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-pound</v-icon>
                        <strong>ID</strong>
                    </div>
                </template>

                <template #header.username>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-account</v-icon>
                        <strong>Usuario</strong>
                    </div>
                </template>

                <template #header.email>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-email-outline</v-icon>
                        <strong>Correo</strong>
                    </div>
                </template>

                <template #header.roleName>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-shield-account</v-icon>
                        <strong>Rol</strong>
                    </div>
                </template>

                <template #header.createdAtFmt>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-calendar-plus</v-icon>
                        <strong>Creado</strong>
                    </div>
                </template>

                <template #header.lastLoginFmt>
                    <div class="th-left">
                        <v-icon size="18" class="me-1">mdi-clock-outline</v-icon>
                        <strong>Último login</strong>
                    </div>
                </template>

                <template #header.actions>
                    <div class="th-center">
                        <v-icon size="18" class="me-1">mdi-cog</v-icon>
                        <strong>Acciones</strong>
                    </div>
                </template>

                <!-- ===== Fin headers ===== -->

                <!-- Rollecito -->
                <template #item.roleName="{ item }">
                    <v-chip size="small" color="secondary" label variant="tonal">
                        <v-icon start size="16">mdi-shield-account</v-icon>
                        {{ item.roleName || '—' }}
                    </v-chip>
                </template>

                <!-- Fechas -->
                <template #item.createdAtFmt="{ item }">
                    <span class="text-no-wrap">{{ item.createdAtFmt || '—' }}</span>
                </template>
                <template #item.lastLoginFmt="{ item }">
                    <span class="text-no-wrap">{{ item.lastLoginFmt || '—' }}</span>
                </template>

                <!-- Acciones -->
                <template #item.actions="{ item }">
                    <div class="d-flex align-center justify-center gap-2">
                        <v-tooltip text="Editar" location="top">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon density="comfortable" variant="tonal" color="amber-darken-3"
                                    size="34" @click="editUser(item._raw)">
                                    <v-icon size="20">mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>

                        <v-tooltip text="Eliminar" location="top">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon density="comfortable" variant="tonal" color="red-darken-3"
                                    size="34" @click="deleteUser(item._raw)">
                                    <v-icon size="20">mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </div>

                </template>

            </v-data-table>
        </v-card>

        <!-- Modal -->
        <UserFormDialog v-model:isOpen="dialog" :roles="roles" :user="editingUser" @save="createUser"
            @updateUser="updateUser" />

    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/http'
import UserFormDialog from '@/components/users/UserFormDialog.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import Swal from 'sweetalert2'

dayjs.locale('es')

const dialog = ref(false)
const loading = ref(false)

const users = ref<any[]>([])
const roles = ref<any[]>([])
const editingUser = ref<any | null>(null)

const updateUser = async (form: any) => {
    await api.put(`/users/${form.id}`, form)
    await loadUsers()

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Usuario actualizado',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    })
}
const headers = [
    { title: 'ID', key: 'n' },
    { title: 'Usuario', key: 'username' },
    { title: 'Correo', key: 'email' },
    { title: 'Rol', key: 'roleName' },
    { title: 'Creado', key: 'createdAtFmt' },
    { title: 'Último login', key: 'lastLoginFmt' },
    { title: 'Acciones', key: 'actions', sortable: false },
] as any


// === Buscador ===
const search = ref('')

/** Normaliza texto para búsqueda (minúsculas y sin tildes) */
function norm(val: unknown): string {
    return String(val ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

/** Items filtrados por el término de búsqueda */
const tableItems = computed(() =>
    users.value.map((u, i) => ({
        _raw: u,
        n: i + 1,
        username: u.username,
        email: u.email,
        roleName: u.role?.name ?? u.roleName ?? null,
        createdAtFmt: formatDateTime(u.createdAt),
        lastLoginFmt: formatDateTime(u.lastLogin),
    })),
)

const filteredItems = computed(() => {
    const q = norm(search.value)
    if (!q) return tableItems.value
    return tableItems.value.filter((row) => {
        const n = norm(row.n)
        const user = norm(row.username)
        const email = norm(row.email)
        const role = norm(row.roleName)
        return n.includes(q) || user.includes(q) || email.includes(q) || role.includes(q)
    })
})

function formatDateTime(value?: string | null) {
    if (!value) return null
    const d = dayjs(value)
    return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : value
}

const openDialog = () => {
    editingUser.value = null  // modo crear
    dialog.value = true
}

const loadUsers = async () => {
    loading.value = true
    try {
        const res = await api.get('/users')
        users.value = res.data
    } finally {
        loading.value = false
    }
}

const loadRoles = async () => {
    const res = await api.get('/roles')
    roles.value = res.data
}

const createUser = async (form: any) => {
    await api.post('/auth/register', form)
    await loadUsers()

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Usuario creado correctamente',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    })
}

const editUser = (user: any) => {
    editingUser.value = {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId ?? user.role?.id ?? null
    }
    dialog.value = true
}

const deleteUser = async (user: any) => {
    const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: `Se eliminará la cuenta de ${user.username}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'bg-red text-white',
            cancelButton: 'bg-blue text-white'
        }

    })

    if (result.isConfirmed) {
        await api.delete(`/users/${user.id}`)
        await loadUsers()

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Usuario eliminado',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        })
    }
}

onMounted(() => {
    loadUsers()
    loadRoles()
})
</script>

<style scoped>
/* Helpers de gap */
.gap-2 {
    gap: 8px;
}

.gap-3 {
    gap: 12px;
}

/* Encabezados: centrados, negrita e ícono */
.th {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

/* Estilo general tabla */
.user-table :deep(th) {
    letter-spacing: .2px;
}

.user-table :deep(.v-data-table__tr) {
    transition: background-color .15s ease;
}

.user-table :deep(.v-data-table__tr:hover) {
    background-color: rgba(var(--v-theme-on-surface), 0.02);
}

/* Fechas sin quebrar línea */
.text-no-wrap {
    white-space: nowrap;
}

/* Anchos mínimos por columna (sin tocar tipos TS) */
.user-table :deep(th[data-key="username"]),
.user-table :deep(td[data-key="username"]) {
    min-width: 160px;
}

.user-table :deep(th[data-key="email"]),
.user-table :deep(td[data-key="email"]) {
    min-width: 220px;
}

.user-table :deep(th[data-key="roleName"]),
.user-table :deep(td[data-key="roleName"]) {
    min-width: 140px;
}

.user-table :deep(th[data-key="createdAtFmt"]),
.user-table :deep(th[data-key="lastLoginFmt"]) {
    min-width: 160px;
}

/* Alineación de acciones a la derecha, sin afectar headers centrados */
.user-table :deep(td[data-key="actions"]) {
    text-align: right;
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

.user-table :deep(td[data-key="n"]),
.user-table :deep(td[data-key="actions"]) {
    text-align: center;
}

.user-table :deep(td[data-key="username"]),
.user-table :deep(td[data-key="email"]),
.user-table :deep(td[data-key="roleName"]),
.user-table :deep(td[data-key="createdAtFmt"]),
.user-table :deep(td[data-key="lastLoginFmt"]) {
    text-align: left;
}
</style>
