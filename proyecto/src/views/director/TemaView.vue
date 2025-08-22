<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/axios.js';

const busqueda = ref('');
const temas = ref([]); // El array se llenará con los datos de la API.
const isLoading = ref(true);

async function fetchTemas() {
    isLoading.value = true;
    try {
        // Se llama al endpoint que, para un admin, ya trae el nombre del estudiante.
        const response = await apiClient.get('/temas');
        temas.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener temas:", error);
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTemas);

// La propiedad 'temasConDetalles' ya no es necesaria, porque la API nos da el 'nombreEstudiante'.
// 'temasFiltrados' ahora trabaja directamente sobre los datos de la API.
const temasFiltrados = computed(() => {
    if (!busqueda.value.trim()) {
        return temas.value;
    }
    const criterio = busqueda.value.trim().toLowerCase();
    return temas.value.filter(t =>
        t.nombre.toLowerCase().includes(criterio) ||
        t.estado.toLowerCase().includes(criterio) ||
        (t.nombreEstudiante && t.nombreEstudiante.toLowerCase().includes(criterio))
    );
});

// Función para obtener una clase de color para el estado del tema.
const getEstadoClass = (estado) => {
    if (!estado) return 'text-bg-secondary';
    switch (estado.toLowerCase()) {
        case 'aprobado': return 'text-bg-success';
        case 'reprobado': return 'text-bg-danger';
        case 'revisado': return 'text-bg-warning';
        case 'en revision': return 'text-bg-info';
        case 'preliminar': return 'text-bg-primary'; // Se cambió 'pendiente' por 'preliminar'
        default: return 'text-bg-secondary';
    }
}
</script>

<template>
    <section class="container-fluid mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Gestión de Temas</h2>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control"
                        placeholder="Buscar por nombre de tema, estudiante o estado..." v-model="busqueda" />
                </div>
            </div>
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
                                    <router-link :to="{ name: 'DTemaDetalleView', params: { id: tema.idTema } }"
                                        class="btn btn-sm btn-outline-primary" title="Ver detalle del tema">
                                        <i class="bi bi-eye-fill me-1"></i> Ver Detalle
                                    </router-link>
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