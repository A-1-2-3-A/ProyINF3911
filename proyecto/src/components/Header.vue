<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const usuario = computed(() => authStore.usuario);


// Propiedad computada para la ruta de inicio dinámica
const homeRoute = computed(() => {
    // Si el usuario no está autenticado, el logo lleva a la página pública.
    if (!isAuthenticated.value) {
        return { name: 'PublicView' };
    }

    // Si está autenticado, determina la ruta principal según su rol.
    switch (usuario.value.rol) {
        case 'Director':
            return { name: 'DPrincipalView' };
        case 'Secretario':
            return { name: 'SPrincipalView' };
        case 'Tribunal':
            return { name: 'TPrincipalView' };
        case 'Estudiante':
            return { name: 'EPrincipalView' };
        default:
            // Fallback por si acaso, aunque no debería ocurrir.
            return { name: 'PublicView' };
    }
});

function cerrarSesion() {
    authStore.logout();
}
</script>

<template>
    <header class="app-header shadow-sm">
        <!-- Logo (ocupa su espacio necesario) -->
        <div class="logo-container">
            <router-link :to="homeRoute" class="d-flex align-items-center text-decoration-none text-white">
                <img src="@/assets/image.png" alt="Logo" class="logo" />
            </router-link>
        </div>

        <!-- Título (ocupa todo el espacio central y centra su contenido) -->
        <div class="header-title-container flex-grow-1">
            <div class="header-title">
                <h5 class="fw-bold mb-0">ING. SISTEMAS - ING. INFORMATICA</h5>
                <small>ADMINISTRACION DE TEMAS</small>
            </div>
        </div>

        <!-- Acciones del Usuario (ocupa su espacio necesario) -->
        <div class="actions-container">
            <!-- Si el usuario NO está autenticado -->
            <router-link v-if="!isAuthenticated" :to="{ name: 'LoginView' }" class="btn btn-outline-light">
                <i class="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
            </router-link>

            <!-- Si el usuario SÍ está autenticado -->
            <div v-else class="dropdown">
                <button class="btn btn-dark dropdown-toggle d-flex align-items-center" type="button" id="userMenuButton"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle fs-4 me-2"></i>
                    <span>Hola, {{ usuario.nombres }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="userMenuButton">
                    <li>
                        <h6 class="dropdown-header">Rol: {{ usuario.rol }}</h6>
                    </li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="cerrarSesion">
                            <i class="bi bi-box-arrow-left me-2"></i> Cerrar Sesión
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    background-color: #1a1c1e;
    color: white;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.logo-container {
    flex-shrink: 0;
    /* No se encoge */
}

.logo-container .logo {
    height: 50px;
    width: auto;
}

.header-title-container {
    text-align: center;
    /* Centra el div del título */
}

.header-title h5 {
    font-size: 1.1rem;
    letter-spacing: 0.5px;
}

.header-title small {
    font-size: 0.8rem;
    color: #adb5bd;
}

.actions-container {
    flex-shrink: 0;
    /* No se encoge */
    min-width: 150px;
    /* Ancho mínimo para evitar que el título se desplace */
    display: flex;
    justify-content: flex-end;
}

.actions-container .btn-dark {
    background-color: transparent;
    border: none;
}

.dropdown-toggle::after {
    margin-left: 0.5em;
}

.dropdown-menu {
    border: 1px solid #343a40;
}
</style>