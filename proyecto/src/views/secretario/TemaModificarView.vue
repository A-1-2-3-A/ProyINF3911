<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal';

const route = useRoute();
const router = useRouter();
const modalStore = useModalStore();
const temaId = parseInt(route.params.id);

const isLoading = ref(true);
const isSaving = ref(false);

const nombre = ref('');
const estudianteInfo = ref('');
const nuevoArchivo = ref(null);

// Refs para almacenar los datos del archivo actual
const archivoActualId = ref(null);
const archivoActualNombre = ref('');

async function fetchTemaParaModificar() {
    isLoading.value = true;
    try {
        const response = await apiClient.get(`/temas/${temaId}`);
        const tema = response.data.data;

        // Solo se pueden modificar temas en estado preliminar
        if (tema.estado_tema !== 'PRELIMINAR') {
            modalStore.showModal({ title: 'Acción no permitida', message: 'Solo se pueden modificar temas en estado PRELIMINAR.', type: 'error' });
            router.push({ name: 'STemaView' });
            return;
        }

        nombre.value = tema.nombre;
        estudianteInfo.value = tema.estudiante.nombreCompleto;

        // Se guardan los datos del archivo inicial, incluyendo su ID
        if (tema.archivoInicial) {
            archivoActualId.value = tema.archivoInicial.id;
            archivoActualNombre.value = tema.archivoInicial.nombre;
        }

    } catch (error) {
        console.error("Error al cargar el tema:", error);
        modalStore.showModal({ title: 'Error', message: 'No se pudo cargar la información del tema.', type: 'error' });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchTemaParaModificar);

// Función de descarga segura que usa el ID del archivo
async function descargarArchivo() {
    if (!archivoActualId.value) return;

    try {
        const response = await apiClient.get(`/archivos/tema-version/admin/${archivoActualId.value}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', archivoActualNombre.value);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        modalStore.showModal({
            title: 'Error de Descarga',
            message: 'No se pudo descargar el archivo. Verifique que exista en el servidor.',
            type: 'error'
        });
    }
}

async function guardarCambios() {
    if (!nombre.value) {
        modalStore.showModal({ title: 'Error', message: 'El nombre del tema es requerido.', type: 'error' });
        return;
    }

    isSaving.value = true;

    const formData = new FormData();
    formData.append('nombre', nombre.value);

    if (nuevoArchivo.value) {
        formData.append('archivo', nuevoArchivo.value);
    }

    try {
        await apiClient.put(`/temas/${temaId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        modalStore.showModal({
            title: 'Éxito',
            message: 'Los cambios en el tema han sido guardados.',
            type: 'success'
        });
        router.push({ name: 'STemaView' });

    } catch (error) {
        modalStore.showModal({
            title: 'Error al Guardar',
            message: error.response?.data?.message || 'No se pudieron guardar los cambios.',
            type: 'error'
        });
    } finally {
        isSaving.value = false;
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        nuevoArchivo.value = file;
    } else {
        if (file) { // Solo mostrar modal si se seleccionó un archivo no válido
            modalStore.showModal({ title: 'Archivo no válido', message: 'Por favor, seleccione un archivo PDF.', type: 'warning' });
        }
        event.target.value = '';
        nuevoArchivo.value = null;
    }
}
</script>

<template>
    <section class="container mt-4">
        <div v-if="isLoading" class="text-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando tema...</p>
        </div>

        <form v-else @submit.prevent="guardarCambios" class="card shadow-sm w-100"
            style="max-width: 600px; margin: auto;">
            <div class="card-header bg-primary text-white fw-bold text-center">
                Modificar Tema
            </div>
            <div class="card-body p-4">
                <div class="mb-3">
                    <label class="form-label">Nombre del Tema</label>
                    <input type="text" v-model="nombre" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label class="form-label">Estudiante</label>
                    <input type="text" :value="estudianteInfo" class="form-control" disabled readonly />
                </div>

                <div class="mb-3">
                    <label class="form-label">Archivo del Tema (PDF)</label>

                    <div class="archivo-display" v-if="archivoActualId">
                        <i class="bi bi-file-earmark-pdf-fill"></i>
                        <span class="nombre-archivo">{{ archivoActualNombre }}</span>
                        <button type="button" @click="descargarArchivo"
                            class="btn btn-sm btn-outline-secondary ms-auto">
                            Descargar
                        </button>
                    </div>
                    <div v-else class="alert alert-warning p-2">
                        Archivo no disponible
                    </div>

                    <label for="fileUpload" class="form-label text-muted small mt-2">Seleccione un nuevo archivo para
                        reemplazar el actual (opcional):</label>
                    <input id="fileUpload" type="file" class="form-control" @change="handleFileUpload" accept=".pdf">
                    <div v-if="nuevoArchivo" class="alert alert-success mt-2 p-2">
                        <strong>Nuevo archivo:</strong> {{ nuevoArchivo.name }}
                    </div>
                </div>

                <div class="text-center mt-4 border-top pt-4">
                    <button type="submit" class="btn btn-success px-5" :disabled="isSaving">
                        <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        <span v-else>Guardar Cambios</span>
                    </button>
                </div>
            </div>
        </form>
    </section>
</template>

<style scoped>
.archivo-display {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.5rem 0.75rem;
    background-color: #e9ecef;
    border: 1px solid #dee2e6;
    border-radius: .375rem;
}

.archivo-display i {
    font-size: 1.5rem;
    color: #dc3545;
    /* Rojo para el ícono de PDF */
}

.archivo-display .nombre-archivo {
    font-weight: 500;
    color: #212529;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>