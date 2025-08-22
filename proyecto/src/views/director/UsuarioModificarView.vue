<script setup>
import { ref, onMounted, computed } from 'vue';
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

        // Se formatea la fecha de nacimiento al formato YYYY-MM-DD
        if (usuario.value && usuario.value.fecha_nacimiento) {
            const fecha = new Date(usuario.value.fecha_nacimiento);
            const anio = fecha.getFullYear();
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const dia = fecha.getDate().toString().padStart(2, '0');
            usuario.value.fecha_nacimiento = `${anio}-${mes}-${dia}`;
        }

        if (usuario.value && !Array.isArray(usuario.value.especialidades)) {
            usuario.value.especialidades = [];
        }

    } catch (error) {
        console.error("Error al obtener los datos para modificar:", error);
        modalStore.showModal({
            title: 'Error',
            message: 'No se pudieron cargar los datos del usuario.',
            type: 'error'
        });
        usuario.value = null;
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchData);

function validarFormulario() {
    errores.value = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    // Validación de Nombres
    if (!usuario.value.nombres.trim()) {
        errores.value.nombres = 'El nombre es obligatorio.';
    } else if (usuario.value.nombres.startsWith(' ')) {
        errores.value.nombres = 'El nombre no puede empezar con espacios.';
    } else if (!nameRegex.test(usuario.value.nombres)) {
        errores.value.nombres = 'El nombre solo puede contener letras y espacios.';
    }

    // Validación de Primer Apellido
    if (!usuario.value.apellido_primero.trim()) {
        errores.value.apellido_primero = 'El primer apellido es obligatorio.';
    } else if (usuario.value.apellido_primero.startsWith(' ')) {
        errores.value.apellido_primero = 'El apellido no puede empezar con espacios.';
    } else if (!nameRegex.test(usuario.value.apellido_primero)) {
        errores.value.apellido_primero = 'El apellido solo puede contener letras y espacios.';
    }

    // Validación de Segundo Apellido
    if (usuario.value.apellido_segundo && !nameRegex.test(usuario.value.apellido_segundo)) {
        errores.value.apellido_segundo = 'El apellido solo puede contener letras y espacios.';
    }
    if (usuario.value.apellido_segundo && usuario.value.apellido_segundo.startsWith(' ')) {
        errores.value.apellido_segundo = 'El apellido no puede empezar con espacios.';
    }

    // Validación de Fecha de Nacimiento
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
        modalStore.showModal({
            title: 'Éxito',
            message: 'Usuario actualizado correctamente.',
            type: 'success'
        });
        router.push({ name: 'DUsuarioView' });
    } catch (error) {
        const mensajeError = error.response?.data?.message || 'Ocurrió un error al actualizar el usuario.';
        modalStore.showModal({
            title: 'Error de Actualización',
            message: mensajeError,
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

const puedeCambiarRol = computed(() => {
    if (!usuario.value) return false;
    // El Director puede cambiar el rol si es Director o Tribunal.
    return ['Director', 'Tribunal'].includes(usuario.value.rol);
});
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando datos del usuario...</p>
        </div>

        <form v-else-if="usuario" @submit.prevent="guardarCambios" class="w-100"
            style="max-width: 600px; margin: auto;">
            <div class="card shadow-sm mb-4">
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
                        <div v-if="errores.apellido_primero" class="invalid-feedback">{{ errores.apellido_primero }}
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Segundo Apellido</label>
                        <input type="text" v-model="usuario.apellido_segundo" class="form-control"
                            :class="{ 'is-invalid': errores.apellido_segundo }" />
                        <div v-if="errores.apellido_segundo" class="invalid-feedback">{{ errores.apellido_segundo }}
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correo Electrónico</label>
                        <input type="email" :value="usuario.usuario" class="form-control" disabled readonly />
                    </div>

                    <div class="mb-3">
                        <label for="fechaNacimiento" class="form-label">Fecha de Nacimiento</label>
                        <input id="fechaNacimiento" type="date" v-model="usuario.fecha_nacimiento" class="form-control"
                            :class="{ 'is-invalid': errores.fecha_nacimiento }" />
                        <div v-if="errores.fecha_nacimiento" class="invalid-feedback">{{ errores.fecha_nacimiento }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Rol</label>
                        <select v-model="usuario.rol" class="form-select" :disabled="!puedeCambiarRol">
                            <option v-if="usuario.rol === 'Director' || usuario.rol === 'Tribunal'" value="Director">
                                Director</option>
                            <option v-if="usuario.rol === 'Director' || usuario.rol === 'Tribunal'" value="Tribunal">
                                Tribunal</option>
                            <option v-if="usuario.rol === 'Secretario'" value="Secretario">Secretario</option>
                            <option v-if="usuario.rol === 'Estudiante'" value="Estudiante">Estudiante</option>
                        </select>
                        <small v-if="!puedeCambiarRol" class="form-text text-muted">El rol no se puede
                            modificar.</small>
                    </div>

                    <div v-if="usuario.rol === 'Director' || usuario.rol === 'Tribunal'" class="mb-3">
                        <label class="form-label">Especialidades</label>
                        <div class="border rounded p-2 bg-light">
                            <div v-for="esp in especialidadesDisponibles" :key="esp.id" class="form-check">
                                <input class="form-check-input" type="checkbox" :value="esp.id"
                                    v-model="usuario.especialidades" :id="`esp-${esp.id}`">
                                <label class="form-check-label" :for="`esp-${esp.id}`">{{ esp.nombre_especialidad
                                    }}</label>
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
                        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <span v-else>Guardar Cambios</span>
                    </button>
                </div>
            </div>
        </form>

        <div v-else-if="!isLoading" class="alert alert-danger text-center">
            No se pudo encontrar al usuario para modificar.
        </div>
    </section>
</template>