<template>
    <v-dialog v-model="internalOpen" max-width="600">
        <v-card rounded="xl" elevation="2">
            <v-card-title class="text-h6 font-weight-bold py-4 px-6">
                {{ supplier ? "Editar Proveedor" : "Nuevo Proveedor" }}
            </v-card-title>
            <v-divider />

            <v-card-text class="px-8 pt-8 pb-0">
                <v-form ref="formRef" autocomplete="off" @submit.prevent="submitForm">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="form.name" label="Nombre del proveedor" variant="underlined"
                                density="comfortable" :rules="[rules.required]" prepend-inner-icon="mdi-truck" clearable
                                hide-details="auto" autofocus />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.taxId" label="NIT" variant="underlined" density="comfortable"
                                prepend-inner-icon="mdi-card-account-details" clearable hide-details="auto" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.email" label="Correo electrónico" type="email"
                                variant="underlined" density="comfortable" :rules="[rules.email]"
                                prepend-inner-icon="mdi-email-outline" clearable hide-details="auto" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.phone" label="Teléfono" variant="underlined"
                                density="comfortable" prepend-inner-icon="mdi-phone" clearable hide-details="auto" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.address" label="Dirección" variant="underlined"
                                density="comfortable" prepend-inner-icon="mdi-map-marker" clearable
                                hide-details="auto" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-switch v-model="form.isActive" label="Estado" inset color="primary" :true-value="true"
                                :false-value="false"
                                :prepend-icon="form.isActive ? 'mdi-check-circle' : 'mdi-close-circle'" hide-details>
                                <template #label>
                                    <span :class="form.isActive ? 'text-green' : 'text-red'">
                                        {{ form.isActive ? "Activo" : "Inactivo" }}
                                    </span>
                                </template>
                            </v-switch>
                        </v-col>

                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="px-6 py-4">
                <v-spacer />
                <v-btn variant="text" @click="close" :disabled="submitting">
                    Cancelar
                </v-btn>
                <v-btn color="primary" :loading="submitting" @click="submitForm">
                    {{ supplier ? "Actualizar" : "Guardar" }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{
    isOpen: boolean;
    supplier?: {
        id: number;
        name: string;
        taxId?: string;
        email?: string;
        phone?: string;
        address?: string;
        isActive: boolean;
    } | null;
}>();

const emit = defineEmits<{
    (e: "update:isOpen", v: boolean): void;
    (e: "save", payload: any): void;
    (e: "updateSupplier", payload: any): void;
}>();

const internalOpen = ref(props.isOpen);
watch(() => props.isOpen, (v) => (internalOpen.value = v));
watch(internalOpen, (v) => emit("update:isOpen", v));

const formRef = ref();
const submitting = ref(false);

const form = ref({
    name: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    isActive: true,
});

const rules = {
    required: (v: any) =>
        (v !== null && v !== undefined && String(v).trim().length > 0) ||
        "Requerido",
    email: (v: string) =>
        !v || /^\S+@\S+\.\S+$/.test(String(v)) || "Correo inválido",
};

watch(
    () => props.supplier,
    async (val) => {
        if (val) {
            // modo editar
            form.value = {
                name: val.name,
                taxId: val.taxId || "",
                email: val.email || "",
                phone: val.phone || "",
                address: val.address || "",
                isActive: val.isActive,
            };
        } else {
            // modo crear
            form.value = {
                name: "",
                taxId: "",
                email: "",
                phone: "",
                address: "",
                isActive: true,
            };
        }
        await nextTick();
        formRef.value?.resetValidation?.();
    },
    { immediate: true }
);

const close = () => (internalOpen.value = false);

const submitForm = async () => {
    if (!formRef.value) return;
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    submitting.value = true;
    try {
        if (props.supplier) {
            emit("updateSupplier", {
                id: props.supplier.id,
                ...form.value,
            });
        } else {
            emit("save", { ...form.value });
        }
        close();
    } finally {
        submitting.value = false;
    }
};
</script>
