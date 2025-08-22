<script setup>
</script>

<template>
    <div class="sidebar d-flex flex-column">
        <nav class="nav flex-column mt-3">
            <router-link :to="{ name: 'TPrincipalView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-grid-1x2-fill me-2"></i> Inicio
            </router-link>
            <router-link :to="{ name: 'TPerfilView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-person-circle me-2"></i> Ver Perfil
            </router-link>
            <router-link :to="{ name: 'TTemaView' }" class="nav-link text-white d-flex align-items-center px-3 py-2">
                <i class="bi bi-journal-check me-2"></i> Temas Asignados
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