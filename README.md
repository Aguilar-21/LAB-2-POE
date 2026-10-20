# Registro de Estudiantes

Aplicación web para registrar estudiantes con sus datos básicos, desarrollada con
**TypeScript** siguiendo el patrón **MVC** y persistencia en **localStorage**
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

## Requisitos previos

Antes de empezar, instala:

- **Git** — <https://git-scm.com/downloads>
- **Node.js 18 o superior** (incluye `npm`) — <https://nodejs.org/>
- Un **navegador moderno** (Chrome, Edge, Firefox o Safari).

Para comprobar que están instalados, abre una terminal y ejecuta:

```bash
git --version
node --version
npm --version
```

Cada comando debe mostrar un número de versión. Si aparece "no se reconoce como comando",
instala la herramienta correspondiente y vuelve a abrir la terminal.

## Cómo ejecutar el proyecto (desde cero)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Aguilar-21/LAB-2-POE.git
```

Esto crea una carpeta llamada `LAB-2-POE` con todo el código.

### 2. Entrar a la carpeta del proyecto

```bash
cd LAB-2-POE
```

> El nombre de la carpeta es el que genera `git clone` a partir del repositorio.
> Si clonaste con otro nombre, usa ese.

### 3. Instalar dependencias

```bash
npm install
```

Solo es necesario la primera vez (o cuando cambien las dependencias). Instala TypeScript,
que se usa para compilar el proyecto.

### 4. Compilar TypeScript

```bash
npm run build
```

Genera los archivos `.js` dentro de `dist/`.

> El repositorio ya incluye `dist/` compilado, por lo que este paso es opcional si solo
> quieres ejecutar. Ejecútalo igualmente si modificaste algún archivo `.ts`.

### 5. Levantar el servidor local

```bash
npm start
```

Inicia un servidor con `serve` y muestra una dirección similar a:

```
http://localhost:3000
```

### 6. Abrir la aplicación

Abre en el navegador la dirección que muestra la terminal (normalmente
<http://localhost:3000>). Para detener el servidor, presiona `Ctrl + C`.

> **Importante:** el proyecto usa **módulos ES** (`type="module"`), por lo que debe abrirse
> desde un servidor (`npm start`), **no** con doble clic sobre `index.html`. Si lo abres como
> archivo (`file://`), el navegador bloqueará los módulos por CORS y la aplicación no cargará.

### Resumen rápido

```bash
git clone https://github.com/Aguilar-21/LAB-2-POE.git
cd LAB-2-POE
npm install
npm run build
npm start
```

### Desarrollo (recompilación automática)

Mientras desarrollas, puedes dejar TypeScript recompilando solo:

```bash
npm run watch
```

En otra terminal, mantén `npm start` ejecutándose y recarga el navegador tras cada cambio.

### Solución de problemas

- **`git: command not found` / "no se reconoce":** Git no está instalado o no está en el PATH.
- **`npm: command not found`:** Node.js no está instalado o no está en el PATH.
- **El puerto 3000 está ocupado:** `npx serve . -l 3001` y abre el nuevo puerto.
- **La página sale en blanco:** asegúrate de abrirla con `npm start`, no con `file://`, y de
  haber ejecutado `npm run build` (deben existir los `.js` en `dist/`).
- **El QR no aparece:** la librería se carga desde un CDN; necesita conexión a internet.
  El resto de la aplicación funciona igual.

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

---

## Documento técnico: mejoras y decisiones de diseño

Este apartado describe las mejoras incorporadas al proyecto y, sobre todo, explica las
decisiones técnicas tomadas al implementarlas: por qué se eligió cada enfoque, qué
alternativas se evaluaron y qué consecuencias tienen sobre el mantenimiento y la evolución
del sistema.

### 1. Introducción

El proyecto es una aplicación web de una sola página (SPA) que permite registrar estudiantes
con persistencia local en el navegador. Está desarrollada en TypeScript, sin framework,
siguiendo el patrón Modelo-Vista-Controlador (MVC).

El objetivo de este documento no es solo enumerar funciones nuevas, sino justificar el diseño
detrás de ellas.

### 2. Punto de partida y alcance de la mejora

