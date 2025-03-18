const express = require('express');
const router = express.Router();
const { 
    getProductos, 
    registrarProducto, 
    editarProducto, 
    eliminarProducto, 
    getProductoById, 
    bajaTemporalProducto, 
    reactivarProducto 
} = require('../controller/productoController');

// Rutas de productos
router.get('/', getProductos); // Obtener todos los productos
router.get('/:id', getProductoById); // Obtener producto por ID
router.post('/', registrarProducto); // Registrar un producto
router.put('/:id', editarProducto); // Editar un producto
router.delete('/:id', eliminarProducto); // Eliminar un producto

// Ruta para baja temporal
router.patch('/baja-temporal/:id', bajaTemporalProducto);

// Nueva ruta para reactivar producto
router.patch('/reactivar/:id', reactivarProducto);

module.exports = router;
