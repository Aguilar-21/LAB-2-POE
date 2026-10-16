import {
  CARRERAS,
  type ErroresValidacion,
  type EstudianteData,
  type EstudianteEntrada,
} from "../models/Estudiante.js";
import type { ConteoPorCarrera, CriterioOrden } from "../models/EstudianteModel.js";

export type TipoMensaje = "exito" | "error" | "info";

interface QrCodeInstance {
  addData(data: string): void;
  make(): void;
  createImgTag(cellSize?: number, margin?: number): string;
}

type QrCodeFactory = (typeNumber: number, errorCorrectionLevel: string) => QrCodeInstance;

declare global {
  interface Window {
    qrcode?: QrCodeFactory;
  }
}

/**
 * Vista: es la única clase que conoce el DOM.
 * No aplica reglas de negocio ni accede al almacenamiento.
 */
export class EstudianteView {
  private readonly form: HTMLFormElement;
  private readonly inputCodigo: HTMLInputElement;
  private readonly inputNombre: HTMLInputElement;
  private readonly inputEmail: HTMLInputElement;
  private readonly selectCarrera: HTMLSelectElement;
  private readonly inputAnio: HTMLInputElement;
  private readonly btnGuardar: HTMLButtonElement;
  private readonly btnCancelar: HTMLButtonElement;
  private readonly cajaMensaje: HTMLDivElement;
  private readonly busqueda: HTMLInputElement;
  private readonly filtroCarrera: HTMLSelectElement;
  private readonly ordenar: HTMLSelectElement;
  private readonly btnExportar: HTMLButtonElement;
  private readonly cuerpoTabla: HTMLTableSectionElement;
  private readonly sinResultados: HTMLParagraphElement;
  private readonly contador: HTMLSpanElement;
  private readonly contadorCarreras: HTMLDivElement;

  private readonly modal: HTMLDivElement;
  private readonly modalContenido: HTMLDivElement;
  private readonly modalQr: HTMLDivElement;
  private readonly modalCerrar: HTMLButtonElement;

  private readonly errorCodigo: HTMLElement;
  private readonly errorNombre: HTMLElement;
  private readonly errorEmail: HTMLElement;
  private readonly errorCarrera: HTMLElement;
  private readonly errorAnio: HTMLElement;

  private temporizador: number | null = null;

  constructor() {
    this.form = this.obtener<HTMLFormElement>("form-estudiante");
    this.inputCodigo = this.obtener<HTMLInputElement>("codigo");
    this.inputNombre = this.obtener<HTMLInputElement>("nombre");
    this.inputEmail = this.obtener<HTMLInputElement>("email");
    this.selectCarrera = this.obtener<HTMLSelectElement>("carrera");
    this.inputAnio = this.obtener<HTMLInputElement>("anio-ingreso");
    this.btnGuardar = this.obtener<HTMLButtonElement>("btn-guardar");
    this.btnCancelar = this.obtener<HTMLButtonElement>("btn-cancelar");
    this.cajaMensaje = this.obtener<HTMLDivElement>("mensaje");
    this.busqueda = this.obtener<HTMLInputElement>("busqueda");
    this.filtroCarrera = this.obtener<HTMLSelectElement>("filtro-carrera");
    this.ordenar = this.obtener<HTMLSelectElement>("ordenar");
    this.btnExportar = this.obtener<HTMLButtonElement>("btn-exportar");
    this.cuerpoTabla = this.obtener<HTMLTableSectionElement>("cuerpo-tabla");
    this.sinResultados = this.obtener<HTMLParagraphElement>("sin-resultados");
    this.contador = this.obtener<HTMLSpanElement>("contador");
    this.contadorCarreras = this.obtener<HTMLDivElement>("contador-carreras");

    this.modal = this.obtener<HTMLDivElement>("modal-credencial");
    this.modalContenido = this.obtener<HTMLDivElement>("modal-contenido");
    this.modalQr = this.obtener<HTMLDivElement>("modal-qr");
    this.modalCerrar = this.obtener<HTMLButtonElement>("modal-cerrar");

    this.errorCodigo = this.obtener<HTMLElement>("error-codigo");
    this.errorNombre = this.obtener<HTMLElement>("error-nombre");
    this.errorEmail = this.obtener<HTMLElement>("error-email");
    this.errorCarrera = this.obtener<HTMLElement>("error-carrera");
    this.errorAnio = this.obtener<HTMLElement>("error-anio");

    this.poblarCarreras();
    this.conectarCierreCredencial();
  }

  // ---------- Enlace de eventos ----------

