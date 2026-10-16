/**
 * Servicio de persistencia basado en localStorage.
 * Se encarga únicamente de guardar y recuperar datos (no valida ni muestra).
 */
export class StorageService {
    constructor(clave = "registro-estudiantes") {
        this.clave = clave;
    }
    /** Devuelve la lista completa de estudiantes guardados, normalizada. */
    obtenerTodos() {
        try {
            const crudo = localStorage.getItem(this.clave);
            if (!crudo) {
                return [];
            }
            const datos = JSON.parse(crudo);
            if (!Array.isArray(datos)) {
                return [];
            }
            return datos
                .map((item) => this.normalizar(item))
                .filter((item) => item !== null);
        }
        catch (error) {
            console.error("No se pudo leer el almacenamiento:", error);
            return [];
        }
    }
    /** Sobrescribe la lista completa de estudiantes. */
    guardarTodos(estudiantes) {
        try {
            localStorage.setItem(this.clave, JSON.stringify(estudiantes));
        }
        catch (error) {
            console.error("No se pudo guardar en el almacenamiento:", error);
            throw new Error("No se pudieron guardar los datos en el navegador.");
        }
    }
    /** Elimina todos los datos almacenados. */
    limpiar() {
        localStorage.removeItem(this.clave);
    }
    normalizar(valor) {
        if (typeof valor !== "object" || valor === null) {
            return null;
        }
        const candidato = valor;
        if (typeof candidato.id !== "string" ||
            typeof candidato.codigo !== "string" ||
            typeof candidato.nombre !== "string" ||
            typeof candidato.carrera !== "string") {
            return null;
        }
        const anio = Number(candidato.anioIngreso);
        return {
            id: candidato.id,
            codigo: candidato.codigo,
            nombre: candidato.nombre,
            carrera: candidato.carrera,
            anioIngreso: Number.isFinite(anio) && anio > 0 ? anio : new Date().getFullYear(),
            email: typeof candidato.email === "string" ? candidato.email : "",
        };
    }
}
//# sourceMappingURL=StorageService.js.map