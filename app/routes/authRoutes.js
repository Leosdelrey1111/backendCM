const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/registro", authController.registrarUsuario);
router.post("/login", authController.iniciarSesion);

// Ruta para obtener todos los usuarios
router.get("/usuarios", authController.obtenerUsuarios);

module.exports = router;
