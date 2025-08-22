<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import apiClient from '@/api/axios.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const modalStore = useModalStore();
const temaId = parseInt(route.params.id);

const tema = ref(null);
const isLoading = ref(true);

const revisionSeleccionadaId = ref(null);
const listaComentarios = ref([]);
const listaArchivosRetro = ref([]);

// Formulario
const nuevoComentario = ref('');
const archivoRetroalimentacion = ref(null); // Archivo seleccionado para adjuntar al veredicto
const nuevoVeredicto = ref('');
const nuevasObservaciones = ref('');

const miAsignacion = computed(() => {
    if (!tema.value) return null;
    const idTribunalLogueado = authStore.usuario?.id;
    return tema.value.revisionesPorTribunal.find(r => r.idTribunal === idTribunalLogueado);
});

const revisionVisualizada = computed(() => {
    if (!miAsignacion.value || !revisionSeleccionadaId.value) return null;
    return miAsignacion.value.historialCompleto.find(h => h.id === revisionSeleccionadaId.value);
});

// La lógica ahora es más simple y correcta. Un tribunal puede revisar si
// la versión que está viendo actualmente tiene el estado 'PENDIENTE'.
const puedeRevisar = computed(() => {
    return revisionVisualizada.value && revisionVisualizada.value.veredicto === 'PENDIENTE';
});

async function fetchTemaDetalle() {
    isLoading.value = true;
    try {
        const response = await apiClient.get(`/temas/${temaId}`);
        tema.value = response.data.data;
        if (miAsignacion.value && miAsignacion.value.historialCompleto.length > 0) {
            const ultimaRevision = miAsignacion.value.historialCompleto[miAsignacion.value.historialCompleto.length - 1];
            revisionSeleccionadaId.value = ultimaRevision.id;
        }
    } catch (error) {
        console.error("Error al obtener el detalle del tema:", error);
    } finally {
        isLoading.value = false;
    }
}

async function fetchRetroalimentacion(idVersionTema) {
    if (!idVersionTema || !miAsignacion.value) return;
    try {
        const response = await apiClient.get(`/retroalimentaciones/${miAsignacion.value.idAsignacion}?id_version_tema=${idVersionTema}`);
        listaComentarios.value = response.data.data.comentarios;
        listaArchivosRetro.value = response.data.data.archivos;
    } catch (error) {
        console.error("Error al obtener la retroalimentación:", error);
    }
}

async function enviarComentario() {
    if (!nuevoComentario.value.trim() || !revisionVisualizada.value) return;
    try {
        await apiClient.post(`/retroalimentaciones/comentario/${miAsignacion.value.idAsignacion}`, {
            id_version_tema: revisionVisualizada.value.id,
            texto_comentario: nuevoComentario.value
        });
        nuevoComentario.value = '';
        fetchRetroalimentacion(revisionVisualizada.value.id);
    } catch (error) {
        modalStore.showModal({ title: 'Error', message: 'No se pudo enviar el comentario.', type: 'error' });
    }
}

function handleFileUpload(event) {
    archivoRetroalimentacion.value = event.target.files[0];
}

async function publicarRevision() {
    if (!nuevoVeredicto.value || !puedeRevisar.value) {
        modalStore.showModal({ title: 'Error', message: 'Debe seleccionar un veredicto.', type: 'error' });
        return;
    }
    const ultimaRevision = miAsignacion.value.historialCompleto[miAsignacion.value.historialCompleto.length - 1];

    const formData = new FormData();
    formData.append('veredicto', nuevoVeredicto.value);
    formData.append('observaciones', nuevasObservaciones.value);
    if (archivoRetroalimentacion.value) {
        formData.append('archivo_retroalimentacion', archivoRetroalimentacion.value);
    }

    try {
        await apiClient.put(`/revisiones/${ultimaRevision.id_revision}/veredicto`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        modalStore.showModal({ title: 'Éxito', message: 'Revisión publicada correctamente.', type: 'success' });
        router.push({ name: 'TTemaView' });
    } catch (error) {
        modalStore.showModal({ title: 'Error', message: 'No se pudo publicar la revisión.', type: 'error' });
    }
}

// La función descargarArchivo ahora es un despachador que decide qué ruta llamar.
async function descargarArchivo(tipo, id, nombre) {
    let url = '';
    if (tipo === 'temaEstudiante') {
        url = `/archivos/tema-version/${id}`;
    } else if (tipo === 'retroalimentacion') {
        url = `/archivos/retroalimentacion/tribunal/${id}`;
    } else {
        return; // No hacer nada si el tipo es desconocido
    }

    try {
        const response = await apiClient.get(url, { responseType: 'blob' });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', nombre);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        if (error.response?.status !== 403) {
            modalStore.showModal({ title: 'Error de Descarga', message: 'No se pudo descargar el archivo.', type: 'error' });
        }
    }
}

