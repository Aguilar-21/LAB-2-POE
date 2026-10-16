/** Datos tal como llegan del formulario (todos son cadenas de texto). */
export interface EstudianteEntrada {
  codigo: string;
  nombre: string;
  carrera: string;
  anioIngreso: string;
  email: string;
}

/** Datos persistidos/serializados de un estudiante. */
export interface EstudianteData {
  id: string;
  codigo: string;
  nombre: string;
  carrera: string;
  anioIngreso: number;
  email: string;
}

export interface ErroresValidacion {
  codigo?: string;
  nombre?: string;
  carrera?: string;
  anioIngreso?: string;
  email?: string;
}

/** Catálogo de carreras disponible en los formularios y filtros. */
export const CARRERAS: string[] = [
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Ingeniería Civil",
  "Administración",
  "Contaduría Pública",
  "Derecho",
  "Medicina",
  "Psicología",
  "Enfermería",
  "Arquitectura",
];

/** Año mínimo aceptado para el ingreso. */
export const ANIO_MINIMO = 1950;

const REGEX_CODIGO = /^[A-Za-z0-9-]{3,15}$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÑáéíóúñÜü\s'.-]{3,}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export class Estudiante implements EstudianteData {
  id: string;
  codigo: string;
  nombre: string;
  carrera: string;
  anioIngreso: number;
  email: string;

  constructor(
    id: string,
    codigo: string,
    nombre: string,
    carrera: string,
    anioIngreso: number,
    email: string
  ) {
    this.id = id;
    this.codigo = codigo.trim();
    this.nombre = nombre.trim();
    this.carrera = carrera.trim();
    this.anioIngreso = anioIngreso;
    this.email = email.trim();
  }

  /** Crea un nuevo estudiante generando su id y normalizando datos. */
  static crear(entrada: EstudianteEntrada): Estudiante {
    return new Estudiante(
      Estudiante.generarId(),
      entrada.codigo,
      entrada.nombre,
      entrada.carrera,
      Number(entrada.anioIngreso),
      entrada.email
    );
  }

  /** Reconstruye un estudiante a partir de los datos guardados. */
  static desdeDatos(data: EstudianteData): Estudiante {
    return new Estudiante(
      data.id,
      data.codigo,
      data.nombre,
      data.carrera,
      data.anioIngreso,
      data.email
    );
  }

  /** Año máximo aceptado (el año actual o el siguiente). */
  static anioMaximo(): number {
    return new Date().getFullYear() + 1;
  }

  /** Comprueba el formato de un correo electrónico. */
  static emailValido(email: string): boolean {
    return REGEX_EMAIL.test(email.trim());
  }

  /** Valida los campos del estudiante y devuelve los errores encontrados. */
  static validar(entrada: EstudianteEntrada): ErroresValidacion {
    const errores: ErroresValidacion = {};

    const codigo = entrada.codigo.trim();
    const nombre = entrada.nombre.trim();
    const carrera = entrada.carrera.trim();
    const anioTexto = entrada.anioIngreso.trim();
    const email = entrada.email.trim();

    if (codigo.length === 0) {
      errores.codigo = "El código es obligatorio.";
    } else if (!REGEX_CODIGO.test(codigo)) {
      errores.codigo = "El código debe tener de 3 a 15 caracteres (letras, números o guiones).";
    }

    if (nombre.length === 0) {
      errores.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 3) {
      errores.nombre = "El nombre debe tener al menos 3 caracteres.";
    } else if (!REGEX_NOMBRE.test(nombre)) {
      errores.nombre = "El nombre solo puede contener letras y espacios.";
    }

    if (carrera.length === 0) {
      errores.carrera = "La carrera es obligatoria.";
    }

    if (anioTexto.length === 0) {
      errores.anioIngreso = "El año de ingreso es obligatorio.";
    } else if (!/^\d{4}$/.test(anioTexto)) {
      errores.anioIngreso = "El año de ingreso debe tener 4 dígitos (ej: 2024).";
    } else {
      const anio = Number(anioTexto);
      const maximo = Estudiante.anioMaximo();
      if (anio < ANIO_MINIMO || anio > maximo) {
        errores.anioIngreso = `El año de ingreso debe estar entre ${ANIO_MINIMO} y ${maximo}.`;
      }
    }

    if (email.length === 0) {
      errores.email = "El correo electrónico es obligatorio.";
    } else if (!Estudiante.emailValido(email)) {
      errores.email = "El correo electrónico no tiene un formato válido.";
    }

    return errores;
  }

  /** Indica si hay al menos un error de validación. */
  static tieneErrores(errores: ErroresValidacion): boolean {
    return Object.keys(errores).length > 0;
  }

  /** Actualiza los datos editables del estudiante. */
  actualizar(entrada: EstudianteEntrada): void {
    this.codigo = entrada.codigo.trim();
    this.nombre = entrada.nombre.trim();
    this.carrera = entrada.carrera.trim();
    this.anioIngreso = Number(entrada.anioIngreso);
    this.email = entrada.email.trim();
  }

  /** Serializa el estudiante para guardarlo o enviarlo a la vista. */
  toJSON(): EstudianteData {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      carrera: this.carrera,
      anioIngreso: this.anioIngreso,
      email: this.email,
    };
  }

  private static generarId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return "est-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}
