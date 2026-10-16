import { Estudiante, } from "./Estudiante.js";
/**
 * Modelo de colección: administra el conjunto de estudiantes en memoria.
 * Aplica las operaciones de negocio (CRUD, filtros, orden, conteos y exportación)
 * sin conocer el DOM ni el almacenamiento.
 */
export class EstudianteModel {
    constructor() {
        this.estudiantes = [];
    }
    /** Reemplaza la colección con los datos cargados desde el almacenamiento. */
    cargar(datos) {
        this.estudiantes = datos.map(Estudiante.desdeDatos);
    }
    get total() {
        return this.estudiantes.length;
    }
    obtenerTodos() {
        return [...this.estudiantes];
    }
    obtenerDatos() {
        return this.estudiantes.map((e) => e.toJSON());
    }
    buscarPorId(id) {
        return this.estudiantes.find((e) => e.id === id);
    }
    /** Agrega un estudiante nuevo a la colección. */
    agregar(estudiante) {
        this.estudiantes.push(estudiante);
    }
    /** Actualiza un estudiante existente. Devuelve el estudiante o undefined. */
    updateEstudiante(id, entrada) {
        const estudiante = this.buscarPorId(id);
        if (!estudiante) {
            return undefined;
        }
        estudiante.actualizar(entrada);
        return estudiante;
    }
    /** Elimina un estudiante. Devuelve true si se eliminó alguno. */
    deleteEstudiante(id) {
        const antes = this.estudiantes.length;
        this.estudiantes = this.estudiantes.filter((e) => e.id !== id);
        return this.estudiantes.length < antes;
    }
    /** Comprueba si un código ya existe (ignorando un id al editar). */
    existeCodigo(codigo, ignorarId) {
        const normalizado = codigo.trim().toLowerCase();
        return this.estudiantes.some((e) => e.codigo.toLowerCase() === normalizado && e.id !== ignorarId);
    }
    /** Comprueba si un correo ya existe (ignorando un id al editar). */
    existeEmail(email, ignorarId) {
        const normalizado = email.trim().toLowerCase();
        return this.estudiantes.some((e) => e.email.toLowerCase() === normalizado && e.id !== ignorarId);
    }
    /** Filtra por carrera. Si la carrera está vacía devuelve la lista base. */
    filterByCarrera(carrera, base) {
        const lista = base ?? this.estudiantes;
        if (!carrera) {
            return [...lista];
        }
        return lista.filter((e) => e.carrera === carrera);
    }
    /** Busca por código, nombre o correo. */
    buscar(texto, base) {
        const lista = base ?? this.estudiantes;
        const t = texto.trim().toLowerCase();
        if (!t) {
            return [...lista];
        }
        return lista.filter((e) => e.codigo.toLowerCase().includes(t) ||
            e.nombre.toLowerCase().includes(t) ||
            e.email.toLowerCase().includes(t));
    }
    /** Ordena alfabéticamente por nombre. */
    sortByNombre(base) {
        return [...(base ?? this.estudiantes)].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
    }
    /** Ordena por código (con criterio numérico natural). */
    sortByCodigo(base) {
        return [...(base ?? this.estudiantes)].sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }));
    }
    /** Aplica búsqueda + filtro por carrera + orden de forma combinada. */
    consultar(filtros) {
        let lista = this.buscar(filtros.texto ?? "");
        lista = this.filterByCarrera(filtros.carrera ?? "", lista);
        if (filtros.orden === "nombre") {
            lista = this.sortByNombre(lista);
        }
        else if (filtros.orden === "codigo") {
            lista = this.sortByCodigo(lista);
        }
        return lista;
    }
    /** Devuelve el conteo de estudiantes por carrera. */
    getContadorPorCarrera() {
        const mapa = new Map();
        for (const estudiante of this.estudiantes) {
            mapa.set(estudiante.carrera, (mapa.get(estudiante.carrera) ?? 0) + 1);
        }
        return Array.from(mapa.entries())
            .map(([carrera, total]) => ({ carrera, total }))
            .sort((a, b) => a.carrera.localeCompare(b.carrera, "es"));
    }
    /** Genera el contenido CSV del listado indicado (o de todos). */
    exportarCSV(lista) {
        const encabezado = ["Codigo", "Nombre", "Email", "Carrera", "AnioIngreso"];
        const filas = (lista ?? this.estudiantes).map((e) => [
            e.codigo,
            e.nombre,
            e.email,
            e.carrera,
            String(e.anioIngreso),
        ]);
        return [encabezado, ...filas]
            .map((fila) => fila.map((valor) => this.escaparCSV(valor)).join(","))
            .join("\r\n");
    }
    escaparCSV(valor) {
        const texto = valor ?? "";
        if (/[",\r\n;]/.test(texto)) {
            return '"' + texto.replace(/"/g, '""') + '"';
        }
        return texto;
    }
}
//# sourceMappingURL=EstudianteModel.js.map