<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const route = useRoute();
const router = useRouter();
const modalStore = useModalStore();
const temaId = parseInt(route.params.temaId);
const tribunalId = parseInt(route.params.id);

const tema = ref(null);
const isLoading = ref(true);
const revisionSeleccionadaId = ref(null);
const comentariosTribunal = ref([]);
const archivosRetroalimentacion = ref([]);

// Nuevo estado para controlar si estamos en modo consulta o modo envío.
const modoEnvio = ref(false);

const archivoCorreccion = ref(null);
const comentariosEstudiante = ref('');

const miAsignacion = computed(() => {
    if (!tema.value) return null;
    return tema.value.revisionesPorTribunal.find(r => r.idTribunal === tribunalId);
});

const revisionVisualizada = computed(() => {
    if (!miAsignacion.value || !revisionSeleccionadaId.value) return null;
    return miAsignacion.value.historialCompleto.find(h => h.id === revisionSeleccionadaId.value);
});

// Esta lógica ahora se usará para mostrar el botón que activa el "modoEnvio".
const requiereAccion = computed(() => {
    if (!miAsignacion.value) return false;
    const historial = miAsignacion.value.historialCompleto;
    if (historial.length === 0) return false;
    const ultimaRevision = historial[historial.length - 1];
    return ultimaRevision.veredicto === 'REVISADO';
});

async function fetchData() {
    isLoading.value = true;
    try {
        const response = await apiClient.get(`/temas/${temaId}`);
        tema.value = response.data.data;

        if (miAsignacion.value && miAsignacion.value.historialCompleto.length > 0) {
            const ultimaVersion = miAsignacion.value.historialCompleto[miAsignacion.value.historialCompleto.length - 1];
            revisionSeleccionadaId.value = ultimaVersion.id;
        }
    } catch (error) {
        console.error("Error al obtener detalle del tema:", error);
    } finally {
        isLoading.value = false;
    }
}

async function fetchRetroalimentacion(idVersion) {
    if (!idVersion || !miAsignacion.value) return;
    try {
        const res = await apiClient.get(`/retroalimentaciones/${miAsignacion.value.idAsignacion}?id_version_tema=${idVersion}`);
        comentariosTribunal.value = res.data.data.comentarios;
        archivosRetroalimentacion.value = res.data.data.archivos;
    } catch (error) {
        console.error("Error al cargar retroalimentación:", error);
        comentariosTribunal.value = [];
        archivosRetroalimentacion.value = [];
    }
}

