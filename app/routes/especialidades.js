const express = require("express");
const router = express.Router();
const especialidadController = require("../controller/especialidadesController");

router.get("/", especialidadController.obtenerEspecialidades);

module.exports = router;
