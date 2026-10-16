import { CARRERAS, } from "../models/Estudiante.js";
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
        this.inputEmail = this.obtener("email");
        this.selectCarrera = this.obtener("carrera");
        this.inputAnio = this.obtener("anio-ingreso");
        this.btnGuardar = this.obtener("btn-guardar");
        this.btnCancelar = this.obtener("btn-cancelar");
        this.cajaMensaje = this.obtener("mensaje");
        this.busqueda = this.obtener("busqueda");
        this.filtroCarrera = this.obtener("filtro-carrera");
        this.ordenar = this.obtener("ordenar");
        this.btnExportar = this.obtener("btn-exportar");
        this.cuerpoTabla = this.obtener("cuerpo-tabla");
        this.sinResultados = this.obtener("sin-resultados");
        this.contador = this.obtener("contador");
        this.contadorCarreras = this.obtener("contador-carreras");
        this.modal = this.obtener("modal-credencial");
        this.modalContenido = this.obtener("modal-contenido");
        this.modalQr = this.obtener("modal-qr");
        this.modalCerrar = this.obtener("modal-cerrar");
        this.errorCodigo = this.obtener("error-codigo");
        this.errorNombre = this.obtener("error-nombre");
        this.errorEmail = this.obtener("error-email");
        this.errorCarrera = this.obtener("error-carrera");
        this.errorAnio = this.obtener("error-anio");
        this.poblarCarreras();
        this.conectarCierreCredencial();
    }
    // ---------- Enlace de eventos ----------
    alEnviar(manejador) {
        this.form.addEventListener("submit", (evento) => {
            evento.preventDefault();
            manejador(this.obtenerDatos());
        });
    }
    alBuscar(manejador) {
        this.busqueda.addEventListener("input", () => manejador());
    }
    alFiltrarCarrera(manejador) {
        this.filtroCarrera.addEventListener("change", () => manejador());
    }
    alOrdenar(manejador) {
        this.ordenar.addEventListener("change", () => manejador());
    }
    alExportar(manejador) {
        this.btnExportar.addEventListener("click", () => manejador());
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
    alVerCredencial(manejador) {
        this.alHacerClicEnAccion("credencial", manejador);
    }
    conectarCierreCredencial() {
        this.modalCerrar.addEventListener("click", () => this.cerrarCredencial());
        this.modal.addEventListener("click", (evento) => {
            if (evento.target === this.modal) {
                this.cerrarCredencial();
            }
        });
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !this.modal.classList.contains("oculto")) {
                this.cerrarCredencial();
            }
        });
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
            email: this.inputEmail.value,
            carrera: this.selectCarrera.value,
            anioIngreso: this.inputAnio.value,
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
        this.inputEmail.value = estudiante.email;
        this.selectCarrera.value = estudiante.carrera;
        this.inputAnio.value = String(estudiante.anioIngreso);
        this.limpiarErrores();
        this.inputCodigo.focus();
    }
    modoEdicion(activo) {
        this.btnGuardar.textContent = activo ? "Actualizar" : "Registrar";
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
        if (errores.email) {
            this.errorEmail.textContent = errores.email;
            this.inputEmail.classList.add("invalido");
        }
        if (errores.carrera) {
            this.errorCarrera.textContent = errores.carrera;
            this.selectCarrera.classList.add("invalido");
        }
        if (errores.anioIngreso) {
            this.errorAnio.textContent = errores.anioIngreso;
            this.inputAnio.classList.add("invalido");
        }
    }
    limpiarErrores() {
        this.errorCodigo.textContent = "";
        this.errorNombre.textContent = "";
        this.errorEmail.textContent = "";
        this.errorCarrera.textContent = "";
        this.errorAnio.textContent = "";
        this.inputCodigo.classList.remove("invalido");
        this.inputNombre.classList.remove("invalido");
        this.inputEmail.classList.remove("invalido");
        this.selectCarrera.classList.remove("invalido");
        this.inputAnio.classList.remove("invalido");
    }
    // ---------- Filtros ----------
    textoBusqueda() {
        return this.busqueda.value;
    }
    carreraFiltro() {
        return this.filtroCarrera.value;
    }
    criterioOrden() {
        const valor = this.ordenar.value;
        return valor === "nombre" || valor === "codigo" ? valor : "ninguno";
    }
    poblarCarreras() {
        for (const select of [this.selectCarrera, this.filtroCarrera]) {
            const textoInicial = select === this.selectCarrera ? "-- Seleccione --" : "Todas las carreras";
            select.innerHTML = "";
            const inicial = document.createElement("option");
            inicial.value = "";
            inicial.textContent = textoInicial;
            select.appendChild(inicial);
            for (const carrera of CARRERAS) {
                const opcion = document.createElement("option");
                opcion.value = carrera;
                opcion.textContent = carrera;
                select.appendChild(opcion);
            }
        }
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
    // ---------- Tabla ----------
    renderTabla(estudiantes, total) {
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
    renderContador(conteos) {
        this.contadorCarreras.innerHTML = "";
        if (conteos.length === 0) {
            return;
        }
        const titulo = document.createElement("span");
        titulo.className = "conteo-titulo";
        titulo.textContent = "Por carrera:";
        this.contadorCarreras.appendChild(titulo);
        for (const conteo of conteos) {
            const chip = document.createElement("span");
            chip.className = "conteo-chip";
            chip.textContent = `${conteo.carrera}: ${conteo.total}`;
            this.contadorCarreras.appendChild(chip);
        }
    }
    crearFila(estudiante) {
        const fila = document.createElement("tr");
        fila.appendChild(this.crearCelda(estudiante.codigo));
        fila.appendChild(this.crearCelda(estudiante.nombre));
        fila.appendChild(this.crearCelda(estudiante.email));
        fila.appendChild(this.crearCelda(estudiante.carrera));
        fila.appendChild(this.crearCelda(String(estudiante.anioIngreso)));
        const celdaAcciones = document.createElement("td");
        const contenedor = document.createElement("div");
        contenedor.className = "acciones-fila";
        contenedor.appendChild(this.crearBoton("credencial", estudiante.id, "Credencial"));
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
    // ---------- Exportación ----------
    /** Dispara la descarga de un archivo de texto/CSV. */
    descargarCSV(nombreArchivo, contenido) {
        const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombreArchivo;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);
    }
    // ---------- Credencial con QR ----------
    mostrarCredencial(estudiante) {
        this.modalContenido.innerHTML = "";
        this.modalQr.innerHTML = "";
        const campos = [
            ["Código", estudiante.codigo],
            ["Nombre", estudiante.nombre],
            ["Correo", estudiante.email],
            ["Carrera", estudiante.carrera],
            ["Año de ingreso", String(estudiante.anioIngreso)],
        ];
        for (const [etiqueta, valor] of campos) {
            const linea = document.createElement("p");
            linea.className = "credencial-linea";
            const fuerte = document.createElement("strong");
            fuerte.textContent = `${etiqueta}: `;
            linea.appendChild(fuerte);
            linea.appendChild(document.createTextNode(valor));
            this.modalContenido.appendChild(linea);
        }
        const texto = [
            "CREDENCIAL DE ESTUDIANTE",
            `Codigo: ${estudiante.codigo}`,
            `Nombre: ${estudiante.nombre}`,
            `Carrera: ${estudiante.carrera}`,
            `Anio: ${estudiante.anioIngreso}`,
            `Email: ${estudiante.email}`,
        ].join("\n");
        const fabrica = window.qrcode;
        if (typeof fabrica === "function") {
            try {
                const qr = fabrica(0, "M");
                qr.addData(texto);
                qr.make();
                this.modalQr.innerHTML = qr.createImgTag(4, 8);
            }
            catch (error) {
                this.modalQr.textContent = "No se pudo generar el código QR.";
                console.error(error);
            }
        }
        else {
            this.modalQr.textContent =
                "El generador de QR no está disponible (se necesita conexión a internet).";
        }
        this.modal.classList.remove("oculto");
    }
    cerrarCredencial() {
        this.modal.classList.add("oculto");
        this.modalQr.innerHTML = "";
        this.modalContenido.innerHTML = "";
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