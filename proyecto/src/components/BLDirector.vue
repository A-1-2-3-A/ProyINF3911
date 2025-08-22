<script setup>
</script>

<template>
    <div class="sidebar d-flex flex-column">
        <nav class="nav flex-column mt-3">
            <router-link :to="{ name: 'DPrincipalView' }"
                class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-grid-1x2-fill me-2"></i> Inicio
            </router-link>
            <router-link :to="{ name: 'DPerfilView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-person-circle me-2"></i> Ver Perfil
            </router-link>
            <router-link :to="{ name: 'DUsuarioView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-people-fill me-2"></i> Usuarios
            </router-link>
            <router-link :to="{ name: 'DEspecialidadView' }" class="nav-link">
                <i class="bi bi-bookmark-star-fill me-2"></i>Especialidades
            </router-link>
            <router-link :to="{ name: 'DTribunalView' }"
                class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-person-workspace me-2"></i> Tribunales
            </router-link>
            <router-link :to="{ name: 'DTemaView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-collection-fill me-2"></i> Temas
            </router-link>
        </nav>
    </div>
</template>

<style scoped>
/* (El estilo se mantiene igual, pero he añadido esto para el botón de salir) */
.sidebar {
    width: 250px;
    background-color: #1a1c1e;
    color: white;
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.nav-link {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    /* Aumentamos ligeramente el tamaño para mejor legibilidad */
    transition: background-color 0.2s ease;
}

.nav-link:hover {
    background-color: #0d6efd;
    color: white;
}

.nav-link i {
    font-size: 1.2rem;
    /* Iconos un poco más grandes */
}
</style>