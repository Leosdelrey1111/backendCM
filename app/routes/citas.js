const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/citaController");

// ————————————————————————
// DISPONIBILIDAD (parámetro)
router.get(
  "/disponibilidad/:medicoId",
  ctrl.obtenerDisponibilidad
);

// Otras rutas con parámetros
router.get("/usuario/:usuarioId",      ctrl.obtenerCitasPorUsuario);
router.get("/citasmedico/:medicoId",   ctrl.obtenerCitasPorMedico);
router.get("/citasmedicoa/:medicoId",  ctrl.obtenerCitasPorMedicoAceptada);
router.post("/filtrar",                ctrl.obtenerCitasFiltradas);
router.patch("/estado/:id",            ctrl.actualizarEstadoCita);

// ————————————————————————
// NUEVA RUTA PARA CANCELAR CITA
router.patch("/cancelar/:id",          ctrl.cancelarCita);  // Aquí agregamos la nueva ruta

// ————————————————————————
// Rutas “planas”
router.get("/",    ctrl.obtenerCitas);
router.post("/",   ctrl.crearCita);
router.put("/:id", ctrl.editarCita);
// Otras rutas con parámetros
router.get("/usuario/:usuarioId", ctrl.obtenerCitasPorUsuario);

module.exports = router;
