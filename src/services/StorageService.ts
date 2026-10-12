import type { EstudianteData } from "../models/Estudiante.js";

/**
 * Servicio de persistencia basado en localStorage.
 * Se encarga únicamente de guardar y recuperar datos (no valida ni muestra).
 */
export class StorageService {
  private readonly clave: string;

  constructor(clave: string = "registro-estudiantes") {
    this.clave = clave;
  }

  /** Devuelve la lista completa de estudiantes guardados. */
  obtenerTodos(): EstudianteData[] {
    try {
      const crudo = localStorage.getItem(this.clave);
      if (!crudo) {
        return [];
      }
      const datos = JSON.parse(crudo) as unknown;
      if (!Array.isArray(datos)) {
        return [];
      }
      return datos.filter((item): item is EstudianteData => this.esEstudiante(item));
    } catch (error) {
      console.error("No se pudo leer el almacenamiento:", error);
      return [];
    }
  }

  /** Sobrescribe la lista completa de estudiantes. */
  guardarTodos(estudiantes: EstudianteData[]): void {
    try {
      localStorage.setItem(this.clave, JSON.stringify(estudiantes));
    } catch (error) {
      console.error("No se pudo guardar en el almacenamiento:", error);
      throw new Error("No se pudieron guardar los datos en el navegador.");
    }
  }

  /** Elimina todos los datos almacenados. */
  limpiar(): void {
    localStorage.removeItem(this.clave);
  }

  private esEstudiante(valor: unknown): valor is EstudianteData {
    if (typeof valor !== "object" || valor === null) {
      return false;
    }
    const candidato = valor as Record<string, unknown>;
    return (
      typeof candidato.id === "string" &&
      typeof candidato.codigo === "string" &&
      typeof candidato.nombre === "string" &&
      typeof candidato.carrera === "string"
    );
  }
}
