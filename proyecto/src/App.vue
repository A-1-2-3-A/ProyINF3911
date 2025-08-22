<script setup>
import { RouterView } from 'vue-router';
import Modal from '@/components/Modal.vue'; // Importa el nuevo componente
</script>

<template>
    <RouterView />
    <Modal /> <!-- Añade el componente del modal aquí -->
</template>