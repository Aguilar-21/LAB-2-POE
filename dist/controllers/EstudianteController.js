import { Estudiante } from "../models/Estudiante.js";
/**
 * Controlador: coordina el modelo, la vista y el servicio de almacenamiento.
 * Contiene las reglas de negocio (CRUD y validación de códigos duplicados).
 */
export class EstudianteController {
    constructor(vista, almacenamiento) {
        this.vista = vista;
        this.almacenamiento = almacenamiento;
        this.estudiantes = [];
        this.idEnEdicion = null;
    }
    iniciar() {
        this.cargar();
        this.conectarEventos();
        this.refrescar();
        this.vista.mostrarMensaje("Bienvenido al registro de estudiantes.", "info");
    }
    conectarEventos() {
        this.vista.alEnviar((datos) => this.guardar(datos));
        this.vista.alBuscar(() => this.refrescar());
        this.vista.alEditar((id) => this.prepararEdicion(id));
        this.vista.alEliminar((id) => this.eliminar(id));
        this.vista.alCancelar(() => this.cancelarEdicion());
    }
    cargar() {
        this.estudiantes = this.almacenamiento.obtenerTodos().map(Estudiante.desdeDatos);
    }
    persistir() {
        try {
            this.almacenamiento.guardarTodos(this.estudiantes.map((e) => e.toJSON()));
        }
        catch (error) {
            const mensaje = error instanceof Error ? error.message : "Error al guardar.";
            this.vista.mostrarMensaje(mensaje, "error");
        }
    }
    /** Registra un estudiante nuevo o guarda los cambios de uno existente. */
    guardar(datos) {
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
        }
        else {
            this.estudiantes.push(Estudiante.crear(datos.codigo, datos.nombre, datos.carrera));
            this.persistir();
            this.refrescar();
            this.vista.mostrarMensaje("Estudiante registrado correctamente.", "exito");
        }
        this.salirModoEdicion();
    }
    existeCodigo(codigo, ignorarId) {
        const normalizado = codigo.trim().toLowerCase();
        return this.estudiantes.some((e) => e.codigo.toLowerCase() === normalizado && e.id !== ignorarId);
    }
    prepararEdicion(id) {
        const estudiante = this.estudiantes.find((e) => e.id === id);
        if (!estudiante) {
            return;
        }
        this.idEnEdicion = id;
        this.vista.llenarFormulario(estudiante.toJSON());
        this.vista.modoEdicion(true);
        this.vista.mostrarMensaje("Editando estudiante: modifica los datos y guarda.", "info");
    }
    eliminar(id) {
        const estudiante = this.estudiantes.find((e) => e.id === id);
        if (!estudiante) {
            return;
        }
        const confirmado = this.vista.confirmar(`¿Eliminar a "${estudiante.nombre}" (${estudiante.codigo})?`);
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
    buscarFiltrados() {
        const texto = this.vista.textoBusqueda().trim().toLowerCase();
        if (texto.length === 0) {
            return this.estudiantes;
        }
        return this.estudiantes.filter((e) => e.codigo.toLowerCase().includes(texto) || e.nombre.toLowerCase().includes(texto));
    }
    refrescar() {
        const filtrados = this.buscarFiltrados().map((e) => e.toJSON());
        this.vista.render(filtrados, this.estudiantes.length);
    }
}
//# sourceMappingURL=EstudianteController.js.map