import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModalStore = defineStore('modal', () => {
    // --- ESTADO ---
    const isVisible = ref(false);
    const title = ref('');
    const message = ref('');
    const type = ref('info'); // Puede ser 'info', 'success', 'error', 'warning'

    // --- ACCIONES ---
    /**
     * Muestra el modal con los detalles proporcionados.
     * @param {object} modalDetails - { title: string, message: string, type: string }
     */
    function showModal(modalDetails) {
        title.value = modalDetails.title || 'Atención';
        message.value = modalDetails.message || '';
        type.value = modalDetails.type || 'info';
        isVisible.value = true;
    }

    /**
     * Oculta el modal.
     */
    function hideModal() {
        isVisible.value = false;
    }

    return {
        isVisible,
        title,
        message,
        type,
        showModal,
        hideModal
    };
});