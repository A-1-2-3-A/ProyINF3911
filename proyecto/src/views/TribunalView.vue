<script setup>
import { ref, computed, onMounted} from 'vue'
import apiClient from '@/api/axios.js'

const busqueda = ref('')
const tribunales = ref([])
const isLoading = ref(true)

// Función para obtener los tribunales directamente de la API.
async function fetchTribunales() {
    isLoading.value = true
    try {
        // Se llama al endpoint público GET /public/tribunales.
        // Este endpoint ya devuelve solo los usuarios correctos (Tribunal y Director).
        const response = await apiClient.get('/public/tribunales')
        tribunales.value = response.data.data
    } catch (error) {
        console.error("Error al obtener los tribunales:", error)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchTribunales)

// Filtra directamente sobre la lista 'tribunales'
// que contiene los datos de la API.
const tribunalesFiltrados = computed(() => {
    if (!busqueda.value.trim()) {
        return tribunales.value;
    }
    const criterio = busqueda.value.trim().toLowerCase();
    return tribunales.value.filter(tribunal =>
        `${tribunal.nombres} ${tribunal.apellido_primero} ${tribunal.apellido_segundo}`.toLowerCase().includes(criterio) ||
        (tribunal.especialidades && tribunal.especialidades.toLowerCase().includes(criterio))
    );
});
</script>

<template>
    <section class="container-fluid mt-4" style="max-width: 960px;">
        <!-- Encabezado de la página con TÍTULO CORREGIDO Y CENTRADO -->
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Tribunales</h2>
        </div>

        <!-- Barra de Búsqueda -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="input-group">
                    <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control bg-light border-0" placeholder="Buscar por nombre, apellido o especialidad..." v-model="busqueda" />
                </div>
            </div>
        </div>

        <!-- Tabla de tribunales con estilo mejorado -->
        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr class="text-center">
                                <th class="ps-4 text-start" style="width: 50%;">Nombre Completo</th>
                                <th class="text-center" style="width: 50%;">Especialidades</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tribunal in tribunalesFiltrados" :key="tribunal.idUsuario">
                                <td class="ps-4">
                                    <p class="mb-0 fw-medium">{{ tribunal.apellido_primero }} {{ tribunal.apellido_segundo }}, {{ tribunal.nombres }}</p>
                                </td>
                                <td class="text-center">
                                    <div class="d-flex flex-wrap justify-content-center gap-2">
                                        <template v-if="tribunal.especialidades">
                                            <span v-for="especialidad in tribunal.especialidades.split(', ')" :key="especialidad"
                                                class="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2 fw-medium">
                                                {{ especialidad }}
                                            </span>
                                        </template>
                                        <span v-else class="text-muted small">No asignadas</span>
                                    </div>
                                </td>
                            </tr>
                             <tr v-if="tribunalesFiltrados.length === 0">
                                <td colspan="2" class="text-center text-muted p-5">
                                    <i class="bi bi-search-heart fs-1"></i>
                                    <p class="mt-2 mb-0">No se encontraron tribunales con ese criterio.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>