<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth'; 
import { useModalStore } from '@/stores/modal';
import apiClient from '@/api/axios';

const authStore = useAuthStore();
const modalStore = useModalStore();

const usuario = ref(null);
const isLoading = ref(true);
const especialidadesDisponibles = ref([]);

const claveData = ref({
    clave_actual: '',
    clave_nueva: ''
});
const repetirClaveNueva = ref('');

// Cargar el perfil del usuario desde la API al montar el componente.
async function fetchData() {
    isLoading.value = true;
    try {
        // Se usan Promise.all para hacer ambas llamadas a la API en paralelo.
        const [perfilResponse, especialidadesResponse] = await Promise.all([
            apiClient.get('/usuarios/perfil'),
            apiClient.get('/especialidades')
        ]);
        
        usuario.value = perfilResponse.data.data;
        especialidadesDisponibles.value = especialidadesResponse.data.data;

    } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
        modalStore.showModal({
            title: 'Error',
            message: 'No se pudo cargar la información del perfil.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}


onMounted(fetchData);

// Actualizar la contraseña a través de la API.
async function actualizarContrasena() {
    if (claveData.value.clave_nueva !== repetirClaveNueva.value) {
        modalStore.showModal({ title: 'Error', message: 'Las nuevas contraseñas no coinciden.', type: 'error' });
        return;
    }
    if (!claveData.value.clave_actual || !claveData.value.clave_nueva) {
        modalStore.showModal({ title: 'Error', message: 'Todos los campos de contraseña son requeridos.', type: 'error' });
        return;
    }

    try {
        await apiClient.put(`/usuarios/${authStore.usuario.id}/cambiar-clave`, claveData.value);
        
        modalStore.showModal({ 
            title: 'Éxito', 
            message: 'Contraseña actualizada correctamente.', 
            type: 'success' 
        });

        // Limpiar campos del formulario después del éxito
        claveData.value.clave_actual = '';
        claveData.value.clave_nueva = '';
        repetirClaveNueva.value = '';

    } catch (error) {
        modalStore.showModal({ 
            title: 'Error', 
            message: error.response?.data?.message || 'No se pudo actualizar la contraseña.', 
            type: 'error' 
        });
    }
}

// Esta propiedad ahora busca los nombres de las especialidades.
const especialidadesFormateadas = computed(() => {
    // Si no tenemos los datos necesarios, devuelve un texto por defecto.
    if (!usuario.value || !Array.isArray(usuario.value.especialidades) || especialidadesDisponibles.value.length === 0) {
        return 'No asignadas';
    }

    // Filtra la lista de especialidades disponibles...
    return especialidadesDisponibles.value
        // ...quedándose solo con aquellas cuyo ID está en el array de especialidades del usuario.
        .filter(esp => usuario.value.especialidades.includes(esp.id))
        // Mapea el resultado para obtener solo los nombres.
        .map(esp => esp.nombre_especialidad)
        // Une los nombres en una sola cadena de texto.
        .join(', ');
});
</script>

<template>
    <section class="container mt-4">
        <div v-if="usuario" class="w-100" style="max-width: 600px; margin: auto;">
            <!-- Recuadro Principal de Información -->
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-primary text-white fw-bold text-center">
                    Información del Perfil
                </div>
                <div class="card-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Nombres</label>
                        <div class="form-control-plaintext-custom">{{ usuario.nombres }}</div>
                    </div>
                     <div class="mb-3">
                        <label class="form-label fw-bold">Apellidos</label>
                        <div class="form-control-plaintext-custom">{{ usuario.apellido_primero }} {{ usuario.apellido_segundo }}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Correo Electrónico</label>
                        <div class="form-control-plaintext-custom bg-light">{{ usuario.usuario }}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Rol</label>
                        <div class="form-control-plaintext-custom text-capitalize">{{ usuario.rol }}</div>
                    </div>
                    <div v-if="usuario.rol === 'Tribunal' || usuario.rol === 'Director'" class="mb-3">
                        <label class="form-label fw-bold">Especialidades</label>
                        <div class="form-control-plaintext-custom">{{ especialidadesFormateadas }}</div>
                    </div>
                     <div v-if="usuario.rol === 'Estudiante'" class="mb-3">
                        <label class="form-label fw-bold">Tipo de Estudiante</label>
                        <div class="form-control-plaintext-custom text-capitalize">{{ usuario.tipo_estudiante }}</div>
                    </div>
                </div>
            </div>

            <!-- Recuadro para Actualizar Contraseña -->
            <form @submit.prevent="actualizarContrasena" class="card shadow-sm">
                <div class="card-header bg-secondary text-white fw-bold text-center">
                    Actualizar Contraseña
                </div>
                 <div class="card-body p-4">
                    <div class="mb-3">
                        <label for="claveActual" class="form-label">Contraseña Actual</label>
                        <input id="claveActual" type="password" v-model="claveData.clave_actual" class="form-control" required/>
                    </div>
                    <div class="mb-3">
                        <label for="claveNueva" class="form-label">Nueva Contraseña</label>
                        <input id="claveNueva" type="password" v-model="claveData.clave_nueva" class="form-control" required/>
                    </div>
                    <div class="mb-3">
                        <label for="repetirClaveNueva" class="form-label">Repetir Nueva Contraseña</label>
                        <input id="repetirClaveNueva" type="password" v-model="repetirClaveNueva" class="form-control" />
                    </div>
                     <div class="text-center mt-4">
                        <button type="submit" class="btn btn-primary px-5">Actualizar</button>
                    </div>
                 </div>
            </form>
        </div>
        <div v-else class="alert alert-warning">
            Cargando información del perfil...
        </div>
    </section>
</template>

<style scoped>
.form-control-plaintext-custom {
    padding: 0.5rem 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: .375rem;
    background-color: white;
    font-size: 1rem;
    font-weight: 400;
    color: #212529;
}
.form-label {
    margin-bottom: 0.5rem;
}
</style>