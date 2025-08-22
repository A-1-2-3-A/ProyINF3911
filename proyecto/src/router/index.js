import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import PublicoLayout from '@/layouts/PublicoLayout.vue'
import DirectorLayout from '@/layouts/DirectorLayout.vue'
import TribunalLayout from '@/layouts/TribunalLayout.vue'
import SecretarioLayout from '@/layouts/SecretarioLayout.vue'
import EstudianteLayout from '@/layouts/EstudianteLayout.vue'

import PublicView from '@/views/PublicView.vue'
import LoginView from '@/views/LoginView.vue'
import TribunalView from '@/views/TribunalView.vue'
import TemaView from '@/views/TemaView.vue'

import DPrincipalView from '@/views/director/PrincipalView.vue'
import DPerfilView from '@/views/director/PerfilView.vue'
import DUsuarioView from '@/views/director/UsuarioView.vue'
import DUsuarioAdicionarView from '@/views/director/UsuarioAdicionarView.vue'
import DUsuarioModificarView from '@/views/director/UsuarioModificarView.vue'
import DTribunalView from '@/views/director/TribunalView.vue'
import DDesTribunalView from '@/views/director/DesTribunalView.vue'
import DTribunalDetalleView from '@/views/director/TribunalDetalleView.vue'
import DTemaView from '@/views/director/TemaView.vue'
import DTemaDetalleView from '@/views/director/TemaDetalleView.vue'
import DEspecialidadView from '@/views/director/EspecialidadView.vue'

import TPrincipalView from '@/views/tribunal/PrincipalView.vue'
import TPerfilView from '@/views/tribunal/PerfilView.vue'
import TTemaView from '@/views/tribunal/TemaView.vue'
import TTemaGestionView from '@/views/tribunal/TemaGestionView.vue'

import SPrincipalView from '@/views/secretario/PrincipalView.vue'
import SPerfilView from '@/views/secretario/PerfilView.vue'
import SUsuarioView from '@/views/secretario/UsuarioView.vue'
import SUsuarioAdicionarView from '@/views/secretario/UsuarioAdicionarView.vue'
import SUsuarioModificarView from '@/views/secretario/UsuarioModificarView.vue'
import STemaView from '@/views/secretario/TemaView.vue'
import STemaAdicionarView from '@/views/secretario/TemaAdicionarView.vue'
import STemaModificarView from '@/views/secretario/TemaModificarView.vue'


import EPrincipalView from '@/views/estudiante/PrincipalView.vue'
import EPerfilView from '@/views/estudiante/PerfilView.vue'
import ETemaView from '@/views/estudiante/TemaView.vue'
import ETemaGestionView from '@/views/estudiante/TemaGestionView.vue'
import ETemaTribunalView from '@/views/estudiante/TemaTribunalView.vue'

