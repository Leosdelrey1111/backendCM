const express = require('express');
const router = express.Router();
const { 
    getProductos, 
    registrarProducto, 
    editarProducto, 
    eliminarProducto, 
    getProductoById 
} = require('../controller/productoController');

// Rutas de productos
router.get('/', getProductos); // Obtener todos los productos
router.get('/:id', getProductoById); // Obtener producto por ID
router.post('/', registrarProducto); // Registrar un producto
router.put('/:id', editarProducto); // Editar un producto
router.delete('/:id', eliminarProducto); // Eliminar un producto

module.exports = router;