La versión inicial permitía únicamente registrar y listar estudiantes con tres datos: código,
nombre y carrera. La mejora amplía el dominio y la experiencia de uso sin reescribir el
sistema, apoyándose en la estructura MVC ya existente.

- Ampliación del modelo de datos: se agregaron **año de ingreso** y **correo electrónico**.
- Gestión completa (CRUD): **editar** y **eliminar** estudiantes existentes.
- Exploración de datos: **búsqueda**, **filtro por carrera** y **ordenamiento**.
- Resumen visual: **contador de estudiantes por carrera**.
- Interoperabilidad: **exportación del listado a CSV**.
- Valor agregado: **credencial con código QR**.

Estas mejoras se identifican en el código con etiquetas del tipo `[NUEVO RF-01]` a
`[NUEVO RF-10]`, lo que permite localizar rápidamente cada cambio durante la revisión o la
sustentación.

### 3. Arquitectura y decisiones de diseño

#### 3.1. MVC puro

**Decisión:** mantener una arquitectura Modelo-Vista-Controlador escrita a mano, sin Angular,
React ni Vue.

El proyecto es académico y su propósito es demostrar la comprensión del patrón MVC y del
manejo de eventos. Usar un framework ocultaría precisamente lo que se quiere evidenciar: cómo
se comunican las capas. Además, MVC puro reduce el tamaño del bundle, elimina dependencias y
hace que el código sea legible de principio a fin.

La organización resultante es:

```
src/
  models/      Estudiante.ts  y  EstudianteModel.ts
  views/       EstudianteView.ts
  controllers/ EstudianteController.ts
  services/    StorageService.ts
  main.ts      (punto de entrada / cableado)
```

El cableado de las dependencias se hace en un único lugar (`main.ts`), de forma explícita:

```ts
const vista = new EstudianteView();
const modelo = new EstudianteModel();
const almacenamiento = new StorageService("registro-estudiantes");
const controlador = new EstudianteController(vista, modelo, almacenamiento);
controlador.iniciar();
```

#### 3.2. TypeScript compilado a módulos ES

**Decisión:** escribir en TypeScript y compilar a ES Modules nativos (target ES2020),
sirviendo el resultado como archivos `.js` con `import`/`export`.

TypeScript aporta tipado estático que detecta errores antes de ejecutar (por ejemplo, un campo
mal escrito o un método inexistente). Se eligieron módulos ES nativos en lugar de
empaquetadores (Webpack, Vite) porque el navegador moderno ya los soporta y así el proyecto
permanece simple: no hay paso de bundling y cada archivo corresponde a un módulo.

**Consecuencia:** la aplicación debe servirse por HTTP (por ejemplo con `npm start`). Abrir
`index.html` directamente con `file://` falla por la política CORS de los módulos ES. Es un
costo aceptable a cambio de no añadir empaquetado.

#### 3.3. `EstudianteModel` como modelo de colección

**Decisión:** separar la entidad `Estudiante` (un registro) del modelo de colección
`EstudianteModel` (el conjunto de registros y sus operaciones).

En la versión inicial la lógica de la lista vivía mezclada con el controlador. Al crecer los
requisitos, el controlador habría acumulado búsqueda, filtros, orden, conteos y exportación. Se
introdujo `EstudianteModel` para concentrar todas las operaciones sobre la colección, dejando
al controlador solo la coordinación.

Ventajas observadas:

- El controlador queda delgado y legible.
- Las operaciones de la colección son reutilizables y comprobables de forma aislada.
- La vista nunca conoce cómo se almacenan o calculan los datos; solo recibe arreglos ya listos.

#### 3.4. La validación como única fuente de verdad

**Decisión:** centralizar todas las reglas de validación en un método estático
`Estudiante.validar()`, que devuelve un objeto de errores por campo.

Se evaluó validar en la vista (al recibir el formulario) o en el controlador. Ambas opciones
dispersan las reglas y permiten que se desincronicen. Al colocar la validación en el modelo,
cualquier capa que necesite crear o actualizar un estudiante obtiene las mismas reglas.

Reglas centralizadas:

