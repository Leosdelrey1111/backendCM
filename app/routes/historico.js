const express = require("express");
const router = express.Router();
const historicoController = require("../controller/historicoController");

router.get("/", historicoController.obtenerHistorico);

module.exports = router;
