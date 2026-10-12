export class Estudiante {
    constructor(id, codigo, nombre, carrera) {
        this.id = id;
        this.codigo = codigo.trim();
        this.nombre = nombre.trim();
        this.carrera = carrera.trim();
    }
    /** Crea un nuevo estudiante generando su id y normalizando datos. */
    static crear(codigo, nombre, carrera) {
        return new Estudiante(Estudiante.generarId(), codigo, nombre, carrera);
    }
    /** Reconstruye un estudiante a partir de los datos guardados. */
    static desdeDatos(data) {
        return new Estudiante(data.id, data.codigo, data.nombre, data.carrera);
    }
    /** Valida los campos del estudiante y devuelve los errores encontrados. */
    static validar(codigo, nombre, carrera) {
        const errores = {};
        const codigoLimpio = codigo.trim();
        const nombreLimpio = nombre.trim();
        const carreraLimpia = carrera.trim();
        if (codigoLimpio.length === 0) {
            errores.codigo = "El código es obligatorio.";
        }
        else if (!/^[A-Za-z0-9-]{3,15}$/.test(codigoLimpio)) {
            errores.codigo = "El código debe tener de 3 a 15 caracteres (letras, números o guiones).";
        }
        if (nombreLimpio.length === 0) {
            errores.nombre = "El nombre es obligatorio.";
        }
        else if (nombreLimpio.length < 3) {
            errores.nombre = "El nombre debe tener al menos 3 caracteres.";
        }
        else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñÜü\s'.-]+$/.test(nombreLimpio)) {
            errores.nombre = "El nombre solo puede contener letras y espacios.";
        }
        if (carreraLimpia.length === 0) {
            errores.carrera = "La carrera es obligatoria.";
        }
        return errores;
    }
    /** Indica si hay al menos un error de validación. */
    static tieneErrores(errores) {
        return Object.keys(errores).length > 0;
    }
    /** Actualiza los datos editables del estudiante. */
    actualizar(codigo, nombre, carrera) {
        this.codigo = codigo.trim();
        this.nombre = nombre.trim();
        this.carrera = carrera.trim();
    }
    /** Serializa el estudiante para guardarlo o enviarlo a la vista. */
    toJSON() {
        return {
            id: this.id,
            codigo: this.codigo,
            nombre: this.nombre,
            carrera: this.carrera,
        };
    }
    static generarId() {
        if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
            return crypto.randomUUID();
        }
        return "est-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }
}
//# sourceMappingURL=Estudiante.js.map