import { EstudianteController } from "./controllers/EstudianteController.js";
import { EstudianteModel } from "./models/EstudianteModel.js";
import { EstudianteView } from "./views/EstudianteView.js";
import { StorageService } from "./services/StorageService.js";
/** Punto de entrada: arma las capas del patrón MVC. */
document.addEventListener("DOMContentLoaded", () => {
    const vista = new EstudianteView();
    const modelo = new EstudianteModel();
    const almacenamiento = new StorageService("registro-estudiantes");
    const controlador = new EstudianteController(vista, modelo, almacenamiento);
    controlador.iniciar();
});
//# sourceMappingURL=main.js.map