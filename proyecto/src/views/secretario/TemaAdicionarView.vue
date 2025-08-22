<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const router = useRouter();
const modalStore = useModalStore();

const nombre = ref('');
const estudianteSeleccionado = ref(null);
const archivo = ref(null);
const fechaRegistro = ref('');

// Estado para el selector de estudiantes
const textoEstudiante = ref('');
const todosLosEstudiantes = ref([]);
const mostrarOpciones = ref(false);
const isLoading = ref(false);

async function fetchEstudiantes() {
    try {
        const response = await apiClient.get('/usuarios');
        todosLosEstudiantes.value = response.data.data.filter(u => u.rol === 'Estudiante');
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

onMounted(() => {
    const ahora = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    fechaRegistro.value = ahora.toLocaleDateString('es-ES', options);
    fetchEstudiantes();
});

async function registrarTema() {
    if (!nombre.value || !estudianteSeleccionado.value || !archivo.value) {
        modalStore.showModal({
            title: 'Datos Incompletos',
            message: 'El nombre del tema, el estudiante y el archivo PDF son requeridos.',
            type: 'error'
        });
        return;
    }

    isLoading.value = true;
    const formData = new FormData();
    formData.append('nombre', nombre.value);
    formData.append('id_estudiante', estudianteSeleccionado.value.id);
    formData.append('archivo', archivo.value);

    try {
        await apiClient.post('/temas', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        modalStore.showModal({
            title: 'Éxito',
            message: 'El nuevo tema ha sido registrado correctamente.',
            type: 'success'
        });
        router.push({ name: 'STemaView' });
    } catch (error) {
        modalStore.showModal({
            title: 'Error de Registro',
            message: error.response?.data?.message || 'No se pudo registrar el tema.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

const estudiantesFiltrados = computed(() => {
    if (!textoEstudiante.value) return [];
    const criterio = textoEstudiante.value.trim().toLowerCase();
    return todosLosEstudiantes.value.filter(e =>
        `${e.nombres} ${e.apellido_primero} ${e.apellido_segundo || ''}`.toLowerCase().includes(criterio)
    );
});

function seleccionarEstudiante(estudiante) {
    estudianteSeleccionado.value = estudiante;
    textoEstudiante.value = `${estudiante.apellido_primero} ${estudiante.apellido_segundo || ''}, ${estudiante.nombres}`;
    mostrarOpciones.value = false;
}

// Limpia la selección actual para permitir buscar de nuevo.
function limpiarSeleccion() {
    estudianteSeleccionado.value = null;
    textoEstudiante.value = '';
}

function ocultarOpcionesConDelay() {
    setTimeout(() => { mostrarOpciones.value = false; }, 200);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        archivo.value = file;
    } else {
        modalStore.showModal({ title: 'Archivo no válido', message: 'Por favor, seleccione un archivo PDF.', type: 'warning' });
        event.target.value = '';
        archivo.value = null;
    }
}
</script>

<template>
    <section class="container mt-4">
        <form @submit.prevent="registrarTema" class="card shadow-sm w-100" style="max-width: 600px; margin: auto;">
            <div class="card-header bg-primary text-white fw-bold text-center">
                Registrar Nuevo Tema
            </div>
            <div class="card-body p-4">
                <div class="mb-3">
                    <label class="form-label">Nombre del Tema</label>
                    <input type="text" v-model="nombre" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label class="form-label">Seleccione Estudiante</label>
                    <div v-if="!estudianteSeleccionado" class="position-relative">
                        <input type="text" class="form-control" v-model="textoEstudiante"
                            placeholder="Escriba para buscar..." @focus="mostrarOpciones = true"
                            @blur="ocultarOpcionesConDelay" required />
                        <ul v-if="mostrarOpciones && estudiantesFiltrados.length"
                            class="list-group position-absolute w-100"
                            style="z-index: 10; max-height: 200px; overflow-y: auto;">
                            <li v-for="e in estudiantesFiltrados" :key="e.id"
                                class="list-group-item list-group-item-action" style="cursor: pointer"
                                @mousedown.prevent="seleccionarEstudiante(e)">
                                {{ e.apellido_primero }} {{ e.apellido_segundo || '' }}, {{ e.nombres }}
                            </li>
                        </ul>
                    </div>
                    <div v-else class="seleccion-confirmada">
                        <span>
                            <i class="bi bi-person-check-fill me-2"></i>
                            {{ textoEstudiante }}
                        </span>
                        <button type="button" class="btn btn-sm btn-outline-danger" @click="limpiarSeleccion">
                            Cambiar
                        </button>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="fileUpload" class="form-label">Archivo del Tema (PDF)</label>
                    <div class="input-group">
                        <input type="file" class="form-control" @change="handleFileUpload" accept=".pdf" id="fileUpload"
                            required>
                    </div>
                    <small v-if="archivo" class="d-block text-success mt-1">Archivo seleccionado: {{ archivo.name
                        }}</small>
                </div>

                <div class="row align-items-center">
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-muted">Estado del Tema</label>
                        <div class="form-control-plaintext-custom">
                            <span class="badge text-bg-secondary">PRELIMINAR</span>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label text-muted">Fecha de Registro</label>
                        <div class="form-control-plaintext-custom">
                            <i class="bi bi-calendar-event me-2"></i>{{ fechaRegistro }}
                        </div>
                    </div>
                </div>

                <div class="text-center mt-4 border-top pt-4">
                    <button type="submit" class="btn btn-success px-5" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <span v-else>Registrar Tema</span>
                    </button>
                </div>
            </div>
        </form>
    </section>
</template>

<style scoped>
.form-control-plaintext-custom {
    padding: 0.5rem 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: .375rem;
    background-color: #f8f9fa;
    font-size: 1rem;
    font-weight: 500;
    color: #212529;
}

.seleccion-confirmada {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.55rem 0.75rem;
    background-color: #e9ecef;
    /* Color gris claro neutral */
    border: 1px solid #ced4da;
    border-radius: .375rem;
    color: #212529;
    font-weight: 500;
}

.seleccion-confirmada i {
    color: #198754;
}
</style>