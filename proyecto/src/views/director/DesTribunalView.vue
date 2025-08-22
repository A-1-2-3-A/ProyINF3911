<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const router = useRouter();
const modalStore = useModalStore();

const isLoading = ref(true);
const temaSeleccionadoId = ref(null);
const tribunalSeleccionados = ref([]);
const textoBusqueda = ref('');

const temasDisponibles = ref([]);
const todosLosTribunales = ref([]);

// Cargar los datos necesarios (temas y tribunales) desde la API.
async function fetchData() {
    isLoading.value = true;
    try {
        const [temasResponse, tribunalesResponse] = await Promise.all([
            apiClient.get('/temas'),
            apiClient.get('/public/tribunales')
        ]);

        // Filtramos los temas para mostrar solo los que se pueden asignar.
        temasDisponibles.value = temasResponse.data.data.filter(t => t.estado === 'PRELIMINAR');
        todosLosTribunales.value = tribunalesResponse.data.data;

    } catch (error) {
        console.error("Error al cargar datos para designación:", error);
        modalStore.showModal({
            title: 'Error de Red',
            message: 'No se pudieron cargar los datos necesarios para la asignación.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchData);


// Lógica para enviar la designación a la API.
async function designarTribunales() {
    if (!temaSeleccionadoId.value || tribunalSeleccionados.value.length !== 3) {
        modalStore.showModal({
            title: 'Error de Validación',
            message: 'Debe seleccionar un tema y exactamente 3 tribunales.',
            type: 'error'
        });
        return;
    }

    try {
        await apiClient.post('/asignaciones', {
            id_tema: temaSeleccionadoId.value,
            ids_tribunales: tribunalSeleccionados.value
        });

        modalStore.showModal({
            title: 'Designación Exitosa',
            message: 'Los tribunales han sido asignados correctamente al tema.',
            type: 'success'
        });

        // Redirigimos a la vista de temas para ver el cambio de estado.
        router.push({ name: 'DTemaView' });

    } catch (error) {
        modalStore.showModal({
            title: 'Error en Designación',
            message: error.response?.data?.message || 'No se pudo completar la asignación.',
            type: 'error'
        });
    }
}

// Filtra la lista de tribunales según la búsqueda del usuario.
const tribunalesFiltrados = computed(() => {
    if (!textoBusqueda.value.trim()) {
        return todosLosTribunales.value;
    }
    const criterio = textoBusqueda.value.toLowerCase();
    return todosLosTribunales.value.filter(t =>
        `${t.nombres} ${t.apellido_primero} ${t.segundo_apellido}`.toLowerCase().includes(criterio)
    );
});

// Limpia la selección de tribunales si cambia el tema (sin cambios).
watch(temaSeleccionadoId, () => {
    tribunalSeleccionados.value = [];
});

// Lógica para seleccionar/deseleccionar un tribunal (sin cambios).
function toggleTribunal(id) {
    const index = tribunalSeleccionados.value.indexOf(id);
    if (index > -1) {
        tribunalSeleccionados.value.splice(index, 1);
    } else if (tribunalSeleccionados.value.length < 3) {
        tribunalSeleccionados.value.push(id);
    }
}
</script>

<template>
    <section class="container mt-4">
        <h2 class="fw-bold mb-4 text-center">Designación de Tribunales</h2>

        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando datos...</p>
        </div>

        <div v-else class="card shadow-sm">
            <div class="card-body p-4">
                <div class="mb-4">
                    <label for="temaSelect" class="form-label fw-semibold">Seleccione un tema pendiente de
                        asignación:</label>
                    <select id="temaSelect" class="form-select" v-model="temaSeleccionadoId">
                        <option :value="null" disabled>-- Elija un tema --</option>
                        <option v-for="t in temasDisponibles" :key="t.idTema" :value="t.idTema">
                            {{ t.nombre }}
                        </option>
                    </select>
                    <div v-if="!temasDisponibles.length" class="form-text text-muted">
                        No hay temas en estado 'PRELIMINAR' para asignar.
                    </div>
                </div>

                <div class="mb-4">
                    <label for="buscarTribunal" class="form-label fw-semibold">Seleccione 3 tribunales:</label>
                    <input id="buscarTribunal" type="text" v-model="textoBusqueda"
                        placeholder="Buscar tribunal por nombre o apellido..." class="form-control mb-2" />

                    <div class="list-group tribunal-list">
                        <div v-for="t in tribunalesFiltrados" :key="t.id"
                            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            :class="{ 'active': tribunalSeleccionados.includes(t.id) }" @click="toggleTribunal(t.id)">

                            <div>
                                <span class="fw-semibold">{{ t.apellido_primero }} {{ t.apellido_segundo }},</span> {{
                                t.nombres }}
                                <br>
                                <small class="text-muted">Especialidades: {{ t.especialidades || 'No definidas'
                                    }}</small>

                                <br>
                                <span class="fw-bold small">Temas Asignados:
                                    <span class="badge bg-info rounded-pill">{{ t.temas_asignados }}</span>
                                </span>
                            </div>

                            <div class="text-end">
                                <i v-if="tribunalSeleccionados.includes(t.id)"
                                    class="bi bi-check-circle-fill fs-4 text-white"></i>
                            </div>
                        </div>
                        <div v-if="!tribunalesFiltrados.length" class="list-group-item text-muted text-center">
                            No se encontraron tribunales.
                        </div>
                    </div>
                    <small class="text-muted mt-1 d-block text-end">Seleccionados: {{ tribunalSeleccionados.length }} /
                        3</small>
                </div>

                <div class="text-center mt-4">
                    <button class="btn btn-primary px-5" @click="designarTribunales"
                        :disabled="!temaSeleccionadoId || tribunalSeleccionados.length !== 3">
                        Designar
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.tribunal-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: .375rem;
}

.list-group-item-action {
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
}

.list-group-item.active {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
}

.list-group-item.active .text-muted {
    color: rgba(255, 255, 255, 0.75) !important;
}
</style>