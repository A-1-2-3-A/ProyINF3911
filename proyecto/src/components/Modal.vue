<script setup>
import { computed } from 'vue';
import { useModalStore } from '@/stores/modal';

const modalStore = useModalStore();

// Determina el color y la clase del ícono a mostrar
const modalConfig = computed(() => {
    switch (modalStore.type) {
        case 'error':
            return { colorClass: 'text-danger', iconClass: 'bi-x-circle-fill' };
        case 'success':
            return { colorClass: 'text-success', iconClass: 'bi-check-circle-fill' };
        case 'warning':
             return { colorClass: 'text-warning', iconClass: 'bi-exclamation-triangle-fill' };
        default: // info
            return { colorClass: 'text-primary', iconClass: 'bi-info-circle-fill' };
    }
});
</script>

<template>
    <div v-if="modalStore.isVisible" class="modal-backdrop" @click.self="modalStore.hideModal()">
        <div class="modal-card">
            
            <div class="modal-body-content">
                <!-- Ícono central que ahora sí se mostrará -->
                <i class="modal-icon bi" :class="[modalConfig.iconClass, modalConfig.colorClass]"></i>

                <!-- Título del Modal -->
                <h5 class="fw-bold mt-4">{{ modalStore.title }}</h5>
                
                <!-- Mensaje -->
                <p class="mt-2">{{ modalStore.message }}</p>
            </div>
            
            <!-- Botón de Acción -->
            <div class="modal-actions">
                <button type="button" class="btn btn-primary" @click="modalStore.hideModal()">
                    Aceptar
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1055;
    animation: fadeIn 0.2s ease-out;
}

.modal-card {
    background-color: #212529; /* Fondo gris oscuro, casi negro */
    color: #f8f9fa;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    padding: 2rem;
    animation: slideIn 0.3s ease-out;
    border: 1px solid #495057;
}

.modal-body-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.modal-icon {
    font-size: 4.5rem; /* Ícono grande y visible */
    line-height: 1;
}

.modal-body-content h5 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.modal-body-content p {
    font-size: 1rem;
    color: #ced4da;
    margin-bottom: 1.5rem;
}

.modal-actions {
    width: 100%;
    display: flex;
    justify-content: center; /* Centra el botón */
}

.modal-actions .btn {
    width: 60%; /* Ancho del botón más agradable */
    max-width: 220px; /* Ancho máximo para consistencia */
    padding: 0.6rem;
    font-size: 1rem;
    font-weight: 500;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideIn {
  from { transform: scale(0.95) translateY(-10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
</style>