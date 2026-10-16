import { Estudiante, } from "../models/Estudiante.js";
/**
 * Controlador: coordina el modelo, la vista y el servicio de almacenamiento.
 * Contiene las reglas de negocio (CRUD, validaciones y filtros combinados).
 */
export class EstudianteController {
    constructor(vista, modelo, almacenamiento) {
        this.vista = vista;
        this.modelo = modelo;
        this.almacenamiento = almacenamiento;
        this.idEnEdicion = null;
    }
    iniciar() {
        this.cargar();
        this.conectarEventos();
        this.refrescar();
        this.vista.mostrarMensaje("Bienvenido al registro de estudiantes.", "info");
    }
    conectarEventos() {
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
    cargar() {
        this.modelo.cargar(this.almacenamiento.obtenerTodos());
    }
    persistir() {
        try {
            this.almacenamiento.guardarTodos(this.modelo.obtenerDatos());
        }
        catch (error) {
            const mensaje = error instanceof Error ? error.message : "Error al guardar.";
            this.vista.mostrarMensaje(mensaje, "error");
        }
    }
    /** Registra un estudiante nuevo o actualiza uno existente. */
    guardar(entrada) {
        const errores = Estudiante.validar(entrada);
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
        }
        else {
            this.modelo.agregar(Estudiante.crear(entrada));
            this.persistir();
            this.refrescar();
            this.vista.mostrarMensaje("Estudiante registrado correctamente.", "exito");
        }
        this.salirModoEdicion();
    }
    /** Maneja la edición: carga el estudiante en el formulario. */
    handleUpdate(id) {
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
    handleDelete(id) {
        const estudiante = this.modelo.buscarPorId(id);
        if (!estudiante) {
            return;
        }
        const confirmado = this.vista.confirmar(`¿Eliminar a "${estudiante.nombre}" (${estudiante.codigo})?`);
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
    handleExport() {
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
    handleCredencial(id) {
        const estudiante = this.modelo.buscarPorId(id);
        if (!estudiante) {
            return;
        }
        this.vista.mostrarCredencial(estudiante.toJSON());
    }
    cancelarEdicion() {
        if (!this.idEnEdicion) {
            this.vista.limpiarFormulario();
            return;
        }
        this.salirModoEdicion();
        this.vista.mostrarMensaje("Edición cancelada.", "info");
    }
    salirModoEdicion() {
        this.idEnEdicion = null;
        this.vista.modoEdicion(false);
        this.vista.limpiarFormulario();
    }
    filtrosActuales() {
        return {
            texto: this.vista.textoBusqueda(),
            carrera: this.vista.carreraFiltro(),
            orden: this.vista.criterioOrden(),
        };
    }
    refrescar() {
        const lista = this.modelo.consultar(this.filtrosActuales()).map((e) => e.toJSON());
        this.vista.renderTabla(lista, this.modelo.total);
        this.vista.renderContador(this.modelo.getContadorPorCarrera());
    }
}
//# sourceMappingURL=EstudianteController.js.map