// import { getUsuarioActual } from '@/utils/auth.js' // Ya no se necesita para la revisión

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: PublicoLayout,
            children: [
                {
                    path: '',
                    name: 'PublicView',
                    component: PublicView,
                },
                {
                    path: 'login',
                    name: 'LoginView',
                    component: LoginView,
                },
                {
                    path: 'tribunales', // URL más limpia
                    name: 'TribunalView',
                    component: TribunalView,
                },
                {
                    path: 'temas', // URL más limpia
                    name: 'TemaView',
                    component: TemaView,
                }
            ],
        },
        {
            path: '/director',
            component: DirectorLayout,
            children: [
                {
                    path: '',
                    name: 'DPrincipalView',
                    component: DPrincipalView,
                },
                {
                    path: 'perfil',
                    name: 'DPerfilView',
                    component: DPerfilView,
                },
                {
                    path: 'usuarios', // URL más limpia
                    name: 'DUsuarioView',
                    component: DUsuarioView,
                },
                {
                    path: 'usuarios/adicionar', // URL más limpia
                    name: 'DUsuarioAdicionarView',
                    component: DUsuarioAdicionarView,
                },
                {
                    path: 'usuarios/:id/modificar', // URL más limpia
                    name: 'DUsuarioModificarView',
                    component: DUsuarioModificarView,
                    props: true,
                },
                {
                    path: 'tribunales', // URL más limpia
                    name: 'DTribunalView',
                    component: DTribunalView,
                },
                {
                    path: 'tribunales/designar', // URL más limpia
                    name: 'DDesTribunalView',
                    component: DDesTribunalView,
                },
                {
                    path: 'tribunales/:id/detalle', // URL más limpia
                    name: 'DTribunalDetalleView',
                    component: DTribunalDetalleView,
                    props: true,
                },
                {
                    path: 'temas', // URL más limpia
                    name: 'DTemaView',
                    component: DTemaView,
                },
                {
                    path: 'temas/:id/detalle', // URL más limpia
                    name: 'DTemaDetalleView',
                    component: DTemaDetalleView,
                    props: true
                },
                {
                    path: 'especialidades', // URL más limpia
                    name: 'DEspecialidadView',
                    component: DEspecialidadView,
                    meta: { roles: ['Director', 'Secretario'] }
                },
            ],
        },
        {
            path: '/tribunal',
            component: TribunalLayout,
            children: [
                {
                    path: '',
                    name: 'TPrincipalView',
                    component: TPrincipalView,
                },
                {
                    path: 'perfil',
                    name: 'TPerfilView',
                    component: TPerfilView,
                },
                {
                    path: 'temas', // URL más limpia
                    name: 'TTemaView',
                    component: TTemaView,
                },
                {
                    path: 'temas/:id/gestion', // URL más limpia
                    name: 'TTemaGestionView',
                    component: TTemaGestionView,
                    props: true,
                },
            ],
        },
        {
            path: '/secretario',
            component: SecretarioLayout,
            children: [
                {
                    path: '',
                    name: 'SPrincipalView',
                    component: SPrincipalView,
                },
                {
                    path: 'perfil',
                    name: 'SPerfilView',
                    component: SPerfilView,
                },
                {
                    path: 'usuarios', // URL más limpia
                    name: 'SUsuarioView',
                    component: SUsuarioView,
                },
                {
                    path: 'usuarios/adicionar', // URL más limpia
                    name: 'SUsuarioAdicionarView',
                    component: SUsuarioAdicionarView,
                },
                {
                    path: 'usuarios/:id/modificar', // URL más limpia
                    name: 'SUsuarioModificarView',
                    component: SUsuarioModificarView,
                    props: true,
                },
                {
                    path: 'temas', // URL más limpia
                    name: 'STemaView',
                    component: STemaView,
                },
                {
                    path: 'temas/adicionar', // URL más limpia
                    name: 'STemaAdicionarView',
                    component: STemaAdicionarView,
                },
                {
                    path: 'temas/:id/modificar', // URL más limpia
                    name: 'STemaModificarView',
                    component: STemaModificarView,
                    props: true
                },
            ],
        },
        {
            path: '/estudiante',
            component: EstudianteLayout,
            children: [
                {
                    path: '',
                    name: 'EPrincipalView',
                    component: EPrincipalView,
                },
                {
                    path: 'perfil',
                    name: 'EPerfilView',
                    component: EPerfilView,
                },
                {
                    path: 'temas', // URL más limpia
                    name: 'ETemaView',
                    component: ETemaView,
                },
                {
                    path: 'temas/:id/gestion', // URL más limpia
                    name: 'ETemaGestionView',
                    component: ETemaGestionView,
                    props: true,
                },
                {
                    path: 'temas/:temaId/tribunal/:id', // URL más limpia
                    name: 'ETemaTribunalView',
                    component: ETemaTribunalView,
                    props: true,
                }
            ],
        },
    ],
})

router.beforeEach((to, from, next) => {
    // Obtenemos el store de autenticación
    const authStore = useAuthStore();

    // Lista de rutas que NO requieren autenticación
    const rutasPublicas = ['PublicView', 'LoginView', 'TribunalView', 'TemaView'];

    // Verificamos si la ruta a la que se intenta acceder es protegida
    const esRutaProtegida = !rutasPublicas.includes(to.name);

    // SI la ruta es protegida Y el usuario NO está autenticado...
    if (esRutaProtegida && !authStore.isAuthenticated) {
        // ...lo redirigimos a la página de login.
        next({ name: 'LoginView' });
    } else {
        // En cualquier otro caso (ruta pública, o ruta protegida con usuario autenticado),
        // permitimos que la navegación continúe.
        next();
    }
});

export default router