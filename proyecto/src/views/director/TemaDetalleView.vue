<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const route = useRoute();
const modalStore = useModalStore();
const temaId = parseInt(route.params.id);

const tema = ref(null);
const isLoading = ref(true);
const historialVisiblePara = ref(null);

async function fetchTemaDetalle() {
    isLoading.value = true;
    try {
        const response = await apiClient.get(`/temas/${temaId}`);
        tema.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener el detalle del tema:", error);
        modalStore.showModal({
            title: 'Error',
            message: 'No se pudo cargar el detalle del tema.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTemaDetalle);

async function descargarArchivo(idVersion, nombreArchivo) {
    try {
        // Llama a la nueva ruta segura para administradores
        const response = await apiClient.get(`/archivos/tema-version/admin/${idVersion}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', nombreArchivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        modalStore.showModal({
            title: 'Error de Descarga',
            message: 'No se pudo descargar el archivo. Verifique que exista en el servidor.',
            type: 'error'
        });
    }
}

function toggleHistorial(idTribunal) {
    historialVisiblePara.value = historialVisiblePara.value === idTribunal ? null : idTribunal;
}

const getVeredictoClass = (veredicto) => {
    if (!veredicto) return 'bg-secondary';
    switch (veredicto) {
        case 'APROBADO': return 'bg-success';
        case 'REPROBADO': return 'bg-danger';
        case 'REVISADO': return 'bg-warning text-dark';
        default: return 'bg-secondary';
    }
};

const formatearFecha = (fecha) => {
    if (!fecha) return '---';
    return new Date(fecha).toLocaleDateString('es-ES');
};
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando detalles del tema...</p>
        </div>

        <div v-else-if="tema">
            <h2 class="fw-bold text-center mb-4">Detalle y Seguimiento del Tema</h2>

            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title fw-bold">{{ tema.nombre }}</h5>
                            <p class="card-text text-muted mb-0">Estudiante: {{ tema.estudiante.nombreCompleto }}</p>
                        </div>
                        <div class="col-md-4 text-md-end mt-3 mt-md-0">
                            <h6 class="text-muted mb-1">Estado General del Tema</h6>
                            <span class="badge fs-6 px-3 py-2" :class="getVeredictoClass(tema.estado_tema)">{{
                                tema.estado_tema }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow-sm">
                <div class="card-header fw-bold bg-dark text-white">Monitoreo de Revisiones por Tribunal</div>
                <div class="table-responsive">
                    <table class="table table-striped table-hover mb-0">
                        <thead class="text-center">
                            <tr>
                                <th>Tribunal</th>
                                <th>Último Veredicto</th>
                                <th>Fecha</th>
                                <th>Trazabilidad</th>
                            </tr>
                        </thead>
                        <tbody class="text-center align-middle">
                            <template v-for="revision in tema.revisionesPorTribunal" :key="revision.idTribunal">
                                <tr>
                                    <td>{{ revision.nombreCompleto }}</td>
                                    <td><span class="badge" :class="getVeredictoClass(revision.veredictoActual)">{{
                                        revision.veredictoActual || 'PENDIENTE' }}</span></td>
                                    <td>{{ formatearFecha(revision.fechaUltimoVeredicto) }}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-info"
                                            @click="toggleHistorial(revision.idTribunal)">
                                            <i class="bi bi-clock-history"></i> Ver Historial
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="historialVisiblePara === revision.idTribunal">
                                    <td colspan="4" class="p-3 bg-light">
                                        <h6 class="fw-bold">Historial de Revisiones para {{ revision.nombreCompleto }}:
                                        </h6>
                                        <ul class="list-group">
                                            <li v-for="h in revision.historialCompleto" :key="h.version"
                                                class="list-group-item">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Versión #{{ h.version }}:</strong> Veredicto de "{{
                                                            h.veredicto }}"
                                                        <br>
                                                        <small class="text-muted">
                                                            {{ h.veredicto === 'PENDIENTE' ? 'Archivo Enviado:' :
                                                                'Archivo Revisado:' }}
                                                            <a href="#"
                                                                @click.prevent="descargarArchivo(h.id, h.documentoEstudiante.nombre)"
                                                                class="file-download-link">
                                                                {{ h.documentoEstudiante.nombre }}
                                                            </a>
                                                        </small>
                                                    </div>
                                                    <span class="text-muted">{{ formatearFecha(h.fecha_veredicto)
                                                        }}</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-else-if="!isLoading" class="alert alert-danger text-center">
            No se pudo encontrar el tema solicitado.
        </div>
    </section>
</template>

<style scoped>
/* Estilo para el enlace de descarga personalizado */
.file-download-link {
    color: inherit;
    /* Hereda el color de .text-muted */
    text-decoration: none;
    /* Sin subrayado por defecto */
    cursor: pointer;
    font-weight: 500;
    /* Ligeramente más grueso para destacar */
    transition: color 0.2s;
}

.file-download-link:hover {
    color: #0d6efd;
    /* Cambia a color primario al pasar el mouse */
    text-decoration: underline;
    /* Subrayado solo en hover */
}
</style>