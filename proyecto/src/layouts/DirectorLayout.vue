<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import BLDirector from '../components/BLDirector.vue';
</script>

<template>
    <div class="d-flex flex-column min-vh-100">
        <Header />
        <div class="d-flex flex-grow-1 w-100">
            <aside class="sidebar bg-dark text-white">
                <BLDirector />
            </aside>
            <div class="main-content-wrapper flex-grow-1">
                <main class="p-4 bg-light">
                    <RouterView />
                </main>
            </div>
        </div>
        <Footer />
    </div>
</template>

<style scoped>
.sidebar {
    width: 250px;
    flex-shrink: 0;
}
.main-content-wrapper {
    overflow-y: auto;
}
</style>