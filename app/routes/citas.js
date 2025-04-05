const express = require("express");
const router = express.Router();
const citaController = require("../controller/citaController"); // Nombre correcto

// Rutas principales
router.get("/", citaController.obtenerCitas);
router.post("/", citaController.crearCita);
router.put("/:id", citaController.editarCita);
router.delete("/:id", citaController.eliminarCita);
router.post("/filtrar", citaController.obtenerCitasFiltradas);
router.put("/estado/:id", citaController.actualizarEstadoCita);
// routes/citas.js
router.get('/usuario/:usuarioId', citaController.obtenerCitasPorUsuario);


module.exports = router;