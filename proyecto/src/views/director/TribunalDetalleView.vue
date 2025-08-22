<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/axios.js';

const route = useRoute();
const tribunalId = route.params.id;

// Estados para los datos
const tribunal = ref(null);
const temasAsignados = ref([]);
const isLoading = ref(true);

// Cargar los datos del tribunal y sus temas asignados desde la API.
async function fetchData() {
    isLoading.value = true;
    try {
        // Usamos Promise.all para realizar ambas llamadas a la API en paralelo.
        const [tribunalResponse, temasResponse] = await Promise.all([
            apiClient.get(`/usuarios/${tribunalId}`),
            apiClient.get(`/asignaciones/tribunal/${tribunalId}`)
        ]);

        tribunal.value = tribunalResponse.data.data;
        temasAsignados.value = temasResponse.data.data;

    } catch (error) {
        console.error("Error al obtener el detalle del tribunal:", error);
        tribunal.value = null; // Para que la plantilla muestre el error
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchData);

// Formateador de fecha para que se vea bien
const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
};

const getVeredictoClass = (veredicto) => {
    if (!veredicto) return 'bg-secondary';
    switch (veredicto) {
        case 'APROBADO': return 'bg-success';
        case 'REPROBADO': return 'bg-danger';
        case 'REVISADO': return 'bg-warning text-dark';
        default: return 'bg-secondary'; // Para 'PENDIENTE'
    }
};
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando detalles del tribunal...</p>
        </div>

        <div v-else-if="tribunal">
            <h2 class="fw-bold mb-4 text-center">Detalle del Tribunal</h2>

            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white fw-bold">Información del Docente</div>
                <div class="card-body px-4 py-3">
                    <p><strong>Nombre:</strong> {{ tribunal.nombres }} {{ tribunal.apellido_primero }} {{
                        tribunal.apellido_segundo }}</p>
                    <p><strong>Correo:</strong> {{ tribunal.usuario }}</p>
                    <p><strong>Rol:</strong> {{ tribunal.rol }}</p>
                </div>
            </div>

            <div class="card shadow">
                <div class="card-header bg-secondary text-white fw-bold">Temas Asignados</div>
                <div class="card-body px-4 py-3">
                    <div v-if="temasAsignados.length > 0" class="table-responsive">
                        <table class="table table-bordered table-striped align-middle">
                            <thead class="table-dark text-center">
                                <tr>
                                    <th>Nombre del Tema</th>
                                    <th>Estudiante Responsable</th>
                                    <th>Veredicto Emitido</th>
                                    <th>Fecha del Veredicto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="tema in temasAsignados" :key="tema.idAsignacion" class="text-center">
                                    <td>{{ tema.nombreTema }}</td>
                                    <td>{{ tema.nombreEstudiante }}</td>
                                    <td><span class="badge" :class="getVeredictoClass(tema.mi_veredicto)">{{
                                        tema.mi_veredicto || 'PENDIENTE' }}</span></td>
                                    <td>{{ formatearFecha(tema.fecha_veredicto) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center text-muted p-4">
                        Este tribunal no tiene temas asignados actualmente.
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!isLoading" class="alert alert-danger text-center">
            No se pudo encontrar la información del tribunal solicitado.
        </div>
    </section>
</template>