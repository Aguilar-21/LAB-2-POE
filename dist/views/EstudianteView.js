/**
 * Vista: es la única clase que conoce el DOM.
 * No aplica reglas de negocio ni accede al almacenamiento.
 */
export class EstudianteView {
    constructor() {
        this.temporizador = null;
        this.form = this.obtener("form-estudiante");
        this.inputCodigo = this.obtener("codigo");
        this.inputNombre = this.obtener("nombre");
        this.selectCarrera = this.obtener("carrera");
        this.btnGuardar = this.obtener("btn-guardar");
        this.btnCancelar = this.obtener("btn-cancelar");
        this.cajaMensaje = this.obtener("mensaje");
        this.busqueda = this.obtener("busqueda");
        this.cuerpoTabla = this.obtener("cuerpo-tabla");
        this.sinResultados = this.obtener("sin-resultados");
        this.contador = this.obtener("contador");
        this.errorCodigo = this.obtener("error-codigo");
        this.errorNombre = this.obtener("error-nombre");
        this.errorCarrera = this.obtener("error-carrera");
    }
    // ---------- Enlace de eventos ----------
    alEnviar(manejador) {
        this.form.addEventListener("submit", (evento) => {
            evento.preventDefault();
            manejador(this.obtenerDatos());
        });
    }
    alBuscar(manejador) {
        this.busqueda.addEventListener("input", () => {
            manejador(this.busqueda.value);
        });
    }
    alCancelar(manejador) {
        this.btnCancelar.addEventListener("click", () => manejador());
    }
    alEditar(manejador) {
        this.alHacerClicEnAccion("editar", manejador);
    }
    alEliminar(manejador) {
        this.alHacerClicEnAccion("eliminar", manejador);
    }
    alHacerClicEnAccion(accion, manejador) {
        this.cuerpoTabla.addEventListener("click", (evento) => {
            const objetivo = evento.target;
            const boton = objetivo.closest(`button[data-accion="${accion}"]`);
            if (!boton) {
                return;
            }
            const id = boton.dataset.id;
            if (id) {
                manejador(id);
            }
        });
    }
    // ---------- Formulario ----------
    obtenerDatos() {
        return {
            codigo: this.inputCodigo.value,
            nombre: this.inputNombre.value,
            carrera: this.selectCarrera.value,
        };
    }
    limpiarFormulario() {
        this.form.reset();
        this.limpiarErrores();
        this.inputCodigo.focus();
    }
    llenarFormulario(estudiante) {
        this.inputCodigo.value = estudiante.codigo;
        this.inputNombre.value = estudiante.nombre;
        this.selectCarrera.value = estudiante.carrera;
        this.limpiarErrores();
        this.inputCodigo.focus();
    }
    modoEdicion(activo) {
        this.btnGuardar.textContent = activo ? "Guardar cambios" : "Registrar";
        this.btnCancelar.classList.toggle("oculto", !activo);
    }
    mostrarErrores(errores) {
        this.limpiarErrores();
        if (errores.codigo) {
            this.errorCodigo.textContent = errores.codigo;
            this.inputCodigo.classList.add("invalido");
        }
        if (errores.nombre) {
            this.errorNombre.textContent = errores.nombre;
            this.inputNombre.classList.add("invalido");
        }
        if (errores.carrera) {
            this.errorCarrera.textContent = errores.carrera;
            this.selectCarrera.classList.add("invalido");
        }
    }
    limpiarErrores() {
        this.errorCodigo.textContent = "";
        this.errorNombre.textContent = "";
        this.errorCarrera.textContent = "";
        this.inputCodigo.classList.remove("invalido");
        this.inputNombre.classList.remove("invalido");
        this.selectCarrera.classList.remove("invalido");
    }
    // ---------- Mensajes ----------
    mostrarMensaje(texto, tipo = "info", autoOcultarMs = 3500) {
        if (this.temporizador !== null) {
            window.clearTimeout(this.temporizador);
            this.temporizador = null;
        }
        this.cajaMensaje.textContent = texto;
        this.cajaMensaje.className = `mensaje ${tipo}`;
        if (autoOcultarMs > 0) {
            this.temporizador = window.setTimeout(() => this.ocultarMensaje(), autoOcultarMs);
        }
    }
    ocultarMensaje() {
        this.cajaMensaje.textContent = "";
        this.cajaMensaje.className = "mensaje oculto";
    }
    confirmar(texto) {
        return window.confirm(texto);
    }
    textoBusqueda() {
        return this.busqueda.value;
    }
    // ---------- Tabla ----------
    render(estudiantes, total) {
        this.cuerpoTabla.innerHTML = "";
        this.contador.textContent = `${total} ${total === 1 ? "registro" : "registros"}`;
        if (estudiantes.length === 0) {
            this.sinResultados.classList.remove("oculto");
            return;
        }
        this.sinResultados.classList.add("oculto");
        const fragmento = document.createDocumentFragment();
        for (const estudiante of estudiantes) {
            fragmento.appendChild(this.crearFila(estudiante));
        }
        this.cuerpoTabla.appendChild(fragmento);
    }
    crearFila(estudiante) {
        const fila = document.createElement("tr");
        fila.appendChild(this.crearCelda(estudiante.codigo));
        fila.appendChild(this.crearCelda(estudiante.nombre));
        fila.appendChild(this.crearCelda(estudiante.carrera));
        const celdaAcciones = document.createElement("td");
        const contenedor = document.createElement("div");
        contenedor.className = "acciones-fila";
        contenedor.appendChild(this.crearBoton("editar", estudiante.id, "Editar"));
        contenedor.appendChild(this.crearBoton("eliminar", estudiante.id, "Eliminar"));
        celdaAcciones.appendChild(contenedor);
        fila.appendChild(celdaAcciones);
        return fila;
    }
    crearCelda(texto) {
        const celda = document.createElement("td");
        celda.textContent = texto;
        return celda;
    }
    crearBoton(accion, id, etiqueta) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = `btn-${accion}`;
        boton.dataset.accion = accion;
        boton.dataset.id = id;
        boton.textContent = etiqueta;
        return boton;
    }
    obtener(id) {
        const elemento = document.getElementById(id);
        if (!elemento) {
            throw new Error(`No se encontró el elemento con id "${id}" en el HTML.`);
        }
        return elemento;
    }
}
//# sourceMappingURL=EstudianteView.js.map