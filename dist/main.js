import { EstudianteController } from "./controllers/EstudianteController.js";
import { EstudianteView } from "./views/EstudianteView.js";
import { StorageService } from "./services/StorageService.js";
/** Punto de entrada: arma las tres capas del patrón MVC. */
document.addEventListener("DOMContentLoaded", () => {
    const vista = new EstudianteView();
    const almacenamiento = new StorageService("registro-estudiantes");
    const controlador = new EstudianteController(vista, almacenamiento);
    controlador.iniciar();
});
//# sourceMappingURL=main.js.map