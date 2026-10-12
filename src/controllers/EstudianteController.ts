import { Estudiante } from "../models/Estudiante.js";
import { EstudianteView, type DatosFormulario } from "../views/EstudianteView.js";
import { StorageService } from "../services/StorageService.js";

/**
 * Controlador: coordina el modelo, la vista y el servicio de almacenamiento.
 * Contiene las reglas de negocio (CRUD y validación de códigos duplicados).
 */
export class EstudianteController {
  private estudiantes: Estudiante[] = [];
  private idEnEdicion: string | null = null;

  constructor(
    private readonly vista: EstudianteView,
    private readonly almacenamiento: StorageService
  ) {}

  iniciar(): void {
    this.cargar();
    this.conectarEventos();
    this.refrescar();
    this.vista.mostrarMensaje("Bienvenido al registro de estudiantes.", "info");
  }

  private conectarEventos(): void {
    this.vista.alEnviar((datos) => this.guardar(datos));
    this.vista.alBuscar(() => this.refrescar());
    this.vista.alEditar((id) => this.prepararEdicion(id));
    this.vista.alEliminar((id) => this.eliminar(id));
    this.vista.alCancelar(() => this.cancelarEdicion());
  }

  private cargar(): void {
    this.estudiantes = this.almacenamiento.obtenerTodos().map(Estudiante.desdeDatos);
  }

  private persistir(): void {
    try {
      this.almacenamiento.guardarTodos(this.estudiantes.map((e) => e.toJSON()));
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error al guardar.";
      this.vista.mostrarMensaje(mensaje, "error");
    }
  }

  /** Registra un estudiante nuevo o guarda los cambios de uno existente. */
  private guardar(datos: DatosFormulario): void {
    const errores = Estudiante.validar(datos.codigo, datos.nombre, datos.carrera);
    if (Estudiante.tieneErrores(errores)) {
      this.vista.mostrarErrores(errores);
      this.vista.mostrarMensaje("Revisa los campos marcados en rojo.", "error");
      return;
    }
    this.vista.limpiarErrores();

    if (this.existeCodigo(datos.codigo, this.idEnEdicion)) {
      this.vista.mostrarErrores({
        codigo: `El código "${datos.codigo.trim()}" ya está registrado.`,
      });
      this.vista.mostrarMensaje("No se permiten códigos duplicados.", "error");
      return;
    }

    if (this.idEnEdicion) {
      const estudiante = this.estudiantes.find((e) => e.id === this.idEnEdicion);
      if (estudiante) {
        estudiante.actualizar(datos.codigo, datos.nombre, datos.carrera);
        this.persistir();
        this.refrescar();
        this.vista.mostrarMensaje("Estudiante actualizado correctamente.", "exito");
      }
    } else {
      this.estudiantes.push(Estudiante.crear(datos.codigo, datos.nombre, datos.carrera));
      this.persistir();
      this.refrescar();
      this.vista.mostrarMensaje("Estudiante registrado correctamente.", "exito");
    }

    this.salirModoEdicion();
  }

  private existeCodigo(codigo: string, ignorarId: string | null): boolean {
    const normalizado = codigo.trim().toLowerCase();
    return this.estudiantes.some(
      (e) => e.codigo.toLowerCase() === normalizado && e.id !== ignorarId
    );
  }

  private prepararEdicion(id: string): void {
    const estudiante = this.estudiantes.find((e) => e.id === id);
    if (!estudiante) {
      return;
    }
    this.idEnEdicion = id;
    this.vista.llenarFormulario(estudiante.toJSON());
    this.vista.modoEdicion(true);
    this.vista.mostrarMensaje("Editando estudiante: modifica los datos y guarda.", "info");
  }

  private eliminar(id: string): void {
    const estudiante = this.estudiantes.find((e) => e.id === id);
    if (!estudiante) {
      return;
    }
    const confirmado = this.vista.confirmar(
      `¿Eliminar a "${estudiante.nombre}" (${estudiante.codigo})?`
    );
    if (!confirmado) {
      return;
    }

    this.estudiantes = this.estudiantes.filter((e) => e.id !== id);
    if (this.idEnEdicion === id) {
      this.salirModoEdicion();
    }
    this.persistir();
    this.refrescar();
    this.vista.mostrarMensaje("Estudiante eliminado correctamente.", "exito");
  }

  private cancelarEdicion(): void {
    if (!this.idEnEdicion) {
      this.vista.limpiarFormulario();
      return;
    }
    this.salirModoEdicion();
    this.vista.mostrarMensaje("Edición cancelada.", "info");
  }

  private salirModoEdicion(): void {
    this.idEnEdicion = null;
    this.vista.modoEdicion(false);
    this.vista.limpiarFormulario();
  }

  private buscarFiltrados(): Estudiante[] {
    const texto = this.vista.textoBusqueda().trim().toLowerCase();
    if (texto.length === 0) {
      return this.estudiantes;
    }
    return this.estudiantes.filter(
      (e) =>
        e.codigo.toLowerCase().includes(texto) || e.nombre.toLowerCase().includes(texto)
    );
  }

  private refrescar(): void {
    const filtrados = this.buscarFiltrados().map((e) => e.toJSON());
    this.vista.render(filtrados, this.estudiantes.length);
  }
}
