# Registro de Estudiantes

Aplicación web para registrar estudiantes con sus datos básicos, desarrollada con
**TypeScript** siguiendo el patrón **MVC** y persistencia en **localStorage** (sin frameworks).

- **Materia:** Programación Orientada a Eventos

## Funcionalidades

- **Registrar** estudiantes con código, nombre, correo, carrera y año de ingreso.
- **Buscar** por código, nombre o correo (evento `input`).
- **Filtrar por carrera** (evento `change`); se combina con la búsqueda.
- **Ordenar** por nombre o por código.
- **Editar** (modo edición: los datos se cargan en el formulario y el botón cambia a "Actualizar").
- **Eliminar con confirmación**.
- Impedir **códigos y correos duplicados**.
- **Contador por carrera** y contador total de registros.
- **Exportar el listado a CSV** (respeta los filtros activos).
- Persistir automáticamente en **localStorage**.
- **Reto adicional:** generar una **credencial con código QR** por estudiante.

## Estructura del proyecto

```
LAB 2 POE/
├── index.html                     # Estructura de la interfaz
├── package.json                   # Scripts y dependencias
├── tsconfig.json                  # Configuración de TypeScript
├── README.md
├── src/
│   ├── main.ts                    # Punto de entrada (arma las capas)
│   ├── models/
│   │   ├── Estudiante.ts          # Entidad + validaciones
│   │   └── EstudianteModel.ts     # Colección + reglas (CRUD, filtros, orden, CSV)
│   ├── views/
│   │   └── EstudianteView.ts      # Formulario, tabla, filtros, modal QR
│   ├── controllers/
│   │   └── EstudianteController.ts# Coordina eventos y capas
│   ├── services/
│   │   └── StorageService.ts      # Persistencia en localStorage
│   └── styles/
│       └── styles.css             # Estilos de la interfaz
└── dist/                          # JavaScript compilado (generado por tsc)
```

## Cómo ejecutar

Requisitos: **Node.js** (para compilar) y un navegador moderno.

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Compilar TypeScript -> dist/
npm run build

# 3. Levantar un servidor local y abrir el navegador
npm start
```

> Importante: el proyecto usa **módulos ES** (`type="module"`), por lo que debe abrirse
> desde un servidor (`npm start`), no con doble clic sobre `index.html`.

Durante el desarrollo puedes recompilar automáticamente:

```bash
npm run watch
```

## Arquitectura MVC

| Capa | Clase | Responsabilidad |
|------|-------|-----------------|
| **Model** | `Estudiante` | Representa al estudiante y aplica las validaciones. |
| **Model** | `EstudianteModel` | Administra la colección: `updateEstudiante`, `deleteEstudiante`, `filterByCarrera`, `sortByNombre`, `sortByCodigo`, `getContadorPorCarrera`, `exportarCSV`. |
| **View** | `EstudianteView` | Única capa que conoce el DOM: formulario, tabla (`renderTabla`), contadores (`renderContador`), filtros y modal de QR. |
| **Controller** | `EstudianteController` | Maneja eventos y coordina: `handleUpdate`, `handleDelete`, `handleExport`, búsqueda y filtros combinados. |
| **Service** | `StorageService` | Guarda y recupera los datos desde `localStorage`. |

Flujo típico:

```
Usuario -> View (captura el evento) -> Controller (valida y decide)
        -> EstudianteModel (crea/actualiza/filtra) -> StorageService (persiste)
        -> View (repinta tabla y contadores)
```

## Validaciones

- **Código:** obligatorio, de 3 a 15 caracteres (letras, números o guiones) y **sin duplicados**.
- **Nombre:** obligatorio, mínimo 3 caracteres, solo letras/espacios.
- **Correo:** obligatorio, con formato válido (regex) y **único**.
- **Carrera:** obligatoria (se elige de la lista `CARRERAS`).
- **Año de ingreso:** obligatorio, 4 dígitos, entre **1950** y el año actual + 1.

Cada error se muestra junto a su campo con un mensaje específico.

## Nota sobre el código QR

La credencial usa la librería [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
cargada desde un CDN en `index.html`. Si no hay conexión a internet, el resto de la
aplicación funciona con normalidad y solo se desactiva la generación del QR.
