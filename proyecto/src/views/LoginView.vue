<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';

const authStore = useAuthStore();
const modalStore = useModalStore();

const credenciales = ref({
    usuario: '',
    clave: ''
});
const isLoading = ref(false);

// Función que se ejecuta al enviar el formulario
async function iniciarSesion() {
    isLoading.value = true;
    
    // Llama a la acción 'login' del authStore, que ahora usa nuestro apiClient.
    // Toda la lógica de la llamada API, guardado en localStorage y redirección
    // está encapsulada en el store.
    const loginExitoso = await authStore.login(credenciales.value);

    isLoading.value = false;

    // 5. Si la acción del store devuelve 'false', muestra un modal de error.
    // La lógica de error (qué mensaje mostrar) también está en el store,
    // nosotros solo reaccionamos al resultado.
    if (!loginExitoso) {
        modalStore.showModal({
            title: 'Error de Autenticación',
            message: 'El correo electrónico o la contraseña son incorrectos.',
            type: 'error'
        });
    }
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="text-center mb-4">
                <h2 class="login-title">Inicio de Sesión</h2>
            </div>
            <form @submit.prevent="iniciarSesion">
                <div class="mb-3">
                    <label for="usuario" class="form-label">Correo electrónico</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-person"></i></span>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="usuario" 
                            v-model="credenciales.usuario"
                            placeholder="usuario@sistemas.edu.bo" 
                            required 
                        />
                    </div>
                </div>
                <div class="mb-4">
                    <label for="password" class="form-label">Contraseña</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock"></i></span>
                        <input 
                            type="password" 
                            class="form-control" 
                            id="password" 
                            v-model="credenciales.clave"
                            placeholder="Ingrese su contraseña" 
                            required 
                        />
                    </div>
                </div>

                <div class="d-grid mt-4">
                     <button type="submit" class="btn btn-primary" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span v-else>Ingresar</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    padding: 4rem 2rem;
}

.login-card {
    background-color: #212529;
    color: #f8f9fa;
    border-radius: 15px;
    padding: 2.5rem;
    width: 100%;
    max-width: 550px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInScale 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.login-title {
    font-weight: 600;
    letter-spacing: 0.5px;
    font-size: 1.75rem;
    margin: 0;
}

.login-card .form-label {
    color: #adb5bd;
    font-size: 0.9rem;
}

.input-group-text {
    background-color: #343a40;
    border-color: #495057;
    color: #adb5bd;
}

.login-card .form-control {
    background-color: #343a40;
    color: white;
    border: 1px solid #495057;
    padding: 0.75rem 1rem;
}

/* **CORRECCIÓN AQUÍ** */
.login-card .form-control::placeholder {
    color: #6c757d; /* Un color de placeholder más claro y visible */
    opacity: 1; /* Asegura que el navegador no lo haga más transparente */
}

.login-card .form-control:focus {
    background-color: #343a40;
    color: white;
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, .25);
}

.btn-primary {
    background: #0d6efd;
    border: none;
    padding: 0.8rem;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
    background-color: #0b5ed7;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

@keyframes fadeInScale {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>