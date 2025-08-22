<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const modalStore = useModalStore();
const especialidades = ref([]);
const isLoading = ref(true);

// Se añade el estado para la barra de búsqueda.
const busqueda = ref('');

const showModal = ref(false);
const modoEdicion = ref(false);
const especialidadActual = ref({
    id: null,
    nombre_especialidad: ''
});
const erroresFormulario = ref({});

async function fetchEspecialidades() {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/especialidades');
        especialidades.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener las especialidades:", error);
        modalStore.showModal({ title: 'Error', message: 'No se pudieron cargar las especialidades.', type: 'error' });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchEspecialidades);

function abrirModalParaAgregar() {
    modoEdicion.value = false;
    especialidadActual.value = { id: null, nombre_especialidad: '' };
    erroresFormulario.value = {};
    showModal.value = true;
}

function abrirModalParaEditar(especialidad) {
    modoEdicion.value = true;
    especialidadActual.value = { ...especialidad };
    erroresFormulario.value = {};
    showModal.value = true;
}

function cerrarModal() {
    showModal.value = false;
}

async function guardarEspecialidad() {
    if (!especialidadActual.value.nombre_especialidad.trim()) {
        erroresFormulario.value.nombre = 'El nombre no puede estar vacío.';
        return;
    }
    erroresFormulario.value = {};

    try {
        if (modoEdicion.value) {
            await apiClient.put(`/especialidades/${especialidadActual.value.id}`, especialidadActual.value);
            modalStore.showModal({ title: 'Éxito', message: 'Especialidad actualizada correctamente.', type: 'success' });
        } else {
            await apiClient.post('/especialidades', especialidadActual.value);
            modalStore.showModal({ title: 'Éxito', message: 'Especialidad agregada correctamente.', type: 'success' });
        }
        cerrarModal();
        fetchEspecialidades();
    } catch (error) {
        const mensaje = error.response?.data?.message || 'Ocurrió un error al guardar.';
        modalStore.showModal({ title: 'Error', message: mensaje, type: 'error' });
    }
}

async function eliminarEspecialidad(id) {
    if (window.confirm('¿Está seguro de que desea eliminar esta especialidad?')) {
        try {
            await apiClient.delete(`/especialidades/${id}`);
            modalStore.showModal({ title: 'Éxito', message: 'Especialidad eliminada correctamente.', type: 'success' });
            fetchEspecialidades();
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Ocurrió un error al eliminar.';
            modalStore.showModal({ title: 'Error', message: mensaje, type: 'error' });
        }
    }
}

const tituloModal = computed(() => {
    return modoEdicion.value ? 'Editar Especialidad' : 'Agregar Nueva Especialidad';
});

// Propiedad computada para filtrar las especialidades según la búsqueda.
const especialidadesFiltradas = computed(() => {
    if (!busqueda.value.trim()) {
        return especialidades.value;
    }
    const criterio = busqueda.value.trim().toLowerCase();
    return especialidades.value.filter(esp =>
        esp.nombre_especialidad.toLowerCase().includes(criterio)
    );
});
</script>

<template>
    <section class="container mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Gestionar Especialidades</h2>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="input-group" style="max-width: 400px;">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar por nombre..." v-model="busqueda" />
            </div>
            <button @click="abrirModalParaAgregar" class="btn btn-primary d-flex align-items-center">
                <i class="bi bi-plus-circle me-2"></i> Agregar Nueva
            </button>
        </div>
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando especialidades...</p>
        </div>

        <div v-else class="card shadow-sm">
            <div class="table-responsive">
                <table class="table table-striped table-hover mb-0 align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th class="ps-4">Nombre de la Especialidad</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="especialidadesFiltradas.length === 0">
                            <td colspan="2" class="text-center text-muted p-4">No se encontraron especialidades.</td>
                        </tr>
                        <tr v-for="esp in especialidadesFiltradas" :key="esp.id">
                            <td class="ps-4">{{ esp.nombre_especialidad }}</td>
                            <td class="text-center">
                                <div class="btn-group" role="group">
                                    <button @click="abrirModalParaEditar(esp)" class="btn btn-sm btn-outline-primary"
                                        title="Editar">
                                        <i class="bi bi-pencil-fill"></i>
                                    </button>
                                    <button @click="eliminarEspecialidad(esp.id)" class="btn btn-sm btn-outline-danger"
                                        title="Eliminar">
                                        <i class="bi bi-trash-fill"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ tituloModal }}</h5>
                        <button type="button" class="btn-close" @click="cerrarModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="guardarEspecialidad">
                            <div class="mb-3">
                                <label for="nombreEspecialidad" class="form-label">Nombre</label>
                                <input id="nombreEspecialidad" type="text"
                                    v-model="especialidadActual.nombre_especialidad" class="form-control"
                                    :class="{ 'is-invalid': erroresFormulario.nombre }" required>
                                <div v-if="erroresFormulario.nombre" class="invalid-feedback">
                                    {{ erroresFormulario.nombre }}
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
                        <button type="button" class="btn btn-primary" @click="guardarEspecialidad">Guardar
                            Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.modal {
    display: block;
}
</style>