<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const busqueda = ref('');
const misTemas = ref([]);
const isLoading = ref(true);
const modalStore = useModalStore();

async function fetchMisTemas() {
    isLoading.value = true;
    try {
        // Hacemos una única llamada. El backend ya sabe qué estudiante está logueado
        // gracias al token y nos devolverá solo sus temas.
        const response = await apiClient.get('/temas');
        misTemas.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener los temas del estudiante:", error);
        modalStore.showModal({
            title: 'Error',
            message: 'No se pudieron cargar tus temas.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchMisTemas);

const temasFiltrados = computed(() => {
    if (!busqueda.value.trim()) {
        return misTemas.value;
    }
    const criterio = busqueda.value.trim().toLowerCase();
    // La API devuelve 'estado_tema', así que filtramos por esa propiedad.
    return misTemas.value.filter(t =>
        t.nombre.toLowerCase().includes(criterio) ||
        t.estado_tema.toLowerCase().includes(criterio)
    );
});

// Función para obtener una clase de color para cada estado.
const getEstadoClass = (estado) => {
    if (!estado) return 'text-bg-secondary';
    switch (estado) { // La API devuelve los estados en mayúscula.
        case 'APROBADO': return 'text-bg-success';
        case 'REPROBADO': return 'text-bg-danger';
        case 'REVISADO': return 'text-bg-warning';
        case 'EN REVISION': return 'text-bg-info';
        case 'PRELIMINAR': return 'text-bg-primary';
        default: return 'text-bg-secondary';
    }
}
</script>

<template>
    <section class="container-fluid mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Mis Temas de Grado</h2>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Buscar por nombre de tema o estado..."
                        v-model="busqueda" />
                </div>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div v-if="isLoading" class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando tus temas...</p>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th class="ps-4" style="width: 70%;">Nombre del Tema</th>
                                <th class="text-center">Estado</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tema in temasFiltrados" :key="tema.idTema">
                                <td class="ps-4 fw-semibold">{{ tema.nombre }}</td>
                                <td class="text-center">
                                    <span class="badge rounded-pill" :class="getEstadoClass(tema.estado)">
                                        {{ tema.estado }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <router-link :to="{ name: 'ETemaGestionView', params: { id: tema.idTema } }"
                                        class="btn btn-sm btn-outline-primary" title="Ver gestión del tema">
                                        <i class="bi bi-clipboard2-data-fill me-1"></i> Gestionar
                                    </router-link>
                                </td>
                            </tr>
                            <tr v-if="!isLoading && temasFiltrados.length === 0">
                                <td colspan="3" class="text-center text-muted p-4">No has registrado ningún tema.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>