<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal.js';

const route = useRoute();
const router = useRouter();
const modalStore = useModalStore();
const idUsuario = route.params.id;

const usuario = ref(null);
const isLoading = ref(true);
const especialidadesDisponibles = ref([]);
const errores = ref({});

async function fetchData() {
    isLoading.value = true;
    try {
        const [resUsuario, resEspecialidades] = await Promise.all([
            apiClient.get(`/usuarios/${idUsuario}`),
            apiClient.get('/especialidades')
        ]);

        usuario.value = resUsuario.data.data;

        // --- INICIO DE LA CORRECCIÓN ---
        // Se verifica si el usuario tiene una fecha de nacimiento.
        if (usuario.value && usuario.value.fecha_nacimiento) {
            // Se convierte la fecha recibida de la API al formato YYYY-MM-DD.
            const fecha = new Date(usuario.value.fecha_nacimiento);
            const anio = fecha.getFullYear();
            // getMonth() es base 0 (Enero=0), por eso se suma 1. Se asegura que tenga 2 dígitos.
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            // Se asegura que el día tenga 2 dígitos.
            const dia = fecha.getDate().toString().padStart(2, '0');

            // Se asigna la fecha formateada de vuelta al modelo.
            usuario.value.fecha_nacimiento = `${anio}-${mes}-${dia}`;
        }
        // --- FIN DE LA CORRECCIÓN ---

        if (usuario.value && !Array.isArray(usuario.value.especialidades)) {
            usuario.value.especialidades = [];
        }

    } catch (error) {
        console.error("Error al obtener los datos:", error);
        modalStore.showModal({ title: 'Error', message: 'No se pudieron cargar los datos del usuario.', type: 'error' });
        usuario.value = null;
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchData);

function validarFormulario() {
    errores.value = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!usuario.value.nombres.trim()) {
        errores.value.nombres = 'El nombre es obligatorio.';
    } else if (usuario.value.nombres.startsWith(' ')) {
        errores.value.nombres = 'El nombre no puede empezar con espacios.';
    } else if (!nameRegex.test(usuario.value.nombres)) {
        errores.value.nombres = 'El nombre solo puede contener letras y espacios.';
    }

    if (!usuario.value.apellido_primero.trim()) {
        errores.value.apellido_primero = 'El primer apellido es obligatorio.';
    } else if (usuario.value.apellido_primero.startsWith(' ')) {
        errores.value.apellido_primero = 'El apellido no puede empezar con espacios.';
    } else if (!nameRegex.test(usuario.value.apellido_primero)) {
        errores.value.apellido_primero = 'El apellido solo puede contener letras y espacios.';
    }

    if (usuario.value.apellido_segundo && !nameRegex.test(usuario.value.apellido_segundo)) {
        errores.value.apellido_segundo = 'El apellido solo puede contener letras y espacios.';
    }
    if (usuario.value.apellido_segundo && usuario.value.apellido_segundo.startsWith(' ')) {
        errores.value.apellido_segundo = 'El apellido no puede empezar con espacios.';
    }

    if (usuario.value.fecha_nacimiento) {
        const hoy = new Date();
        const fechaNac = new Date(usuario.value.fecha_nacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        if (edad < 5 || edad > 125) {
            errores.value.fecha_nacimiento = 'La edad debe estar entre 5 y 125 años.';
        }
    }

    return Object.keys(errores.value).length === 0;
}

async function guardarCambios() {
    if (!usuario.value) return;

    if (!validarFormulario()) {
        modalStore.showModal({
            title: 'Datos Inválidos',
            message: 'Por favor, corrija los errores marcados en el formulario.',
            type: 'error'
        });
        return;
    }

    isLoading.value = true;
    try {
        await apiClient.put(`/usuarios/${idUsuario}`, usuario.value);
        modalStore.showModal({ title: 'Éxito', message: 'Usuario actualizado correctamente.', type: 'success' });
        router.push({ name: 'SUsuarioView' });
    } catch (error) {
        const mensajeError = error.response?.data?.message || 'Ocurrió un error al actualizar el usuario.';
        modalStore.showModal({ title: 'Error', message: mensajeError, type: 'error' });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando datos...</p>
        </div>

        <form v-else-if="usuario" @submit.prevent="guardarCambios" class="card shadow-sm w-100"
            style="max-width: 600px; margin: auto;">
            <div class="card-header bg-primary text-white fw-bold text-center">
                Modificar Usuario: {{ usuario.nombres }} {{ usuario.apellido_primero }}
            </div>
            <div class="card-body p-4">
                <div class="mb-3">
                    <label class="form-label">Nombres</label>
                    <input type="text" v-model="usuario.nombres" class="form-control"
                        :class="{ 'is-invalid': errores.nombres }" required />
                    <div v-if="errores.nombres" class="invalid-feedback">{{ errores.nombres }}</div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Primer Apellido</label>
                    <input type="text" v-model="usuario.apellido_primero" class="form-control"
                        :class="{ 'is-invalid': errores.apellido_primero }" required />
                    <div v-if="errores.apellido_primero" class="invalid-feedback">{{ errores.apellido_primero }}</div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Segundo Apellido</label>
                    <input type="text" v-model="usuario.apellido_segundo" class="form-control"
                        :class="{ 'is-invalid': errores.apellido_segundo }" />
                    <div v-if="errores.apellido_segundo" class="invalid-feedback">{{ errores.apellido_segundo }}</div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Correo Electrónico</label>
                    <input type="email" :value="usuario.usuario" class="form-control" disabled readonly />
                    <small class="form-text text-muted">El correo electrónico no se puede modificar.</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Fecha de Nacimiento</label>
                    <input type="date" v-model="usuario.fecha_nacimiento" class="form-control"
                        :class="{ 'is-invalid': errores.fecha_nacimiento }" />
                    <div v-if="errores.fecha_nacimiento" class="invalid-feedback">{{ errores.fecha_nacimiento }}</div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Rol</label>
                    <input type="text" :value="usuario.rol" class="form-control" disabled readonly />
                    <small class="form-text text-muted">El rol de un usuario no puede ser modificado por el
                        secretario.</small>
                </div>

                <div v-if="usuario.rol === 'Tribunal'" class="mb-3">
                    <label class="form-label">Especialidades</label>
                    <div class="border rounded p-2 bg-light">
                        <div v-for="esp in especialidadesDisponibles" :key="esp.id" class="form-check">
                            <input class="form-check-input" type="checkbox" :value="esp.id"
                                v-model="usuario.especialidades" :id="`esp-${esp.id}`">
                            <label class="form-check-label" :for="`esp-${esp.id}`">{{ esp.nombre_especialidad }}</label>
                        </div>
                    </div>
                </div>
                <div v-if="usuario.rol === 'Estudiante'" class="mb-3">
                    <label class="form-label">Tipo de Estudiante</label>
                    <select v-model="usuario.tipo_estudiante" class="form-select" required>
                        <option value="REGULAR">Regular</option>
                        <option value="EGRESADO">Egresado</option>
                    </select>
                </div>
            </div>
            <div class="card-footer text-center bg-light">
                <button type="submit" class="btn btn-success px-5" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
                    <span>Guardar Cambios</span>
                </button>
            </div>
        </form>

        <div v-else class="alert alert-danger text-center">
            No se encontraron los datos del usuario.
        </div>
    </section>
</template>