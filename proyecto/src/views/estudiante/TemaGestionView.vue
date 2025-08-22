<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

// --- Inicialización ---
const route = useRoute();
const modalStore = useModalStore();
const temaId = parseInt(route.params.id);

// --- STATE ---
const tema = ref(null);
const isLoading = ref(true);

// --- LÓGICA DE CONEXIÓN A LA API ---
async function fetchTemaDetalle() {
    isLoading.value = true;
    try {
        // Hacemos una única llamada a la API que ya nos devuelve los datos estructurados.
        const response = await apiClient.get(`/temas/${temaId}`);
        tema.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener el detalle del tema:", error);
        modalStore.showModal({ title: 'Error', message: 'No se pudo cargar la información del tema.' });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTemaDetalle);


// --- FUNCIONES AUXILIARES PARA LA VISTA ---
const getVeredictoInfo = (veredicto) => {
    // Si el veredicto es nulo o pendiente, se trata como 'PENDIENTE'.
    const veredictoActual = veredicto || 'PENDIENTE';
    switch (veredictoActual) {
        case 'APROBADO':
            return { clase: 'bg-success text-white', texto: 'Revisión completada' };
        case 'REPROBADO':
            return { clase: 'bg-danger text-white', texto: 'Revisión completada' };
        case 'REVISADO':
            return { clase: 'bg-warning text-dark', texto: 'Requiere tu acción' };
        default: // PENDIENTE
            return { clase: 'bg-secondary text-white', texto: 'Pendiente de revisión' };
    }
}
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando gestión del tema...</p>
        </div>

        <div v-else-if="tema">
            <h2 class="fw-bold text-center mb-2">Gestión del Tema</h2>
            <p class="text-center text-muted fs-5 mb-4">{{ tema.nombre }}</p>

            <div class="card shadow-sm mb-4">
                <div class="card-body text-center">
                    <h5 class="card-title">Estado General</h5>
                    <span :class="['badge', 'fs-6', 'px-3', 'py-2', getVeredictoInfo(tema.estado_tema).clase]">
                        {{ tema.estado_tema }}
                    </span>
                </div>
            </div>

            <div class="card shadow-sm">
                <div class="card-header fw-bold bg-dark text-white">
                    Estado de Revisión por Tribunal
                </div>
                <ul class="list-group list-group-flush">
                    <li v-for="tribunal in tema.revisionesPorTribunal" :key="tribunal.idTribunal"
                        class="list-group-item d-flex justify-content-between align-items-center flex-wrap p-3">

                        <div class="fw-semibold">
                            {{ tribunal.nombreCompleto }}
                        </div>

                        <div class="d-flex align-items-center gap-3 mt-2 mt-md-0">
                            <span :class="['badge', getVeredictoInfo(tribunal.veredictoActual).clase]">
                                {{ tribunal.veredictoActual || 'PENDIENTE' }}
                            </span>
                            <span class="text-muted fst-italic small">
                                {{ getVeredictoInfo(tribunal.veredictoActual).texto }}
                            </span>
                            <router-link
                                :to="{ name: 'ETemaTribunalView', params: { temaId: temaId, id: tribunal.idTribunal } }"
                                class="btn btn-sm btn-outline-primary">
                                Ver / Gestionar
                            </router-link>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else-if="!isLoading" class="alert alert-danger">
            No se encontró el tema solicitado.
        </div>
    </section>
</template>