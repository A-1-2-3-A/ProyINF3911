// src/data/historialRevisiones.js
export const historialRevisiones = [
    // Asignación del Tema 1 al Tribunal 2
    {
        idAsignacion: 1,
        idTema: 1,
        idTribunal: 2,
        revisiones: [
            { version: 1, veredicto: 'APROBADO', fecha_veredicto: '2025-06-20', documentoRevisado: { nombre: 'tema_v1_final.pdf', ruta: 'uploads/temas/tema_v1_final.pdf' } }
        ]
    },
    // Asignación del Tema 1 al Tribunal 3
    {
        idAsignacion: 2,
        idTema: 1,
        idTribunal: 3,
        revisiones: [
            { version: 1, veredicto: 'REVISADO', fecha_veredicto: '2025-06-21', documentoRevisado: { nombre: 'tema_v1_final.pdf', ruta: 'uploads/temas/tema_v1_final.pdf' } },
            { version: 2, veredicto: 'APROBADO', fecha_veredicto: '2025-06-25', documentoRevisado: { nombre: 'tema_v2_corregido.pdf', ruta: 'uploads/temas/tema_v2_corregido.pdf' } }
        ]
    },
    // Asignación del Tema 1 al Tribunal 4
    {
        idAsignacion: 3,
        idTema: 1,
        idTribunal: 4,
        revisiones: [
            { version: 1, veredicto: 'APROBADO', fecha_veredicto: '2025-06-19', documentoRevisado: { nombre: 'tema_v1_final.pdf', ruta: 'uploads/temas/tema_v1_final.pdf' } }
        ]
    }
];