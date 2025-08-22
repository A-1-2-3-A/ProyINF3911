// utils/auth.js
let usuarioActual = null

export function login(usuario, clave, usuarios) {
    const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave && u.estado)
    if (encontrado) {
        usuarioActual = encontrado
        localStorage.setItem('usuario', JSON.stringify(encontrado)) // Persistencia
        return encontrado
    }
    return null
}

export function logout() {
    usuarioActual = null
    localStorage.removeItem('usuario')
}

export function getUsuarioActual() {
    if (!usuarioActual) {
        const data = localStorage.getItem('usuario')
        if (data) usuarioActual = JSON.parse(data)
    }
    return usuarioActual
}

export function estaAutenticado() {
    return !!getUsuarioActual()
}
