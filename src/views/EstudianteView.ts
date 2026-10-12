import type { ErroresValidacion, EstudianteData } from "../models/Estudiante.js";

export type TipoMensaje = "exito" | "error" | "info";

export interface DatosFormulario {
  codigo: string;
  nombre: string;
  carrera: string;
}

/**
 * Vista: es la única clase que conoce el DOM.
 * No aplica reglas de negocio ni accede al almacenamiento.
 */
export class EstudianteView {
  private readonly form: HTMLFormElement;
  private readonly inputCodigo: HTMLInputElement;
  private readonly inputNombre: HTMLInputElement;
  private readonly selectCarrera: HTMLSelectElement;
  private readonly btnGuardar: HTMLButtonElement;
  private readonly btnCancelar: HTMLButtonElement;
  private readonly cajaMensaje: HTMLDivElement;
  private readonly busqueda: HTMLInputElement;
  private readonly cuerpoTabla: HTMLTableSectionElement;
  private readonly sinResultados: HTMLParagraphElement;
  private readonly contador: HTMLSpanElement;
  private readonly errorCodigo: HTMLElement;
  private readonly errorNombre: HTMLElement;
  private readonly errorCarrera: HTMLElement;

  private temporizador: number | null = null;

  constructor() {
    this.form = this.obtener<HTMLFormElement>("form-estudiante");
    this.inputCodigo = this.obtener<HTMLInputElement>("codigo");
    this.inputNombre = this.obtener<HTMLInputElement>("nombre");
    this.selectCarrera = this.obtener<HTMLSelectElement>("carrera");
    this.btnGuardar = this.obtener<HTMLButtonElement>("btn-guardar");
    this.btnCancelar = this.obtener<HTMLButtonElement>("btn-cancelar");
    this.cajaMensaje = this.obtener<HTMLDivElement>("mensaje");
    this.busqueda = this.obtener<HTMLInputElement>("busqueda");
    this.cuerpoTabla = this.obtener<HTMLTableSectionElement>("cuerpo-tabla");
    this.sinResultados = this.obtener<HTMLParagraphElement>("sin-resultados");
    this.contador = this.obtener<HTMLSpanElement>("contador");
    this.errorCodigo = this.obtener<HTMLElement>("error-codigo");
    this.errorNombre = this.obtener<HTMLElement>("error-nombre");
    this.errorCarrera = this.obtener<HTMLElement>("error-carrera");
  }

  // ---------- Enlace de eventos ----------

  alEnviar(manejador: (datos: DatosFormulario) => void): void {
    this.form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      manejador(this.obtenerDatos());
    });
  }

  alBuscar(manejador: (texto: string) => void): void {
    this.busqueda.addEventListener("input", () => {
      manejador(this.busqueda.value);
    });
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

  private alHacerClicEnAccion(accion: "editar" | "eliminar", manejador: (id: string) => void): void {
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

  obtenerDatos(): DatosFormulario {
    return {
      codigo: this.inputCodigo.value,
      nombre: this.inputNombre.value,
      carrera: this.selectCarrera.value,
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
    this.selectCarrera.value = estudiante.carrera;
    this.limpiarErrores();
    this.inputCodigo.focus();
  }

  modoEdicion(activo: boolean): void {
    this.btnGuardar.textContent = activo ? "Guardar cambios" : "Registrar";
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
    if (errores.carrera) {
      this.errorCarrera.textContent = errores.carrera;
      this.selectCarrera.classList.add("invalido");
    }
  }

  limpiarErrores(): void {
    this.errorCodigo.textContent = "";
    this.errorNombre.textContent = "";
    this.errorCarrera.textContent = "";
    this.inputCodigo.classList.remove("invalido");
    this.inputNombre.classList.remove("invalido");
    this.selectCarrera.classList.remove("invalido");
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

  textoBusqueda(): string {
    return this.busqueda.value;
  }

  // ---------- Tabla ----------

  render(estudiantes: EstudianteData[], total: number): void {
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

  private crearFila(estudiante: EstudianteData): HTMLTableRowElement {
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

  private crearCelda(texto: string): HTMLTableCellElement {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
  }

  private crearBoton(
    accion: "editar" | "eliminar",
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

  private obtener<T extends HTMLElement>(id: string): T {
    const elemento = document.getElementById(id);
    if (!elemento) {
      throw new Error(`No se encontró el elemento con id "${id}" en el HTML.`);
    }
    return elemento as T;
  }
}
