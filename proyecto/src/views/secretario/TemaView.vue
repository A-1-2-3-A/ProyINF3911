<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const busqueda = ref('');
const temas = ref([]);
const isLoading = ref(true);
const modalStore = useModalStore();

// Cargar la lista de temas desde la API.
async function fetchTemas() {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/temas');
        temas.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener temas:", error);
        modalStore.showModal({ title: 'Error', message: 'No se pudieron cargar los temas.' });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTemas);

// Conectar la función de eliminar a la API.
async function eliminarTema(idTema) {
    // Usamos el confirm del navegador para una confirmación simple y rápida.
    if (!confirm('¿Está seguro de que desea eliminar este tema? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        await apiClient.delete(`/temas/${idTema}`);

        // Si la eliminación en la API es exitosa, removemos el tema de nuestra lista local
        // para que la UI se actualice al instante, sin necesidad de recargar todo.
        temas.value = temas.value.filter(t => t.idTema !== idTema);

        modalStore.showModal({
            title: 'Éxito',
            message: 'Tema eliminado correctamente.',
            type: 'success'
        });

    } catch (error) {
        // El backend devuelve un error 403 si se intenta eliminar un tema que no está en estado 'PRELIMINAR'.
        const message = error.response?.status === 403
            ? 'Solo se pueden eliminar temas en estado PRELIMINAR.'
            : 'No se pudo eliminar el tema.';
        modalStore.showModal({ title: 'Error', message, type: 'error' });
    }
}

const temasFiltrados = computed(() => {
    if (!busqueda.value.trim()) return temas.value;
    const criterio = busqueda.value.trim().toLowerCase();
    return temas.value.filter(t =>
        t.nombre.toLowerCase().includes(criterio) ||
        t.estado.toLowerCase().includes(criterio) ||
        (t.nombreEstudiante && t.nombreEstudiante.toLowerCase().includes(criterio))
    );
});

const getEstadoClass = (estado) => {
    if (!estado) return 'text-bg-secondary';
    switch (estado.toLowerCase()) {
        case 'aprobado': return 'text-bg-success';
        case 'reprobado': return 'text-bg-danger';
        case 'revisado': return 'text-bg-warning';
        case 'en revision': return 'text-bg-info';
        case 'preliminar': return 'text-bg-primary';
        default: return 'text-bg-secondary';
    }
}
</script>

<template>
    <section class="container-fluid mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Gestión de Temas</h2>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="input-group" style="max-width: 400px;">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar por nombre de tema, estudiante o estado..."
                    v-model="busqueda" />
            </div>
            <router-link :to="{ name: 'STemaAdicionarView' }" class="btn btn-primary d-flex align-items-center">
                <i class="bi bi-file-earmark-plus-fill me-2"></i> Añadir Tema
            </router-link>
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div v-if="isLoading" class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando temas...</p>
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th class="ps-4" style="width: 50%;">Tema / Estudiante</th>
                                <th class="text-center">Estado</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tema in temasFiltrados" :key="tema.idTema">
                                <td class="ps-4">
                                    <p class="fw-semibold mb-1">{{ tema.nombre }}</p>
                                    <p class="text-muted mb-0 small">{{ tema.nombreEstudiante }}</p>
                                </td>
                                <td class="text-center">
                                    <span class="badge rounded-pill" :class="getEstadoClass(tema.estado)">
                                        {{ tema.estado }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <div v-if="tema.estado === 'PRELIMINAR'" class="btn-group">
                                        <router-link :to="{ name: 'STemaModificarView', params: { id: tema.idTema } }"
                                            class="btn btn-sm btn-outline-primary" title="Modificar">
                                            <i class="bi bi-pencil-fill"></i>
                                        </router-link>
                                        <button @click="eliminarTema(tema.idTema)" class="btn btn-sm btn-outline-danger"
                                            title="Eliminar">
                                            <i class="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                    <span v-else class="text-muted fst-italic">--</span>
                                </td>
                            </tr>
                            <tr v-if="!isLoading && temasFiltrados.length === 0">
                                <td colspan="3" class="text-center text-muted p-4">No se encontraron temas.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>