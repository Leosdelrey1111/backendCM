const express = require('express');
const router = express.Router();
const { getProductos, registrarProducto, editarProducto, eliminarProducto, getProductoById } = require('../controller/productoController');

// Rutas de productos
router.get('/', getProductos);
router.get('/:id', getProductoById);  // Ruta para obtener producto por ID
router.post('/', registrarProducto);
router.put('/:id', editarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
