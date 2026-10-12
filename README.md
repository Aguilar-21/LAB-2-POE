# Registro de Estudiantes

Aplicación web para registrar estudiantes con sus datos básicos (código, nombre y carrera),
desarrollada con **TypeScript** siguiendo el patrón **MVC** y persistencia en **localStorage**.

- **Materia:** Programación Orientada a Eventos

## Funcionalidades

- Registrar estudiantes con **código**, **nombre** y **carrera**.
- Buscar por **código o nombre**.
- **Editar** y **eliminar** estudiantes.
- Impedir **códigos duplicados**.
- Mostrar el listado en una **tabla**.
- Persistir los datos en **localStorage**.

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
│   │   └── Estudiante.ts          # Datos + validaciones
│   ├── views/
│   │   └── EstudianteView.ts      # Tabla, formulario y mensajes
│   ├── controllers/
│   │   └── EstudianteController.ts# CRUD + validación de duplicados
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
> Si tienes `serve` instalado globalmente también puedes ejecutar `serve .`.

Durante el desarrollo puedes recompilar automáticamente:

```bash
npm run watch
```

## Arquitectura MVC

| Capa | Clase | Responsabilidad |
|------|-------|-----------------|
| **Model** | `Estudiante` | Representa al estudiante y aplica las validaciones. |
| **View** | `EstudianteView` | Única capa que conoce el DOM: formulario, tabla y mensajes. |
| **Controller** | `EstudianteController` | Maneja eventos, coordina el modelo, la vista y el almacenamiento, y evita códigos duplicados. |
| **Service** | `StorageService` | Guarda y recupera los datos desde `localStorage`. |

Flujo típico de un registro:

```
Usuario -> View (captura el submit) -> Controller (valida)
        -> Model (crea/actualiza)   -> Service (persiste) -> View (repinta la tabla)
```

## Validaciones

- **Código:** obligatorio, de 3 a 15 caracteres (letras, números o guiones) y **sin duplicados**.
- **Nombre:** obligatorio, mínimo 3 caracteres y solo letras/espacios.
- **Carrera:** obligatoria (se elige de la lista).
