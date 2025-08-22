<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
</script>

<template>
    <div class="d-flex flex-column min-vh-100">
        <Header />
        <!-- **CORRECCIÓN**: Se quitan las clases de centrado para que el contenido fluya naturalmente -->
        <main class="flex-grow-1">
            <RouterView />
        </main>
        <Footer />
    </div>
</template>