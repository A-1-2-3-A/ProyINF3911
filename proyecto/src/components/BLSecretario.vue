<script setup>
</script>

<template>
    <div class="sidebar d-flex flex-column">
        <nav class="nav flex-column mt-3">
            <router-link :to="{ name: 'SPrincipalView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-grid-1x2-fill me-2"></i> Inicio
            </router-link>
            <router-link :to="{ name: 'SPerfilView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-person-circle me-2"></i> Ver Perfil
            </router-link>
            <router-link :to="{ name: 'SUsuarioView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-people-fill me-2"></i> Usuarios
            </router-link>
            <router-link :to="{ name: 'STemaView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-file-earmark-plus-fill me-2"></i> Registrar Temas
            </router-link>
        </nav>
    </div>
</template>

<style scoped>
/* (Estilos idénticos al del Director) */
.sidebar { width: 250px; background-color: #1a1c1e; color: white; display: flex; flex-direction: column; min-height: 100%; }
.nav-link { color: white; text-decoration: none; font-size: 1rem; transition: background-color 0.2s ease; }
.nav-link:hover { background-color: #0d6efd; color: white; }
.nav-link i { font-size: 1.2rem; }
</style>