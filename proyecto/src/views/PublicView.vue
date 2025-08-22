<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (routeName) => {
    router.push({ name: routeName });
}
</script>

<template>
    <div class="main-container">
        <!-- Contenido principal de la página de inicio -->
        <div class="content-wrapper text-center">
            <h1 class="title fw-bold mb-3">Sistema de Gestión de Temas</h1>
            <p class="subtitle mb-5">
                Explore los temas de grado propuestos y conozca a los tribunales encargados de su evaluación.
            </p>
            
            <!-- Tarjetas de Acción -->
            <div class="row g-4 justify-content-center">
                <!-- Tarjeta de Tribunales -->
                <div class="col-lg-5 col-md-6">
                    <div class="action-card" @click="navigateTo('TribunalView')">
                        <div class="card-icon">
                            <i class="bi bi-person-workspace"></i>
                        </div>
                        <h3 class="card-title">Tribunales</h3>
                        <p class="card-text">
                            Conozca al cuerpo docente encargado de evaluar y supervisar los temas propuestos.
                        </p>
                        <span class="card-link">Ver Listado <i class="bi bi-arrow-right-circle"></i></span>
                    </div>
                </div>

                <!-- Tarjeta de Temas -->
                <div class="col-lg-5 col-md-6">
                    <div class="action-card" @click="navigateTo('TemaView')">
                        <div class="card-icon">
                            <i class="bi bi-collection-fill"></i>
                        </div>
                        <h3 class="card-title">Temas Aprobados</h3>
                        <p class="card-text">
                            Explore la lista de temas de grado que ya han sido evaluados y aprobados por los tribunales.
                        </p>
                        <span class="card-link">Explorar Temas <i class="bi bi-arrow-right-circle"></i></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.main-container {
    width: 100%;
    min-height: calc(100vh - 120px); /* Ajusta la altura para dejar espacio al header y footer */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: #f8f9fa; /* Un gris claro y suave */
}

.content-wrapper {
    max-width: 900px;
    animation: fadeIn 1s ease-out;
}

.title {
    font-size: 2.5rem; /* Tamaño de título reducido */
    color: #212529; /* Color de texto oscuro para contraste */
}

.subtitle {
    font-size: 1.15rem;
    color: #6c757d; /* Un gris más suave para el subtítulo */
}

.action-card {
    background-color: #ffffff; /* Tarjetas blancas */
    border: 1px solid #dee2e6; /* Borde sutil */
    border-radius: 15px;
    padding: 2.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
    color: #212529;
    height: 100%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.action-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.1);
    border-color: #0d6efd;
}

.card-icon {
    font-size: 3rem;
    color: #0d6efd;
    margin-bottom: 1rem;
}

.card-title {
    font-weight: bold;
    margin-bottom: 0.75rem;
}

.card-text {
    color: #6c757d;
    font-size: 1rem;
    margin-bottom: 1.5rem;
}

.card-link {
    font-weight: 500;
    color: #0d6efd;
    text-decoration: none;
    display: inline-block;
}

/* Animaciones */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>