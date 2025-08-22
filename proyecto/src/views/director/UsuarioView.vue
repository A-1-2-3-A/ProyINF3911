<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal.js';

const router = useRouter()
const modalStore = useModalStore();

const usuarios = ref([]);
const isLoading = ref(true);
const busqueda = ref('');

// Función para cargar los usuarios desde la API.
async function fetchUsuarios() {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/usuarios');
        usuarios.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        modalStore.showModal({
            title: 'Error',
            message: 'No se pudieron cargar los usuarios. Por favor, intente de nuevo.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchUsuarios);

// Función para cambiar el estado (habilitar/inhabilitar) de un usuario.
async function cambiarEstadoUsuario(usuario) {
    const nuevoEstado = !usuario.estado;
    const accion = nuevoEstado ? 'habilitar' : 'inhabilitar';

    if (!confirm(`¿Estás seguro de que quieres ${accion} a ${usuario.nombres}?`)) {
        return;
    }

    try {
        // Llamada al endpoint PATCH de la API.
        await apiClient.patch(`/usuarios/${usuario.id}/estado`, {
            estado: nuevoEstado
        });

        // Si la API responde con éxito, actualizamos el estado localmente para reflejar el cambio al instante.
        usuario.estado = nuevoEstado;

        modalStore.showModal({
            title: 'Éxito',
            message: `Usuario ${accion}do correctamente.`,
            type: 'success'
        });

    } catch (error) {
        console.error(`Error al ${accion} el usuario:`, error);
        modalStore.showModal({
            title: 'Error',
            message: `No se pudo ${accion} al usuario.`,
            type: 'error'
        });
    }
}

const usuariosFiltrados = computed(() => {
    if (!busqueda.value.trim()) {
        return usuarios.value;
    }
    const criterio = busqueda.value.trim().toLowerCase();
    return usuarios.value.filter(usuario =>
        `${usuario.nombres} ${usuario.apellido_primero} ${usuario.apellido_segundo}`.toLowerCase().includes(criterio) ||
        usuario.usuario.toLowerCase().includes(criterio) ||
        usuario.rol.toLowerCase().includes(criterio)
    );
});

// Función para obtener una clase de color para cada rol
const getRolClass = (rol) => {
    switch (rol.toLowerCase()) {
        case 'director': return 'text-bg-danger';
        case 'secretario': return 'text-bg-info';
        case 'tribunal': return 'text-bg-warning';
        case 'estudiante': return 'text-bg-success';
        default: return 'text-bg-secondary';
    }
}

// Navegar a la vista de añadir (depende del rol actual en la URL)
const irAAgregar = () => {
    if (router.currentRoute.value.path.includes('/director')) {
        router.push({ name: 'DUsuarioAdicionarView' });
    } else {
        router.push({ name: 'SUsuarioAdicionarView' });
    }
}

// Simulación de inhabilitar
const inhabilitarUsuario = (id) => {
    alert(`Inhabilitando usuario con ID: ${id}`);
}
</script>

<template>
    <section class="container-fluid mt-4">
        <div class="text-center mb-4">
            <h2 class="text-dark-emphasis fw-bold mb-0">Gestión de Usuarios</h2>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="input-group" style="max-width: 400px;">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar por nombre, correo o rol..."
                    v-model="busqueda" />
            </div>
            <button @click="irAAgregar" class="btn btn-primary d-flex align-items-center">
                <i class="bi bi-person-plus-fill me-2"></i> Añadir Usuario
            </button>
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div v-if="isLoading" class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando usuarios...</p>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-dark">
                            <tr class="text-center">
                                <th>Nombre Completo</th>
                                <th>Rol</th>
                                <th>Correo Electrónico</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                                <td class="text-center">
                                    {{ usuario.apellido_primero }} {{ usuario.apellido_segundo }}, {{ usuario.nombres }}
                                </td>
                                <td class="text-center">
                                    <span class="badge rounded-pill" :class="getRolClass(usuario.rol)">
                                        {{ usuario.rol }}
                                    </span>
                                </td>
                                <td class="text-center">{{ usuario.usuario }}</td>
                                <td class="text-center">
                                    <span class="badge" :class="usuario.estado ? 'text-bg-success' : 'text-bg-danger'">
                                        {{ usuario.estado ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group" role="group">
                                        <router-link
                                            :to="{ name: router.currentRoute.value.path.includes('/director') ? 'DUsuarioModificarView' : 'SUsuarioModificarView', params: { id: usuario.id } }"
                                            class="btn btn-sm btn-outline-primary" title="Modificar">
                                            <i class="bi bi-pencil-fill"></i>
                                        </router-link>
                                        <button @click="cambiarEstadoUsuario(usuario)"
                                            class="btn btn-sm btn-outline-danger" title="Habilitar/Inhabilitar">
                                            <i
                                                :class="usuario.estado ? 'bi bi-slash-circle-fill' : 'bi bi-check-circle-fill'"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="!isLoading && usuariosFiltrados.length === 0">
                                <td colspan="5" class="text-center text-muted p-4">No se encontraron usuarios.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</template>