- **Código:** obligatorio, de 3 a 15 caracteres alfanuméricos o guiones.
- **Nombre:** obligatorio, mínimo 3 letras, solo letras y espacios.
- **Carrera:** obligatoria (proviene de un catálogo fijo).
- **Año de ingreso:** obligatorio, de 4 dígitos, entre 1950 y el año actual + 1.
- **Correo:** obligatorio y con formato válido (expresión regular).

Además, se separaron las reglas "de formato" (`validar`) de las reglas "de unicidad"
(`existeCodigo` / `existeEmail` en el modelo de colección), porque la unicidad depende del
conjunto completo y no de un registro aislado. El controlador combina ambos resultados antes
de guardar.

#### 3.5. Persistencia abstraída en `StorageService`

**Decisión:** mantener el acceso a `localStorage` detrás de un servicio dedicado, con un
método de normalización de los datos leídos.

El objetivo es que ni el modelo ni el controlador conozcan `localStorage`. Si en el futuro se
migrara a una API REST o a IndexedDB, solo cambiaría `StorageService`. La normalización cumple
una función clave de compatibilidad: los registros guardados por la versión anterior no tenían
`email` ni `año de ingreso`; al leerlos, el servicio los completa con valores por defecto en
lugar de fallar. Así, la mejora de los datos no rompe las instalaciones existentes.

#### 3.6. Delegación de eventos en la tabla

**Decisión:** registrar un único listener en el `<tbody>` para los botones de cada fila, en
lugar de asignar un listener por botón.

La tabla se reconstruye por completo en cada refresco. Si cada fila creara sus propios
listeners, se generarían y destruirían continuamente, aumentando el consumo de memoria y el
riesgo de fugas. Con delegación se aprovecha el burbujeo de eventos: se identifica el botón
con `event.target.closest('button[data-accion="..."]')` y se lee su `data-id`.

```ts
this.cuerpoTabla.addEventListener("click", (evento) => {
  const boton = (evento.target as HTMLElement)
    .closest<HTMLButtonElement>(`button[data-accion="${accion}"]`);
  if (boton?.dataset.id) manejador(boton.dataset.id);
});
```

Es la técnica idiomática para listas dinámicas y mantiene el número de listeners constante.

#### 3.7. Generación de identificadores

**Decisión:** usar `crypto.randomUUID()` cuando está disponible, con un respaldo manual (marca
de tiempo + número aleatorio) para entornos antiguos.

Cada estudiante recibe un id interno distinto del código académico, lo que permite renombrar
el código sin perder la identidad del registro y evita colisiones por causa de valores
repetidos.

#### 3.8. Exportación a CSV con escapado y BOM

**Decisión:** generar el CSV en el modelo (`exportarCSV`) y disparar la descarga en la vista
(`descargarCSV`), incluyendo escape de comillas y marca BOM UTF-8.

El escapado es necesario porque un nombre o carrera puede contener comas, punto y coma o
comillas, que romperían las columnas. Se duplican las comillas internas y se encierra el valor
entre comillas. La BOM (carácter `\uFEFF` al inicio) asegura que Excel en español reconozca el
archivo como UTF-8 y no destruya las tildes.

```ts
if (/[",\r\n;]/.test(texto)) {
  return '"' + texto.replace(/"/g, '""') + '"';
}
```

Se exporta el listado según los filtros activos, de modo que el archivo refleje exactamente lo
que el usuario ve en pantalla.

#### 3.9. Credencial con código QR y degradación elegante

**Decisión:** usar la librería `qrcode-generator` cargada desde CDN y encapsular su uso, con un
mensaje alternativo si no está disponible.

Se prefirió una librería externa antes que implementar el algoritmo QR a mano, que no aporta
valor al objetivo del curso. Sin embargo, depender de la red implica que la función puede
fallar fuera de línea. Por eso se comprueba la existencia de la fábrica (`window.qrcode`) antes
de usarla y, si no está, se informa al usuario con un mensaje claro en lugar de lanzar un
error. Además, el modal se cierra con el botón, al hacer clic fuera o con la tecla `Escape`,
cubriendo las convenciones de accesibilidad esperadas.

### 4. Resumen de mejoras implementadas

 Mejora | Capa principal |
