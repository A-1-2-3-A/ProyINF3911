<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios.js';
import { useModalStore } from '@/stores/modal.js';

const router = useRouter();
const modalStore = useModalStore();

const usuarios = ref([]);
const isLoading = ref(true);
const busqueda = ref('');

async function fetchUsuarios() {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/usuarios');
        usuarios.value = response.data.data;
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        modalStore.showModal({
            title: 'Error',
            message: 'No se pudieron cargar los usuarios.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchUsuarios);

async function cambiarEstadoUsuario(usuario) {
    const nuevoEstado = !usuario.estado;
    const accion = nuevoEstado ? 'habilitar' : 'inhabilitar';
    if (!confirm(`¿Estás seguro de que quieres ${accion} a ${usuario.nombres}?`)) return;

    try {
        await apiClient.patch(`/usuarios/${usuario.id}/estado`, { estado: nuevoEstado });
        // Actualizamos el estado localmente para reflejar el cambio al instante.
        usuario.estado = nuevoEstado;
        modalStore.showModal({ title: 'Éxito', message: `Usuario ${accion}do correctamente.`, type: 'success' });
    } catch (error) {
        modalStore.showModal({ title: 'Error', message: `No se pudo ${accion} al usuario.`, type: 'error' });
    }
}

// Lógica de filtrado que se conserva
const usuariosFiltrados = computed(() => {
    // Se filtran los roles que el Secretario no debe ver
    let usuariosPermitidos = usuarios.value.filter(u => u.rol !== 'Director' && u.rol !== 'Secretario');

    if (!busqueda.value.trim()) {
        return usuariosPermitidos;
    }

    const criterio = busqueda.value.trim().toLowerCase();
    return usuariosPermitidos.filter(usuario =>
        `${usuario.nombres} ${usuario.apellido_primero} ${usuario.apellido_segundo || ''}`.toLowerCase().includes(criterio) ||
        usuario.usuario.toLowerCase().includes(criterio) ||
        usuario.rol.toLowerCase().includes(criterio)
    );
});

const getRolClass = (rol) => {
    switch (rol.toLowerCase()) {
        case 'tribunal': return 'text-bg-warning';
        case 'estudiante': return 'text-bg-success';
        default: return 'text-bg-secondary';
    }
}

const irAAgregar = () => {
    router.push({ name: 'SUsuarioAdicionarView' });
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
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th class="ps-4">Nombre Completo</th>
                                <th>Rol</th>
                                <th>Correo Electrónico</th>
                                <th class="text-center">Estado</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                                <td class="ps-4">{{ usuario.apellido_primero }} {{ usuario.apellido_segundo || '' }}, {{
                                    usuario.nombres }}</td>
                                <td>
                                    <span class="badge rounded-pill" :class="getRolClass(usuario.rol)">
                                        {{ usuario.rol }}
                                    </span>
                                </td>
                                <td>{{ usuario.usuario }}</td>
                                <td class="text-center">
                                    <span class="badge" :class="usuario.estado ? 'text-bg-success' : 'text-bg-danger'">
                                        {{ usuario.estado ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <router-link :to="{ name: 'SUsuarioModificarView', params: { id: usuario.id } }"
                                        class="btn btn-sm btn-outline-primary me-2" title="Modificar">
                                        <i class="bi bi-pencil-fill"></i>
                                    </router-link>
                                    <button @click="cambiarEstadoUsuario(usuario)" class="btn btn-sm btn-outline-danger"
                                        :title="usuario.estado ? 'Inhabilitar' : 'Habilitar'">
                                        <i
                                            :class="usuario.estado ? 'bi bi-slash-circle-fill' : 'bi bi-check-circle-fill'"></i>
                                    </button>
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