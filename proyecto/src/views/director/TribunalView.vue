<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/axios.js';

const busqueda = ref('');
const tribunales = ref([]);
const isLoading = ref(true);

async function fetchTribunales() {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/public/tribunales');
        tribunales.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener los tribunales:", error);
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTribunales);

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
    <section class="container-fluid mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Gestión de Tribunales</h2>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="input-group" style="max-width: 400px;">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar por nombre, apellido o especialidad..."
                    v-model="busqueda" />
            </div>
            <router-link :to="{ name: 'DDesTribunalView' }" class="btn btn-primary d-flex align-items-center">
                <i class="bi bi-people-fill me-2"></i> Designar Tribunales
            </router-link>
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div v-if="isLoading" class="text-center p-5">
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-dark">
                            <tr class="text-center">
                                <th>Nombre Completo</th>
                                <th>Especialidades</th>
                                <th>Temas Asignados</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tribunal in tribunalesFiltrados" :key="tribunal.id">
                                <td class="text-start ps-4">
                                    {{ tribunal.apellido_primero }} {{ tribunal.apellido_segundo }}, {{ tribunal.nombres
                                    }}
                                </td>
                                <td>
                                    <div class="d-flex flex-wrap justify-content-center gap-2">
                                        <template v-if="tribunal.especialidades">
                                            <span v-for="especialidad in tribunal.especialidades.split(', ')"
                                                :key="especialidad"
                                                class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-2 py-1">
                                                {{ especialidad }}
                                            </span>
                                        </template>
                                        <span v-else class="text-muted small">No asignadas</span>
                                    </div>
                                </td>
                                <td class="text-center fw-bold">
                                    {{ tribunal.temas_asignados }}
                                </td>
                                <td class="text-center">
                                    <router-link :to="{ name: 'DTribunalDetalleView', params: { id: tribunal.id } }"
                                        class="btn btn-sm btn-outline-info" title="Ver detalle del tribunal">
                                        <i class="bi bi-eye-fill"></i> Ver Detalle
                                    </router-link>
                                </td>
                            </tr>
                            <tr v-if="!isLoading && tribunalesFiltrados.length === 0">
                                <td colspan="4" class="text-center text-muted p-4">No se encontraron tribunales.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>