--------|----------------|
 Campo "año de ingreso" + validación de rango | Modelo / Vista |
 Editar estudiante (CRUD completo) | Controlador / Modelo |
 Eliminar estudiante con confirmación | Controlador / Modelo |
 Filtro por carrera | Modelo / Vista |
 Ordenar por nombre y por código | Modelo / Vista |
 Campo "correo electrónico" + unicidad + formato | Modelo / Vista |
 Contador de estudiantes por carrera | Modelo / Vista |
 Exportación a CSV | Modelo / Vista |
 Credencial con código QR | Controlador / Vista |

### 5. Decisiones y alternativas consideradas

#### 5.1. Un solo formulario para crear y editar

**Alternativas:** (a) usar un formulario separado para la edición; (b) reutilizar el formulario
principal con un estado interno `idEnEdicion`.

Se eligió (b). Reutilizar el formulario reduce la duplicación de HTML y garantiza que las
mismas validaciones apliquen al crear y al editar. El estado `idEnEdicion` en el controlador
distingue ambos casos: si tiene valor, se actualiza; si es `null`, se crea. El botón cambia
entre "Registrar" y "Actualizar" según el modo.

#### 5.2. Filtros combinados mediante composición

**Alternativas:** (a) escribir una función monolítica que aplique todo a la vez; (b) componer
operaciones pequeñas (buscar → filtrar → ordenar).

Se eligió (b). El método `consultar()` encadena funciones independientes, cada una con una sola
responsabilidad. Esto facilita probar y reutilizar cada operación por separado y hace trivial
añadir un nuevo criterio de orden en el futuro.

#### 5.3. Unicidad comprobada en el modelo, no en el controlador

La comprobación de código y correo duplicados requiere ver toda la colección; por eso reside en
`EstudianteModel`. El controlador solo pregunta "¿existe?" y decide el mensaje. Así se mantiene
la regla de que el modelo conoce los datos y el controlador conoce el flujo.

#### 5.4. Mensajes de error por campo en la vista

Se decidió mostrar cada error junto a su campo (no un único mensaje genérico), porque reduce la
carga cognitiva del usuario. La vista recibe un objeto de errores indexado por campo y lo pinta
en el `<small>` correspondiente, añadiendo la clase `invalido` al control.

#### 5.5. Comentarios  en el código

Durante la sustentación se marcaron las partes nuevas con etiquetas. Es una decisión de
trazabilidad: permite ubicar y demostrar cada requisito. Se documenta aquí para recordar que
dichos comentarios son temporales y pueden retirarse en la entrega final si el docente prefiere
el código limpio.

### 6. Riesgos, límites y deuda técnica

- **Dependencia de CDN para el QR:** sin internet, la credencial muestra datos pero no el
  código. Mejora futura: empaquetar la librería localmente.
- **`localStorage` como almacenamiento:** tiene límite de tamaño y es propio de cada navegador.
  Mejora futura: migrar a IndexedDB o a un backend.
- **Búsqueda y filtros en memoria:** aceptable para cientos de registros, pero no escala a
  miles. Mejora futura: paginación o consultas al servidor.
- **Sin pruebas automatizadas:** la verificación fue manual y con una prueba de lógica puntual.
  Mejora futura: añadir pruebas unitarias con Vitest o Jest.
- **Necesita servidor local:** los módulos ES no funcionan con `file://`. Se mitiga con
  `npm start`.

### 7. Conclusiones

Las mejoras ampliaron funcionalidad (CRUD completo, búsqueda, filtros, orden, contador, CSV y
credencial QR) sin sacrificar la claridad de la arquitectura. Cada decisión buscó mantener una
regla simple: el modelo conoce los datos y las reglas de negocio, la vista conoce el DOM, el
controlador coordina y el servicio aísla la persistencia.

El resultado es un sistema más completo y, a la vez, más ordenado que la versión inicial, con
puntos de extensión claros para futuras mejoras.

---

## Nota sobre el código QR

La credencial usa la librería [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
cargada desde un CDN en `index.html`. Si no hay conexión a internet, el resto de la
aplicación funciona con normalidad y solo se desactiva la generación del QR.
