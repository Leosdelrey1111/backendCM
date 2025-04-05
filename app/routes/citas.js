const express = require("express");
const router = express.Router();
const citaController = require("../controller/citaController"); // Nombre correcto

// Rutas principales
router.get("/", citaController.obtenerCitas);
router.post("/", citaController.crearCita);
router.put("/:id", citaController.editarCita);
router.delete("/:id", citaController.eliminarCita);
router.post("/filtrar", citaController.obtenerCitasFiltradas);
router.patch('/estado/:id', citaController.actualizarEstadoCita);
router.get("/citasmedico/:medicoId", citaController.obtenerCitasPorMedico);
router.get("/citasmedicoa/:medicoId", citaController.obtenerCitasPorMedicoAceptada);

module.exports = router;