// src/api/axios.js

import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// 1. CREACIÓN DE LA INSTANCIA DE AXIOS
// Se configura con la URL base de tu API para no tener que repetirla.
const apiClient = axios.create({
    baseURL: 'http://localhost:5050/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


// 2. INTERCEPTOR DE PETICIÓN (REQUEST)
// Este código se ejecuta ANTES de que cada petición sea enviada a la API.
apiClient.interceptors.request.use(
    (config) => {
        // Obtenemos el store de autenticación
        const authStore = useAuthStore();
        const token = authStore.authToken; // Usamos el getter que creaste

        // Si existe un token, lo añadimos a la cabecera 'Authorization'
        // en el formato 'Bearer'. La API espera este formato.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Devolvemos la configuración modificada para que la petición continúe.
        return config;
    },
    (error) => {
        // Si hay un error al construir la petición, lo rechazamos.
        return Promise.reject(error);
    }
);


// 3. INTERCEPTOR DE RESPUESTA (RESPONSE)
// Este código se ejecuta DESPUÉS de recibir una respuesta de la API.
apiClient.interceptors.response.use(
    // Si la respuesta es exitosa (código 2xx), simplemente la devolvemos.
    (response) => response,

    // Si la respuesta es un error...
    (error) => {
        // Verificamos si el error es por autenticación (401 No Autorizado)
        // o por permisos (403 Prohibido).
        if (error.response && [401, 403].includes(error.response.status)) {
            const authStore = useAuthStore();
            console.error('Error de autenticación o permisos, cerrando sesión.', error.response.data);

            // Llamamos a la acción de logout para limpiar el token y los datos del usuario,
            // y redirigir a la página de login.
            authStore.logout();
        }

        // Devolvemos el error para que pueda ser manejado por el componente que hizo la llamada (ej. en un bloque catch).
        return Promise.reject(error);
    }
);


// 4. EXPORTACIÓN
// Exportamos la instancia de apiClient para poder importarla y usarla en cualquier parte de la aplicación.
export default apiClient;