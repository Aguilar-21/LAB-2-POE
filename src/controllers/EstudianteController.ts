import {
  Estudiante,
  type ErroresValidacion,
  type EstudianteEntrada,
} from "../models/Estudiante.js";
import { EstudianteModel } from "../models/EstudianteModel.js";
import { EstudianteView } from "../views/EstudianteView.js";
import { StorageService } from "../services/StorageService.js";

/**
 * Controlador: coordina el modelo, la vista y el servicio de almacenamiento.
 * Contiene las reglas de negocio (CRUD, validaciones y filtros combinados).
 */
export class EstudianteController {
  private idEnEdicion: string | null = null;

  constructor(
    private readonly vista: EstudianteView,
    private readonly modelo: EstudianteModel,
    private readonly almacenamiento: StorageService
  ) {}

  iniciar(): void {
    this.cargar();
    this.conectarEventos();
    this.refrescar();
    this.vista.mostrarMensaje("Bienvenido al registro de estudiantes.", "info");
  }

  private conectarEventos(): void {
    this.vista.alEnviar((entrada) => this.guardar(entrada));
    this.vista.alBuscar(() => this.refrescar());
    this.vista.alFiltrarCarrera(() => this.refrescar());
    this.vista.alOrdenar(() => this.refrescar());
    this.vista.alEditar((id) => this.handleUpdate(id));
    this.vista.alEliminar((id) => this.handleDelete(id));
    this.vista.alVerCredencial((id) => this.handleCredencial(id));
    this.vista.alExportar(() => this.handleExport());
    this.vista.alCancelar(() => this.cancelarEdicion());
  }

  private cargar(): void {
    this.modelo.cargar(this.almacenamiento.obtenerTodos());
  }

  private persistir(): void {
    try {
      this.almacenamiento.guardarTodos(this.modelo.obtenerDatos());
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error al guardar.";
      this.vista.mostrarMensaje(mensaje, "error");
    }
  }

  /** Registra un estudiante nuevo o actualiza uno existente. */
  private guardar(entrada: EstudianteEntrada): void {
    const errores: ErroresValidacion = Estudiante.validar(entrada);
    const ignorarId = this.idEnEdicion ?? undefined;

    if (this.modelo.existeCodigo(entrada.codigo, ignorarId)) {
      errores.codigo = `El código "${entrada.codigo.trim()}" ya está registrado.`;
    }
    if (this.modelo.existeEmail(entrada.email, ignorarId)) {
      errores.email = `El correo "${entrada.email.trim()}" ya está registrado.`;
    }

    if (Estudiante.tieneErrores(errores)) {
      this.vista.mostrarErrores(errores);
      this.vista.mostrarMensaje("Revisa los campos marcados en rojo.", "error");
      return;
    }
    this.vista.limpiarErrores();

    if (this.idEnEdicion) {
      const actualizado = this.modelo.updateEstudiante(this.idEnEdicion, entrada);
      if (actualizado) {
        this.persistir();
        this.refrescar();
        this.vista.mostrarMensaje("Estudiante actualizado correctamente.", "exito");
      }
    } else {
      this.modelo.agregar(Estudiante.crear(entrada));
      this.persistir();
      this.refrescar();
      this.vista.mostrarMensaje("Estudiante registrado correctamente.", "exito");
    }

    this.salirModoEdicion();
  }

  /** Maneja la edición: carga el estudiante en el formulario. */
  private handleUpdate(id: string): void {
    const estudiante = this.modelo.buscarPorId(id);
    if (!estudiante) {
      return;
    }
    this.idEnEdicion = id;
    this.vista.llenarFormulario(estudiante.toJSON());
    this.vista.modoEdicion(true);
    this.vista.mostrarMensaje("Editando estudiante: modifica los datos y guarda.", "info");
  }

  /** Maneja la eliminación con confirmación previa. */
  private handleDelete(id: string): void {
    const estudiante = this.modelo.buscarPorId(id);
    if (!estudiante) {
      return;
    }
    const confirmado = this.vista.confirmar(
      `¿Eliminar a "${estudiante.nombre}" (${estudiante.codigo})?`
    );
    if (!confirmado) {
      return;
    }

    this.modelo.deleteEstudiante(id);
    if (this.idEnEdicion === id) {
      this.salirModoEdicion();
    }
    this.persistir();
    this.refrescar();
    this.vista.mostrarMensaje("Estudiante eliminado correctamente.", "exito");
  }

  /** Exporta el listado actual (según filtros) a un archivo CSV. */
  private handleExport(): void {
    const lista = this.modelo.consultar(this.filtrosActuales());
    if (lista.length === 0) {
      this.vista.mostrarMensaje("No hay estudiantes para exportar.", "error");
      return;
    }
    const csv = this.modelo.exportarCSV(lista);
    const fecha = new Date().toISOString().slice(0, 10);
    this.vista.descargarCSV(`estudiantes_${fecha}.csv`, csv);
    this.vista.mostrarMensaje(`Se exportaron ${lista.length} registros a CSV.`, "exito");
  }

  /** Muestra la credencial con código QR de un estudiante. */
  private handleCredencial(id: string): void {
    const estudiante = this.modelo.buscarPorId(id);
    if (!estudiante) {
      return;
    }
    this.vista.mostrarCredencial(estudiante.toJSON());
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

  private filtrosActuales() {
    return {
      texto: this.vista.textoBusqueda(),
      carrera: this.vista.carreraFiltro(),
      orden: this.vista.criterioOrden(),
    };
  }

  private refrescar(): void {
    const lista = this.modelo.consultar(this.filtrosActuales()).map((e) => e.toJSON());
    this.vista.renderTabla(lista, this.modelo.total);
    this.vista.renderContador(this.modelo.getContadorPorCarrera());
  }
}