onMounted(fetchTemaDetalle);

watch(revisionSeleccionadaId, (newId) => {
    if (newId) {
        fetchRetroalimentacion(newId);
    }
});

// Función para dar estilo al badge de veredicto.
const getVeredictoClass = (veredicto) => {
    if (!veredicto) return 'bg-secondary';
    switch (veredicto) {
        case 'APROBADO': return 'bg-success';
        case 'REPROBADO': return 'bg-danger';
        case 'REVISADO': return 'bg-warning text-dark';
        default: return 'bg-secondary';
    }
};
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando datos de la revisión...</p>
        </div>

        <div v-else-if="tema && miAsignacion">
            <h2 class="fw-bold text-center mb-4">Gestión de Revisión de Tema</h2>

            <div class="revision-bar card card-body mb-4">
                <div class="row w-100 align-items-center text-center">
                    <div class="col-md-7">
                        <span class="fw-semibold">Estudiante:</span> {{ tema.estudiante.nombreCompleto }}
                    </div>
                    <div class="col-md-5 d-flex justify-content-center align-items-center">
                        <label for="revisionSelect" class="form-label mb-0 me-2 fw-semibold">Ver Versión:</label>
                        <select id="revisionSelect" class="form-select form-select-sm w-auto"
                            v-model="revisionSeleccionadaId">
                            <option v-for="r in miAsignacion.historialCompleto" :key="r.id" :value="r.id">Versión #{{
                                r.version }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="row g-4" v-if="revisionVisualizada">
                <div class="col-lg-6 d-flex flex-column gap-4">
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold bg-primary text-white">Documento a Revisar</div>
                        <div class="card-body">
                            <div class="archivo-display">
                                <i class="bi bi-file-earmark-pdf-fill"></i>
                                <span>{{ revisionVisualizada.documentoEstudiante?.nombre }}</span>
                                <button class="btn btn-sm btn-outline-secondary ms-auto"
                                    @click="descargarArchivo('temaEstudiante', revisionVisualizada.id, revisionVisualizada.documentoEstudiante.nombre)">
                                    Descargar
                                </button>
                            </div>
                            <div v-if="revisionVisualizada.documentoEstudiante?.comentarios"
                                class="mt-3 border-top pt-3">
                                <label class="form-label fw-semibold">Comentarios del Estudiante:</label>
                                <p class="text-muted fst-italic">"{{ revisionVisualizada.documentoEstudiante.comentarios
                                    }}"</p>
                            </div>
                        </div>
                    </div>
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold">Comentarios</div>
                        <div class="card-body">
                            <div class="historial-comentarios mb-3">
                                <p v-if="listaComentarios.length === 0" class="text-muted text-center">No hay
                                    comentarios.</p>
                                <div v-else v-for="c in listaComentarios" :key="c.id" class="comentario">
                                    <small class="text-muted">{{ new Date(c.fecha_publicacion).toLocaleString('es-ES')
                                        }}</small>
                                    <p>{{ c.texto_comentario }}</p>
                                </div>
                            </div>
                            <div v-if="puedeRevisar" class="input-group">
                                <input type="text" v-model="nuevoComentario" class="form-control"
                                    placeholder="Escribir comentario..." @keyup.enter="enviarComentario">
                                <button class="btn btn-outline-primary" @click="enviarComentario">Enviar</button>
                            </div>
                        </div>
                    </div>
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold">Archivos de Retroalimentación</div>
                        <div class="card-body">
                            <div v-if="puedeRevisar" class="mb-3">
                                <label class="form-label small text-muted">Adjuntar archivo con el veredicto
                                    (opcional):</label>
                                <input id="fileInput" type="file" class="form-control" @change="handleFileUpload">
                            </div>
                            <p v-if="listaArchivosRetro.length === 0" class="text-muted">No se han subido archivos para
                                esta versión.</p>
                            <ul v-else class="list-group list-group-flush">
                                <li v-for="file in listaArchivosRetro" :key="file.id" class="list-group-item ps-0 pe-0">
                                    <div class="archivo-display-retro">
                                        <i class="bi bi-file-earmark-arrow-down"></i>
                                        <span class="nombre-archivo">{{ file.nombre }}</span>
                                        <button class="btn btn-sm btn-outline-secondary ms-auto"
                                            @click="descargarArchivo('retroalimentacion', file.id, file.nombre)">
                                            Descargar
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card shadow-sm h-100" :class="!puedeRevisar ? 'bg-light' : ''">
                        <div class="card-header fw-bold bg-secondary text-white">Veredicto y Observaciones Finales</div>
                        <div class="card-body p-4">
                            <div v-if="puedeRevisar">
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Veredicto:</label>
                                    <select class="form-select" v-model="nuevoVeredicto">
                                        <option disabled value="">Seleccione un veredicto</option>
                                        <option value="APROBADO">Aprobado</option>
                                        <option value="REVISADO">Revisado (Aprobado con Obs.)</option>
                                        <option value="REPROBADO">Reprobado</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label fw-semibold">Observaciones:</label>
                                    <textarea class="form-control" rows="10" v-model="nuevasObservaciones"
                                        placeholder="Escriba aquí las observaciones generales..."></textarea>
                                </div>
                            </div>
                            <div v-else
                                class="text-center d-flex flex-column align-items-center justify-content-center h-100">
                                <h6 class="text-muted mb-2">Veredicto Emitido</h6>
                                <span class="badge fs-6 px-3 py-2 mb-3"
                                    :class="getVeredictoClass(revisionVisualizada.veredicto)">
                                    {{ revisionVisualizada.veredicto }}
                                </span>
                                <div class="w-100 mt-3 border-top pt-3">
                                    <h6 class="text-muted text-start mb-2">Observaciones Guardadas:</h6>
                                    <p v-if="revisionVisualizada.observaciones" class="text-start text-muted fst-italic"
                                        style="white-space: pre-wrap;">"{{ revisionVisualizada.observaciones }}"</p>
                                    <p v-else class="text-start text-muted fst-italic">No se dejaron observaciones.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="puedeRevisar" class="col-12 text-center mt-3">
                    <button class="btn btn-success btn-lg px-5" @click="publicarRevision">
                        <i class="bi bi-send-check-fill me-2"></i>Publicar Revisión
                    </button>
                </div>

            </div>
        </div>
        <div v-else-if="!isLoading" class="alert alert-danger text-center">
            No se pudo cargar la información de la revisión.
        </div>
    </section>
</template>

<style scoped>
.revision-bar {
    background-color: #f8f9fa;
    font-size: 0.95rem;
}

.archivo-display {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 5px;
}

.historial-comentarios {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #eee;
    padding: 1rem;
    border-radius: 5px;
}

.comentario {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}

.comentario:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.archivo-display-retro {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.5rem 0.75rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: .375rem;
}

.archivo-display-retro i {
    font-size: 1.5rem;
    color: #0d6efd;
    /* Azul para el ícono de descarga */
}

.archivo-display-retro .nombre-archivo {
    font-weight: 500;
    color: #212529;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>