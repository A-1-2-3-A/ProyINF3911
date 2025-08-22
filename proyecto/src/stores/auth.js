// src/stores/auth.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'

// 1. IMPORTAMOS NUESTRO CLIENTE DE API CENTRALIZADO
import apiClient from '@/api/axios';

export const useAuthStore = defineStore('auth', () => {
    // --- STATE ---
    // Se inicializa el estado intentando cargar los datos desde localStorage. Esto no cambia.
    const usuario = ref(JSON.parse(localStorage.getItem('usuario')) || null)
    const token = ref(localStorage.getItem('token') || null)

    // --- GETTERS ---
    // Estos tampoco necesitan cambios.
    const isAuthenticated = computed(() => !!token.value && !!usuario.value)
    const userRole = computed(() => usuario.value?.rol || null)
    const authToken = computed(() => token.value)

    // --- ACTIONS ---

    /**
     * Función para iniciar sesión.
     */
    async function login(credenciales) {
        try {
            // 2. LA MEJORA: Se reemplaza la llamada de 'axios.post' por 'apiClient.post'.
            // Ahora la llamada se hace a través de nuestra instancia configurada.
            // La URL es relativa ('/usuarios/login') porque la base ('http://localhost:3000/api')
            // ya está definida en apiClient.
            const response = await apiClient.post('/usuarios/login', {
                usuario: credenciales.usuario,
                clave: credenciales.clave
            })

            const userData = response.data.data
            const userToken = response.data.token

            // El resto de la lógica es la misma: se actualiza el estado y localStorage.
            usuario.value = userData
            token.value = userToken
            localStorage.setItem('usuario', JSON.stringify(userData))
            localStorage.setItem('token', userToken)

            // Redirección por rol
            switch (userData.rol) { // No es necesario toLowerCase() si los roles en la BD son consistentes
                case 'Director': router.push('/director'); break
                case 'Tribunal': router.push('/tribunal'); break
                case 'Secretario': router.push('/secretario'); break
                case 'Estudiante': router.push('/estudiante'); break
                default: router.push('/');
            }

            return true
        } catch (error) {
            console.error('Error en el inicio de sesión:', error.response?.data?.message || error.message)
            logout()
            return false
        }
    }

    /**
     * Función para cerrar sesión. No necesita cambios.
     */
    function logout() {
        usuario.value = null
        token.value = null
        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
        router.push('/login')
    }

    // Funciones y estado que se exponen (sin cambios)
    return {
        usuario,
        token,
        isAuthenticated,
        userRole,
        authToken,
        login,
        logout
    }
})