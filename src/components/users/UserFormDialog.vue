<template>
    <v-dialog v-model="internalOpen" max-width="520">
        <v-card rounded="xl" elevation="2">
            <v-card-title class="text-h6 font-weight-bold py-4 px-6">
                {{ props.user ? "Editar Usuario" : "Nuevo Usuario" }}
            </v-card-title>
            <v-divider />
            <v-card-text class="px-8 pt-8 pb-0">
                <v-form ref="formRef" autocomplete="off" @submit.prevent="submitForm">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="form.username" label="Nombre de usuario" variant="underlined"
                                density="comfortable" :rules="[rules.required]" prepend-inner-icon="mdi-account"
                                clearable hide-details="auto" autofocus />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="form.email" label="Correo electrónico" type="email"
                                variant="underlined" density="comfortable" :rules="[rules.required, rules.email]"
                                prepend-inner-icon="mdi-email-outline" clearable hide-details="auto" />
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="form.roleId" :items="roles" item-title="name" item-value="id" label="Rol"
                                variant="underlined" density="comfortable" :rules="[rules.required]"
                                prepend-inner-icon="mdi-shield-account" hide-details="auto" />
                        </v-col>
                        <!-- Password solo en modo CREAR -->
                        <v-col cols="12">
                            <v-text-field v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                label="Contraseña (dejar vacío para no cambiar)" variant="underlined"
                                density="comfortable" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showPassword = !showPassword" prepend-inner-icon="mdi-lock-outline"
                                hide-details="auto" autocomplete="new-password" />
                        </v-col>

                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions class="px-6 py-4">
                <v-spacer />
                <v-btn variant="text" @click="close" :disabled="submitting">Cancelar</v-btn>
                <v-btn color="primary" :loading="submitting" @click="submitForm">
                    {{ props.user ? "Actualizar" : "Guardar" }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

type Role = { id: number; name: string };

const props = defineProps<{
    isOpen: boolean;
    roles: Role[];
    user?: { id: number; username: string; email: string; roleId: number } | null;
}>();

const emit = defineEmits<{
    (e: "update:isOpen", v: boolean): void;
    (e: "save", payload: { username: string; email: string; roleId: number | null; password: string }): void;
    (e: "updateUser", payload: { id: number; username: string; email: string; roleId: number | null; password?: string }): void;
}>();


const internalOpen = ref(props.isOpen);
watch(() => props.isOpen, v => internalOpen.value = v);

watch(internalOpen, async v => {
    emit("update:isOpen", v);
    if (v) {
        if (props.user) {
            // precargar datos en modo EDITAR
            form.value = {
                username: props.user.username,
                email: props.user.email,
                roleId: props.user.roleId,
                password: "",
            };
        } else {
            // resetear en modo CREAR
            form.value = { username: "", email: "", roleId: null, password: "" };
        }
        await nextTick();
        formRef.value?.resetValidation?.();
    }
});

const formRef = ref();
const submitting = ref(false);
const showPassword = ref(false);

const form = ref({
    username: "",
    email: "",
    roleId: null as number | null,
    password: "",
});

const rules = {
    required: (v: any) => (v !== null && v !== undefined && String(v).trim().length > 0) || "Requerido",
    email: (v: string) => /^\S+@\S+\.\S+$/.test(String(v)) || "Correo inválido",
    min6: (v: string) => String(v).length >= 6 || "Mínimo 6 caracteres",
};

const close = () => internalOpen.value = false;

const submitForm = async () => {
    if (!formRef.value) return;
    const { valid } = await formRef.value.validate();
    if (!valid) return;
    submitting.value = true;
    try {
        if (props.user) {
            // editar
            emit("updateUser", {
                id: props.user.id,
                username: form.value.username.trim(),
                email: form.value.email.trim(),
                roleId: form.value.roleId,
                password: form.value.password || undefined
            });

        } else {
            // crear
            emit("save", {
                username: form.value.username.trim(),
                email: form.value.email.trim(),
                roleId: form.value.roleId,
                password: form.value.password,
            });
        }
        close();
    } finally {
        submitting.value = false;
    }
};
</script>