  alEnviar(manejador: (entrada: EstudianteEntrada) => void): void {
    this.form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      manejador(this.obtenerDatos());
    });
  }

  alBuscar(manejador: () => void): void {
    this.busqueda.addEventListener("input", () => manejador());
  }

  alFiltrarCarrera(manejador: () => void): void {
    this.filtroCarrera.addEventListener("change", () => manejador());
  }

  alOrdenar(manejador: () => void): void {
    this.ordenar.addEventListener("change", () => manejador());
  }

  alExportar(manejador: () => void): void {
    this.btnExportar.addEventListener("click", () => manejador());
  }

  alCancelar(manejador: () => void): void {
    this.btnCancelar.addEventListener("click", () => manejador());
  }

  alEditar(manejador: (id: string) => void): void {
    this.alHacerClicEnAccion("editar", manejador);
  }

  alEliminar(manejador: (id: string) => void): void {
    this.alHacerClicEnAccion("eliminar", manejador);
  }

  alVerCredencial(manejador: (id: string) => void): void {
    this.alHacerClicEnAccion("credencial", manejador);
  }

  private conectarCierreCredencial(): void {
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

  private alHacerClicEnAccion(
    accion: "editar" | "eliminar" | "credencial",
    manejador: (id: string) => void
  ): void {
    this.cuerpoTabla.addEventListener("click", (evento) => {
      const objetivo = evento.target as HTMLElement;
      const boton = objetivo.closest<HTMLButtonElement>(`button[data-accion="${accion}"]`);
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

  obtenerDatos(): EstudianteEntrada {
    return {
      codigo: this.inputCodigo.value,
      nombre: this.inputNombre.value,
      email: this.inputEmail.value,
      carrera: this.selectCarrera.value,
      anioIngreso: this.inputAnio.value,
    };
  }

  limpiarFormulario(): void {
    this.form.reset();
    this.limpiarErrores();
    this.inputCodigo.focus();
  }

  llenarFormulario(estudiante: EstudianteData): void {
    this.inputCodigo.value = estudiante.codigo;
    this.inputNombre.value = estudiante.nombre;
    this.inputEmail.value = estudiante.email;
    this.selectCarrera.value = estudiante.carrera;
    this.inputAnio.value = String(estudiante.anioIngreso);
    this.limpiarErrores();
    this.inputCodigo.focus();
  }

  modoEdicion(activo: boolean): void {
    this.btnGuardar.textContent = activo ? "Actualizar" : "Registrar";
    this.btnCancelar.classList.toggle("oculto", !activo);
  }

  mostrarErrores(errores: ErroresValidacion): void {
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

  limpiarErrores(): void {
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

  textoBusqueda(): string {
    return this.busqueda.value;
  }

  carreraFiltro(): string {
    return this.filtroCarrera.value;
  }

  criterioOrden(): CriterioOrden {
    const valor = this.ordenar.value;
    return valor === "nombre" || valor === "codigo" ? valor : "ninguno";
  }

  private poblarCarreras(): void {
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

  mostrarMensaje(texto: string, tipo: TipoMensaje = "info", autoOcultarMs = 3500): void {
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

  ocultarMensaje(): void {
    this.cajaMensaje.textContent = "";
    this.cajaMensaje.className = "mensaje oculto";
  }

  confirmar(texto: string): boolean {
    return window.confirm(texto);
  }

  // ---------- Tabla ----------

  renderTabla(estudiantes: EstudianteData[], total: number): void {
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

  renderContador(conteos: ConteoPorCarrera[]): void {
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

  private crearFila(estudiante: EstudianteData): HTMLTableRowElement {
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

  private crearCelda(texto: string): HTMLTableCellElement {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  private crearBoton(
    accion: "editar" | "eliminar" | "credencial",
    id: string,
    etiqueta: string
  ): HTMLButtonElement {
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
  descargarCSV(nombreArchivo: string, contenido: string): void {
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

  mostrarCredencial(estudiante: EstudianteData): void {
    this.modalContenido.innerHTML = "";
    this.modalQr.innerHTML = "";

    const campos: Array<[string, string]> = [
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
      } catch (error) {
        this.modalQr.textContent = "No se pudo generar el código QR.";
        console.error(error);
      }
    } else {
      this.modalQr.textContent =
        "El generador de QR no está disponible (se necesita conexión a internet).";
    }

    this.modal.classList.remove("oculto");
  }

  cerrarCredencial(): void {
    this.modal.classList.add("oculto");
    this.modalQr.innerHTML = "";
    this.modalContenido.innerHTML = "";
  }

  private obtener<T extends HTMLElement>(id: string): T {
    const elemento = document.getElementById(id);
    if (!elemento) {
      throw new Error(`No se encontró el elemento con id "${id}" en el HTML.`);
    }
    return elemento as T;
  }
}
