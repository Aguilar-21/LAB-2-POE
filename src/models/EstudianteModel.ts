import {
  Estudiante,
  type EstudianteData,
  type EstudianteEntrada,
} from "./Estudiante.js";

export interface ConteoPorCarrera {
  carrera: string;
  total: number;
}

export type CriterioOrden = "ninguno" | "nombre" | "codigo";

export interface Filtros {
  texto?: string;
  carrera?: string;
  orden?: CriterioOrden;
}

/**
 * Modelo de colección: administra el conjunto de estudiantes en memoria.
 * Aplica las operaciones de negocio (CRUD, filtros, orden, conteos y exportación)
 * sin conocer el DOM ni el almacenamiento.
 */
export class EstudianteModel {
  private estudiantes: Estudiante[] = [];

  /** Reemplaza la colección con los datos cargados desde el almacenamiento. */
  cargar(datos: EstudianteData[]): void {
    this.estudiantes = datos.map(Estudiante.desdeDatos);
  }

  get total(): number {
    return this.estudiantes.length;
  }

  obtenerTodos(): Estudiante[] {
    return [...this.estudiantes];
  }

  obtenerDatos(): EstudianteData[] {
    return this.estudiantes.map((e) => e.toJSON());
  }

  buscarPorId(id: string): Estudiante | undefined {
    return this.estudiantes.find((e) => e.id === id);
  }

  /** Agrega un estudiante nuevo a la colección. */
  agregar(estudiante: Estudiante): void {
    this.estudiantes.push(estudiante);
  }

  /** Actualiza un estudiante existente. Devuelve el estudiante o undefined. */
  updateEstudiante(id: string, entrada: EstudianteEntrada): Estudiante | undefined {
    const estudiante = this.buscarPorId(id);
    if (!estudiante) {
      return undefined;
    }
    estudiante.actualizar(entrada);
    return estudiante;
  }

  /** Elimina un estudiante. Devuelve true si se eliminó alguno. */
  deleteEstudiante(id: string): boolean {
    const antes = this.estudiantes.length;
    this.estudiantes = this.estudiantes.filter((e) => e.id !== id);
    return this.estudiantes.length < antes;
  }

  /** Comprueba si un código ya existe (ignorando un id al editar). */
  existeCodigo(codigo: string, ignorarId?: string): boolean {
    const normalizado = codigo.trim().toLowerCase();
    return this.estudiantes.some(
      (e) => e.codigo.toLowerCase() === normalizado && e.id !== ignorarId
    );
  }

  /** Comprueba si un correo ya existe (ignorando un id al editar). */
  existeEmail(email: string, ignorarId?: string): boolean {
    const normalizado = email.trim().toLowerCase();
    return this.estudiantes.some(
      (e) => e.email.toLowerCase() === normalizado && e.id !== ignorarId
    );
  }

  /** Filtra por carrera. Si la carrera está vacía devuelve la lista base. */
  filterByCarrera(carrera: string, base?: Estudiante[]): Estudiante[] {
    const lista = base ?? this.estudiantes;
    if (!carrera) {
      return [...lista];
    }
    return lista.filter((e) => e.carrera === carrera);
  }

  /** Busca por código, nombre o correo. */
  buscar(texto: string, base?: Estudiante[]): Estudiante[] {
    const lista = base ?? this.estudiantes;
    const t = texto.trim().toLowerCase();
    if (!t) {
      return [...lista];
    }
    return lista.filter(
      (e) =>
        e.codigo.toLowerCase().includes(t) ||
        e.nombre.toLowerCase().includes(t) ||
        e.email.toLowerCase().includes(t)
    );
  }

  /** Ordena alfabéticamente por nombre. */
  sortByNombre(base?: Estudiante[]): Estudiante[] {
    return [...(base ?? this.estudiantes)].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );
  }

  /** Ordena por código (con criterio numérico natural). */
  sortByCodigo(base?: Estudiante[]): Estudiante[] {
    return [...(base ?? this.estudiantes)].sort((a, b) =>
      a.codigo.localeCompare(b.codigo, "es", { numeric: true })
    );
  }

  /** Aplica búsqueda + filtro por carrera + orden de forma combinada. */
  consultar(filtros: Filtros): Estudiante[] {
    let lista = this.buscar(filtros.texto ?? "");
    lista = this.filterByCarrera(filtros.carrera ?? "", lista);
    if (filtros.orden === "nombre") {
      lista = this.sortByNombre(lista);
    } else if (filtros.orden === "codigo") {
      lista = this.sortByCodigo(lista);
    }
    return lista;
  }

  /** Devuelve el conteo de estudiantes por carrera. */
  getContadorPorCarrera(): ConteoPorCarrera[] {
    const mapa = new Map<string, number>();
    for (const estudiante of this.estudiantes) {
      mapa.set(estudiante.carrera, (mapa.get(estudiante.carrera) ?? 0) + 1);
    }
    return Array.from(mapa.entries())
      .map(([carrera, total]) => ({ carrera, total }))
      .sort((a, b) => a.carrera.localeCompare(b.carrera, "es"));
  }

  /** Genera el contenido CSV del listado indicado (o de todos). */
  exportarCSV(lista?: Estudiante[]): string {
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

  private escaparCSV(valor: string): string {
    const texto = valor ?? "";
    if (/[",\r\n;]/.test(texto)) {
      return '"' + texto.replace(/"/g, '""') + '"';
    }
    return texto;
  }
}