async function descargarArchivo(tipo, id, nombre) {
    let url = '';

    // Se definen las URLs correctas para cada tipo de descarga
    if (tipo === 'documentoEstudiante') {
        // Un estudiante puede descargar su propio documento. Usamos la ruta de admin por simplicidad,
        // asumiendo que el backend podría necesitar una ruta específica para estudiante en el futuro.
        // Por ahora, crearemos una ruta segura para que el estudiante descargue su propio archivo.
        url = `/archivos/tema-version/estudiante/${id}`; // Se asume que esta ruta se creará
    } else if (tipo === 'retroalimentacionTribunal') {
        // Se corrige la URL para que coincida con la ruta del backend
        url = `/archivos/retroalimentacion/estudiante/${id}`;
    } else {
        return;
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

function handleFileUpload(event) {
    archivoCorreccion.value = event.target.files[0];
}

async function enviarCorreccion() {
    if (!archivoCorreccion.value) {
        modalStore.showModal({ title: 'Error', message: 'Por favor, seleccione un archivo PDF.', type: 'error' });
        return;
    }
    const formData = new FormData();
    formData.append('id_asignacion', miAsignacion.value.idAsignacion);
    formData.append('comentarios_estudiante', comentariosEstudiante.value);
    formData.append('archivo', archivoCorreccion.value);
    try {
        await apiClient.post('/versiones', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        modalStore.showModal({ title: 'Éxito', message: 'Tu corrección ha sido enviada.', type: 'success' });
        router.push({ name: 'ETemaView' });
    } catch (error) {
        modalStore.showModal({ title: 'Error', message: error.response?.data?.message || 'No se pudo enviar la corrección.', type: 'error' });
    }
}

onMounted(fetchData);

watch(revisionSeleccionadaId, (newId) => {
    // Si se cambia el selector, siempre volvemos al modo consulta.
    modoEnvio.value = false;
    if (newId) {
        fetchRetroalimentacion(newId);
    }
});

const getVeredictoClass = (veredicto) => {
    switch (veredicto) {
        case 'APROBADO': return 'badge bg-success';
        case 'REPROBADO': return 'badge bg-danger';
        case 'REVISADO': return 'badge bg-warning text-dark';
        default: return 'badge bg-secondary';
    }
};
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando datos de la revisión...</p>
        </div>

        <div v-else-if="tema && miAsignacion">
            <h2 class="fw-bold text-center mb-4">Detalle de Revisión</h2>

            <div class="revision-bar card card-body mb-4">
                <div class="row w-100 align-items-center text-center">
                    <div class="col-md-5">
                        <span class="fw-semibold">Tribunal:</span> {{ miAsignacion.nombreCompleto }}
                    </div>
                    <div class="col-md-3">
                        <span class="fw-semibold">Veredicto:</span>
                        <span :class="getVeredictoClass(revisionVisualizada?.veredicto)">
                            {{ revisionVisualizada?.veredicto }}
                        </span>
                    </div>
                    <div class="col-md-4 d-flex justify-content-center align-items-center">
                        <label for="revisionSelect" class="form-label mb-0 me-2 fw-semibold">Ver Intento:</label>
                        <select id="revisionSelect" class="form-select form-select-sm w-auto"
                            v-model="revisionSeleccionadaId">
                            <option v-for="r in miAsignacion.historialCompleto" :key="r.id" :value="r.id">
                                Revisión #{{ r.version }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div v-if="!modoEnvio && revisionVisualizada" class="row g-4">
                <div class="col-lg-6 d-flex flex-column gap-4">
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold bg-primary text-white">Mi Envío</div>
                        <div class="card-body">
                            <div class="archivo-display">
                                <i class="bi bi-file-earmark-pdf-fill"></i>
                                <span>{{ revisionVisualizada.documentoEstudiante.nombre }}</span>
                                <button class="btn btn-sm btn-outline-secondary ms-auto"
                                    @click="descargarArchivo('documentoEstudiante', revisionVisualizada.id, revisionVisualizada.documentoEstudiante.nombre)">
                                    Descargar
                                </button>
                            </div>
                            <div v-if="revisionVisualizada.documentoEstudiante.comentarios"
                                class="mt-3 border-top pt-3">
                                <label class="form-label fw-semibold">Mis Comentarios en este Envío:</label>
                                <p class="text-muted fst-italic">"{{ revisionVisualizada.documentoEstudiante.comentarios
                                    }}"</p>
                            </div>
                        </div>
                    </div>
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold">Comentarios del Tribunal</div>
                        <div class="card-body card-body-scrollable">
                            <p v-if="!comentariosTribunal.length" class="text-muted text-center pt-3">No hay
                                comentarios.</p>
                            <ul v-else class="list-unstyled">
                                <li v-for="comment in comentariosTribunal" :key="comment.id"
                                    class="mb-2 border-bottom pb-2">
                                    <small class="text-muted d-block">{{ new
                                        Date(comment.fecha_publicacion).toLocaleString('es-ES') }}</small>
                                    <p class="mb-0">{{ comment.texto_comentario }}</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 d-flex flex-column gap-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-header fw-bold bg-secondary text-white">Observaciones del Tribunal</div>
                        <div class="card-body card-body-scrollable">
                            <p v-if="!revisionVisualizada.observaciones" class="text-muted text-center pt-3">No hay
                                observaciones para esta revisión.</p>
                            <p v-else style="white-space: pre-wrap;">{{ revisionVisualizada.observaciones }}</p>
                        </div>
                    </div>
                    <div class="card shadow-sm h-100">
                        <div class="card-header fw-bold">Archivos de Retroalimentación</div>
                        <div class="card-body">
                            <p v-if="!archivosRetroalimentacion.length" class="text-muted text-center pt-3">No hay
                                archivos.</p>
                            <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-2">
                                <li v-for="file in archivosRetroalimentacion" :key="file.id"
                                    class="archivo-display-retro">
                                    <i class="bi bi-file-earmark-arrow-down"></i>
                                    <span>{{ file.nombre }}</span>
                                    <button class="btn btn-sm btn-outline-secondary ms-auto"
                                        @click="descargarArchivo('retroalimentacionTribunal', file.id, file.nombre)">
                                        Descargar
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div v-if="requiereAccion" class="col-12 text-center mt-4">
                    <button @click="modoEnvio = true" class="btn btn-success btn-lg px-5">
                        <i class="bi bi-upload me-2"></i>Subir Nueva Corrección
                    </button>
                </div>
            </div>

            <div v-else-if="modoEnvio">
                <div class="card shadow-sm">
                    <div class="card-header bg-success text-white fw-bold">
                        Enviar Corrección (Intento #{{ miAsignacion.historialCompleto.length + 1 }})
                    </div>
                    <div class="card-body p-4">
                        <p class="text-muted mb-3">Sube la nueva versión de tu documento con las correcciones
                            solicitadas por el tribunal.</p>
                        <div class="mb-3">
                            <label class="form-label">Archivo Corregido (PDF):</label>
                            <input type="file" class="form-control" @change="handleFileUpload" accept=".pdf" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Comentarios para el Tribunal (Opcional):</label>
                            <textarea class="form-control" rows="4" v-model="comentariosEstudiante"
                                placeholder="Ej: He aplicado las correcciones solicitadas en la página 5 y 12..."></textarea>
                        </div>
                        <div class="d-flex justify-content-center gap-3 mt-4">
                            <button class="btn btn-secondary" @click="modoEnvio = false">Cancelar</button>
                            <button class="btn btn-primary" @click="enviarCorreccion"
                                :disabled="!archivoCorreccion">Enviar Corrección</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div v-else-if="!isLoading" class="alert alert-danger text-center">
            No se pudo encontrar la información de la revisión.
        </div>
    </section>
</template>

<style scoped>
.revision-bar {
    background-color: #f8f9fa;
    font-size: 0.95rem;
}

.badge {
    font-size: 0.8rem;
    padding: 0.4em 0.8em;
}

.archivo-display,
.archivo-display-retro {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 5px;
}

.archivo-display i {
    font-size: 1.5rem;
    color: #dc3545;
}

.archivo-display-retro i {
    font-size: 1.5rem;
    color: #0d6efd;
}

.card-body-scrollable {
    max-height: 200px;
    overflow-y: auto;
}
</style>