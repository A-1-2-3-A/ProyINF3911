<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios.js';

const authStore = useAuthStore();
const todosLosTemasAsignados = ref([]);
const isLoading = ref(true);

const busqueda = ref('');
const gestionSeleccionada = ref('actual');


async function fetchTemasAsignados() {
    // Nos aseguramos de tener el ID del usuario logueado.
    const idTribunal = authStore.usuario?.id;
    if (!idTribunal) {
        isLoading.value = false;
        console.error("No se pudo obtener el ID del tribunal logueado.");
        return;
    }

    isLoading.value = true;
    try {
        const response = await apiClient.get(`/asignaciones/tribunal/${idTribunal}`);

        // Procesamos la respuesta para añadir la propiedad 'gestion' que necesita la UI.
        todosLosTemasAsignados.value = response.data.data.map(tema => {
            const fechaAsignacion = tema.fecha_asignacion || new Date().toISOString();
            const gestion = `${new Date(fechaAsignacion).getFullYear()}-${new Date(fechaAsignacion).getMonth() < 6 ? 'I' : 'II'}`;
            return {
                ...tema,
                gestion: gestion
            };
        });

    } catch (error) {
        console.error("Error al obtener los temas asignados:", error);
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTemasAsignados);

// Calcula las gestiones disponibles a partir de los temas cargados.
const gestionesDisponibles = computed(() => {
    const gestiones = new Set(todosLosTemasAsignados.value.map(t => t.gestion));
    // Usamos un sort para ordenar las gestiones de más reciente a más antigua.
    return ['actual', ...Array.from(gestiones).sort((a, b) => b.localeCompare(a))];
});

// Filtra los temas según la gestión seleccionada y la búsqueda.
const temasFiltrados = computed(() => {
    let temasPorGestion = [];

    if (gestionSeleccionada.value === 'actual') {
        const estadosActuales = ['EN REVISION', 'REVISADO'];
        temasPorGestion = todosLosTemasAsignados.value.filter(t => estadosActuales.includes(t.estado_tema));
    } else {
        temasPorGestion = todosLosTemasAsignados.value.filter(t => t.gestion === gestionSeleccionada.value);
    }

    const criterio = busqueda.value.trim().toLowerCase();
    if (!criterio) return temasPorGestion;

    return temasPorGestion.filter(t =>
        t.nombreTema.toLowerCase().includes(criterio) ||
        (t.nombreEstudiante && t.nombreEstudiante.toLowerCase().includes(criterio))
    );
});

// Devuelve una clase de CSS para el estado del tema.
const getEstadoClass = (estado) => {
    if (!estado) return 'text-bg-secondary';
    switch (estado) { // La API devuelve los estados en mayúscula
        case 'APROBADO': return 'text-bg-success';
        case 'REPROBADO': return 'text-bg-danger';
        case 'REVISADO': return 'text-bg-warning text-dark';
        case 'EN REVISION': return 'text-bg-info';
        default: return 'text-bg-secondary'; // Para 'PENDIENTE'
    }
}
</script>

<template>
    <section class="container-fluid mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Temas Asignados</h2>
        </div>

        <div class="row mb-4 align-items-center">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Buscar en la gestión seleccionada..."
                        v-model="busqueda" />
                </div>
            </div>
            <div class="col-md-4 d-flex justify-content-end">
                <div class="d-flex align-items-center">
                    <label for="gestionSelect" class="form-label mb-0 me-2 fw-semibold text-nowrap">Ver Gestión:</label>
                    <select id="gestionSelect" class="form-select w-auto" v-model="gestionSeleccionada">
                        <option v-for="g in gestionesDisponibles" :key="g" :value="g">
                            {{ g === 'actual' ? 'En Curso' : g }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div v-if="isLoading" class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando temas asignados...</p>
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th class="ps-4" style="width: 50%;">Tema / Estudiante</th>
                                <th class="text-center">Mi Veredicto Actual</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tema in temasFiltrados" :key="tema.idAsignacion">
                                <td class="ps-4">
                                    <p class="fw-semibold mb-1">{{ tema.nombreTema }}</p>
                                    <p class="text-muted mb-0 small">{{ tema.nombreEstudiante }}</p>
                                </td>
                                <td class="text-center">
                                    <span class="badge rounded-pill" :class="getEstadoClass(tema.mi_veredicto)">
                                        {{ tema.mi_veredicto || 'PENDIENTE' }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <router-link :to="{ name: 'TTemaGestionView', params: { id: tema.idTema } }"
                                        class="btn btn-sm btn-outline-primary" title="Revisar tema">
                                        <i class="bi bi-journal-check me-1"></i> Revisar Tema
                                    </router-link>
                                </td>
                            </tr>
                            <tr v-if="!isLoading && temasFiltrados.length === 0">
                                <td colspan="3" class="text-center text-muted p-4">No hay temas para mostrar en esta
                                    gestión.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>