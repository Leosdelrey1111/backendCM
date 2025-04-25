const express = require("express");
const router = express.Router();
const historicoController = require("../controller/historicoController");

// Obtener el historial completo
router.get("/", historicoController.obtenerHistorico);

// Obtener historial por paciente (si es necesario)
router.get("/paciente/:id", historicoController.obtenerHistorialPorPaciente);

// Obtener historial por usuario
router.get("/", historicoController.obtenerHistoricoPorUsuario);

module.exports = router;
