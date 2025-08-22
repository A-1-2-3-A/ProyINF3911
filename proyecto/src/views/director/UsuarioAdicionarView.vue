<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios';
import { useModalStore } from '@/stores/modal';

const router = useRouter();
const modalStore = useModalStore();

const nuevoUsuario = ref({
    nombres: '',
    apellido_primero: '',
    apellido_segundo: '',
    usuario: '', // Correo electrónico
    clave: '',
    fecha_nacimiento: '',
    rol: '',
    tipo_estudiante: null,
    especialidades: []
});
const repetirClave = ref('');
const isLoading = ref(false);
const especialidadesDisponibles = ref([]);

// --- INICIO: CORRECCIÓN ---
// 1. Estado reactivo para almacenar los errores de validación.
const errores = ref({});
// --- FIN: CORRECCIÓN ---

async function fetchEspecialidades() {
    try {
        const response = await apiClient.get('/especialidades');
        especialidadesDisponibles.value = response.data.data;
    } catch (error) {
        console.error('Error al obtener las especialidades:', error);
        modalStore.showModal({
            title: 'Error de Red',
            message: 'No se pudieron cargar las especialidades disponibles.',
            type: 'error'
        });
    }
}

onMounted(fetchEspecialidades);

// --- INICIO: CORRECCIÓN ---
// 2. Función de validación centralizada.
function validarFormulario() {
    errores.value = {}; // Limpiar errores previos

    // Regex para nombres y apellidos (letras y espacios)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    // Validación de Nombres
    if (!nuevoUsuario.value.nombres.trim()) {
        errores.value.nombres = 'El nombre es obligatorio.';
    } else if (nuevoUsuario.value.nombres.startsWith(' ')) {
        errores.value.nombres = 'El nombre no puede empezar con espacios.';
    } else if (!nameRegex.test(nuevoUsuario.value.nombres)) {
        errores.value.nombres = 'El nombre solo puede contener letras y espacios.';
    }

    // Validación de Primer Apellido
    if (!nuevoUsuario.value.apellido_primero.trim()) {
        errores.value.apellido_primero = 'El primer apellido es obligatorio.';
    } else if (nuevoUsuario.value.apellido_primero.startsWith(' ')) {
        errores.value.apellido_primero = 'El apellido no puede empezar con espacios.';
    } else if (!nameRegex.test(nuevoUsuario.value.apellido_primero)) {
        errores.value.apellido_primero = 'El apellido solo puede contener letras y espacios.';
    }

    // Validación de Segundo Apellido (opcional, pero si existe se valida)
    if (nuevoUsuario.value.apellido_segundo && !nameRegex.test(nuevoUsuario.value.apellido_segundo)) {
        errores.value.apellido_segundo = 'El apellido solo puede contener letras y espacios.';
    }
    if (nuevoUsuario.value.apellido_segundo && nuevoUsuario.value.apellido_segundo.startsWith(' ')) {
        errores.value.apellido_segundo = 'El apellido no puede empezar con espacios.';
    }

    // Validación de Correo
    if (!nuevoUsuario.value.usuario) {
        errores.value.usuario = 'El correo electrónico es obligatorio.';
    }

    // Validación de Contraseña
    if (!nuevoUsuario.value.clave) {
        errores.value.clave = 'La contraseña es obligatoria.';
    } else {
        if (nuevoUsuario.value.clave.length < 8) {
            errores.value.clave = 'La contraseña debe tener al menos 8 caracteres.';
        } else if (!/[a-zA-Z]/.test(nuevoUsuario.value.clave)) {
            errores.value.clave = 'Debe contener al menos una letra.';
        } else if (!/\d/.test(nuevoUsuario.value.clave)) {
            errores.value.clave = 'Debe contener al menos un número.';
        }
    }

    // Validación de Repetir Contraseña
    if (nuevoUsuario.value.clave !== repetirClave.value) {
        errores.value.repetirClave = 'Las contraseñas no coinciden.';
    }

    // Validación de Fecha de Nacimiento
    if (nuevoUsuario.value.fecha_nacimiento) {
        const hoy = new Date();
        const fechaNac = new Date(nuevoUsuario.value.fecha_nacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        if (edad < 5 || edad > 125) {
            errores.value.fecha_nacimiento = 'La edad debe estar entre 5 y 125 años.';
        }
    }

    // Validación de Rol
    if (!nuevoUsuario.value.rol) {
        errores.value.rol = 'Debe seleccionar un rol.';
    }

    // Retorna true si no hay errores, false si los hay.
    return Object.keys(errores.value).length === 0;
}
// --- FIN: CORRECCIÓN ---


async function agregarUsuario() {
    // --- INICIO: CORRECCIÓN ---
    // 3. Se integra la validación al inicio de la función de guardado.
    if (!validarFormulario()) {
        modalStore.showModal({
            title: 'Datos Inválidos',
            message: 'Por favor, corrija los errores marcados en el formulario.',
            type: 'error'
        });
        return; // Detiene la ejecución si hay errores.
    }
    // --- FIN: CORRECCIÓN ---

    isLoading.value = true;

    try {
        await apiClient.post('/usuarios', nuevoUsuario.value);
        modalStore.showModal({
            title: 'Éxito',
            message: 'Usuario agregado correctamente.',
            type: 'success'
        });
        router.push({ name: 'DUsuarioView' });
    } catch (error) {
        const mensajeError = error.response?.data?.message || 'Ocurrió un error al crear el usuario.';
        modalStore.showModal({
            title: 'Error de Creación',
            message: mensajeError,
            type: 'error'
        });
        console.error("Error al agregar usuario:", error);
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <section class="container mt-4">
        <form @submit.prevent="agregarUsuario" class="card shadow-sm w-100" style="max-width: 600px; margin: auto;">
            <div class="card-header bg-primary text-white fw-bold text-center">
                Agregar Nuevo Usuario
            </div>
            <div class="card-body p-4">
                <div class="mb-3">
                    <label for="nombres" class="form-label">Nombres</label>
                    <input id="nombres" type="text" v-model="nuevoUsuario.nombres" class="form-control"
                        :class="{ 'is-invalid': errores.nombres }" />
                    <div v-if="errores.nombres" class="invalid-feedback">{{ errores.nombres }}</div>
                </div>
                <div class="mb-3">
                    <label for="primerApellido" class="form-label">Primer Apellido</label>
                    <input id="primerApellido" type="text" v-model="nuevoUsuario.apellido_primero" class="form-control"
                        :class="{ 'is-invalid': errores.apellido_primero }" />
                    <div v-if="errores.apellido_primero" class="invalid-feedback">{{ errores.apellido_primero }}</div>
                </div>
                <div class="mb-3">
                    <label for="segundoApellido" class="form-label">Segundo Apellido</label>
                    <input id="segundoApellido" type="text" v-model="nuevoUsuario.apellido_segundo" class="form-control"
                        :class="{ 'is-invalid': errores.apellido_segundo }" />
                    <div v-if="errores.apellido_segundo" class="invalid-feedback">{{ errores.apellido_segundo }}</div>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Correo Electrónico</label>
                    <input id="email" type="email" v-model="nuevoUsuario.usuario" class="form-control"
                        placeholder="usuario@sistemas.edu.bo" :class="{ 'is-invalid': errores.usuario }" />
                    <div v-if="errores.usuario" class="invalid-feedback">{{ errores.usuario }}</div>
                </div>
                <div class="mb-3">
                    <label for="clave" class="form-label">Contraseña</label>
                    <input id="clave" type="password" v-model="nuevoUsuario.clave" class="form-control"
                        :class="{ 'is-invalid': errores.clave }" />
                    <div v-if="errores.clave" class="invalid-feedback">{{ errores.clave }}</div>
                </div>
                <div class="mb-3">
                    <label for="repetirClave" class="form-label">Repetir Contraseña</label>
                    <input id="repetirClave" type="password" v-model="repetirClave" class="form-control"
                        :class="{ 'is-invalid': errores.repetirClave }" />
                    <div v-if="errores.repetirClave" class="invalid-feedback">{{ errores.repetirClave }}</div>
                </div>

                <div class="mb-3">
                    <label for="fechaNacimiento" class="form-label">Fecha de Nacimiento</label>
                    <input id="fechaNacimiento" type="date" v-model="nuevoUsuario.fecha_nacimiento" class="form-control"
                        :class="{ 'is-invalid': errores.fecha_nacimiento }" />
                    <div v-if="errores.fecha_nacimiento" class="invalid-feedback">{{ errores.fecha_nacimiento }}</div>
                </div>

                <div class="mb-3">
                    <label for="rol" class="form-label">Rol</label>
                    <select id="rol" v-model="nuevoUsuario.rol" class="form-select"
                        :class="{ 'is-invalid': errores.rol }">
                        <option value="" disabled>Seleccione un rol</option>
                        <option value="Tribunal">Tribunal</option>
                        <option value="Secretario">Secretario</option>
                        <option value="Estudiante">Estudiante</option>
                    </select>
                    <div v-if="errores.rol" class="invalid-feedback">{{ errores.rol }}</div>
                </div>

                <div v-if="nuevoUsuario.rol === 'Tribunal' || nuevoUsuario.rol === 'Director'" class="mb-3">
                    <label class="form-label">Especialidades</label>
                    <div class="border rounded p-2 bg-light">
                        <div v-for="esp in especialidadesDisponibles" :key="esp.id" class="form-check">
                            <input class="form-check-input" type="checkbox" :value="esp.id"
                                v-model="nuevoUsuario.especialidades" :id="`esp-${esp.id}`">
                            <label class="form-check-label" :for="`esp-${esp.id}`">{{ esp.nombre_especialidad }}</label>
                        </div>
                        <div v-if="!especialidadesDisponibles.length" class="text-muted small">
                            Cargando especialidades...
                        </div>
                    </div>
                </div>
                <div v-if="nuevoUsuario.rol === 'Estudiante'" class="mb-3">
                    <label class="form-label">Tipo de Estudiante</label>
                    <select v-model="nuevoUsuario.tipo_estudiante" class="form-select" required>
                        <option value="" disabled>Seleccione tipo</option>
                        <option value="REGULAR">Regular</option>
                        <option value="EGRESADO">Egresado</option>
                    </select>
                </div>
                <div class="text-center mt-4">
                    <button type="submit" class="btn btn-success px-5" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <span v-else>Guardar Usuario</span>
                    </button>
                </div>
            </div>
        </form>
    </section>
</template>